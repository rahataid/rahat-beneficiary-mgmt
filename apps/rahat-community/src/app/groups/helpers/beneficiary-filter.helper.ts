import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  BeneficiarySortDto,
  ColumnConditionDto,
  ColumnFilterDto,
  FilterColumnType,
  FilterOperator,
} from '../dto/search-group-beneficiaries.dto';

/**
 * Excel-like filtering for beneficiaries inside a group.
 *
 * Everything is built as parameterised raw SQL (Prisma.sql) so primary columns
 * and keys inside the `extras` JSONB column can be filtered, compared and
 * sorted the same way. Only column names from PRIMARY_COLUMN_TYPES are ever
 * written into the SQL text; every value and every extras key is a bound
 * parameter.
 */

/** Primary Beneficiary columns and their filter type (see schema.prisma). */
const PRIMARY_COLUMN_TYPES: Record<string, FilterColumnType> = {
  uuid: 'text',
  firstName: 'text',
  lastName: 'text',
  govtIDNumber: 'text',
  walletAddress: 'text',
  phone: 'text',
  email: 'text',
  location: 'text',
  koboId: 'text',
  notes: 'text',
  createdBy: 'text',
  gender: 'enum',
  bankedStatus: 'enum',
  internetStatus: 'enum',
  phoneStatus: 'enum',
  id: 'number',
  latitude: 'number',
  longitude: 'number',
  birthDate: 'date',
  createdAt: 'date',
  updatedAt: 'date',
  archived: 'boolean',
  isVerified: 'boolean',
};

const OPERATORS_BY_TYPE: Record<FilterColumnType, FilterOperator[]> = {
  text: [
    'contains',
    'notContains',
    'equals',
    'notEquals',
    'startsWith',
    'endsWith',
    'isEmpty',
    'isNotEmpty',
    'in',
    'notIn',
  ],
  enum: [
    'contains',
    'notContains',
    'equals',
    'notEquals',
    'startsWith',
    'endsWith',
    'isEmpty',
    'isNotEmpty',
    'in',
    'notIn',
  ],
  number: [
    'equals',
    'notEquals',
    'gt',
    'gte',
    'lt',
    'lte',
    'between',
    'isEmpty',
    'isNotEmpty',
    'in',
    'notIn',
  ],
  date: [
    'equals',
    'notEquals',
    'gt',
    'gte',
    'lt',
    'lte',
    'between',
    'isEmpty',
    'isNotEmpty',
    'in',
    'notIn',
  ],
  boolean: ['equals', 'notEquals', 'isEmpty', 'isNotEmpty', 'in', 'notIn'],
};

// Passed as bound parameters so no escaping issues inside the SQL text.
const NUMBER_REGEX = '^\\s*-?[0-9]+(\\.[0-9]+)?\\s*$';
const ISO_DATE_REGEX = '^\\s*[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])';

export const GROUP_BENEFICIARY_FROM = Prisma.sql`
  FROM "tbl_beneficiary_groups" bg
  JOIN "tbl_beneficiaries" b ON b."uuid" = bg."beneficiaryUID"
`;

export interface ResolvedColumn {
  field: string;
  type: FilterColumnType;
  isPrimary: boolean;
  /** Raw text value (for contains / startsWith / ...). */
  text: Prisma.Sql;
  /** Text shown in the distinct list and used by equals / in. Dates are YYYY-MM-DD. */
  display: Prisma.Sql;
  /** Numeric value or NULL when not a number. */
  num: Prisma.Sql;
  /** YYYY-MM-DD text or NULL when not a date (ISO text compares correctly). */
  date: Prisma.Sql;
}

export function resolveColumn(
  field: string,
  clientType?: FilterColumnType,
): ResolvedColumn {
  const primaryType = PRIMARY_COLUMN_TYPES[field];

  if (primaryType) {
    // Safe: `field` is a key of PRIMARY_COLUMN_TYPES (whitelist).
    const col = Prisma.raw(`b."${field}"`);
    const date = Prisma.sql`to_char(${col}, 'YYYY-MM-DD')`;
    const text = Prisma.sql`(${col})::text`;
    return {
      field,
      type: primaryType,
      isPrimary: true,
      text,
      display: primaryType === 'date' ? date : text,
      num: Prisma.sql`(${col})::numeric`,
      date,
    };
  }

  // extras JSONB key — the key itself is a bound parameter.
  const raw = Prisma.sql`(b."extras" ->> ${field})`;
  const type = clientType ?? 'text';
  const date = Prisma.sql`(CASE WHEN ${raw} ~ ${ISO_DATE_REGEX} THEN LEFT(TRIM(${raw}), 10) END)`;
  return {
    field,
    type,
    isPrimary: false,
    text: raw,
    display: type === 'date' ? date : raw,
    num: Prisma.sql`(CASE WHEN ${raw} ~ ${NUMBER_REGEX} THEN TRIM(${raw})::numeric END)`,
    date,
  };
}

function bad(message: string): never {
  throw new BadRequestException(message);
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

function toNumber(field: string, value?: string): number {
  const n = Number(String(value ?? '').trim());
  if (value === undefined || String(value).trim() === '' || !Number.isFinite(n))
    bad(`Filter on "${field}" needs a numeric value, got "${value ?? ''}"`);
  return n;
}

function toIsoDate(field: string, value?: string): string {
  const v = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const d = new Date(v);
  if (!v || Number.isNaN(d.getTime()))
    bad(`Filter on "${field}" needs a date (YYYY-MM-DD), got "${value ?? ''}"`);
  return d.toISOString().slice(0, 10);
}

function requireText(field: string, value?: string): string {
  const v = String(value ?? '').trim();
  if (!v) bad(`Filter on "${field}" needs a value`);
  return v;
}

/** Expression + parsed value used by the comparison operators for this type. */
function comparable(
  col: ResolvedColumn,
  value?: string,
): { expr: Prisma.Sql; param: Prisma.Sql } {
  if (col.type === 'number') {
    return {
      expr: col.num,
      param: Prisma.sql`${toNumber(col.field, value)}::numeric`,
    };
  }
  if (col.type === 'date') {
    return {
      expr: col.date,
      param: Prisma.sql`${toIsoDate(col.field, value)}`,
    };
  }
  return {
    expr: Prisma.sql`LOWER(TRIM(${col.display}))`,
    param: Prisma.sql`LOWER(${requireText(col.field, value)})`,
  };
}

function buildCondition(
  col: ResolvedColumn,
  cond: ColumnConditionDto,
): Prisma.Sql | null {
  const op = cond.operator;
  if (!OPERATORS_BY_TYPE[col.type].includes(op)) {
    bad(
      `Operator "${op}" is not supported for ${col.type} column "${col.field}"`,
    );
  }

  const isEmpty = Prisma.sql`(NULLIF(TRIM(${col.text}), '') IS NULL)`;

  switch (op) {
    case 'isEmpty':
      return isEmpty;
    case 'isNotEmpty':
      return Prisma.sql`NOT ${isEmpty}`;

    case 'in':
    case 'notIn': {
      const values = cond.values ?? [];
      const includeBlanks = values.some((v) => String(v ?? '').trim() === '');
      const picked = values
        .map((v) => String(v ?? '').trim())
        .filter(Boolean)
        .map((v) =>
          col.type === 'date' ? toIsoDate(col.field, v) : v.toLowerCase(),
        );

      const parts: Prisma.Sql[] = [];
      if (picked.length) {
        parts.push(
          Prisma.sql`LOWER(TRIM(${col.display})) = ANY(${picked}::text[])`,
        );
      }
      if (includeBlanks) parts.push(isEmpty);

      if (!parts.length) {
        // Nothing ticked: "in" matches nothing, "notIn" filters nothing.
        return op === 'in' ? Prisma.sql`FALSE` : null;
      }
      const anyOf = Prisma.sql`(${Prisma.join(parts, ' OR ')})`;
      return op === 'in' ? anyOf : Prisma.sql`NOT COALESCE(${anyOf}, FALSE)`;
    }

    case 'contains':
    case 'notContains':
    case 'startsWith':
    case 'endsWith': {
      const v = escapeLike(requireText(col.field, cond.value));
      const pattern =
        op === 'startsWith' ? `${v}%` : op === 'endsWith' ? `%${v}` : `%${v}%`;
      return op === 'notContains'
        ? Prisma.sql`COALESCE(${col.text}, '') NOT ILIKE ${pattern}`
        : Prisma.sql`${col.text} ILIKE ${pattern}`;
    }

    case 'equals': {
      const { expr, param } = comparable(col, cond.value);
      return Prisma.sql`${expr} = ${param}`;
    }
    case 'notEquals': {
      const { expr, param } = comparable(col, cond.value);
      return Prisma.sql`${expr} IS DISTINCT FROM ${param}`;
    }
    case 'gt': {
      const { expr, param } = comparable(col, cond.value);
      return Prisma.sql`${expr} > ${param}`;
    }
    case 'gte': {
      const { expr, param } = comparable(col, cond.value);
      return Prisma.sql`${expr} >= ${param}`;
    }
    case 'lt': {
      const { expr, param } = comparable(col, cond.value);
      return Prisma.sql`${expr} < ${param}`;
    }
    case 'lte': {
      const { expr, param } = comparable(col, cond.value);
      return Prisma.sql`${expr} <= ${param}`;
    }
    case 'between': {
      const from = comparable(col, cond.value);
      const to = comparable(col, cond.valueTo);
      return Prisma.sql`${from.expr} BETWEEN ${from.param} AND ${to.param}`;
    }
    default:
      return bad(`Unknown operator "${op}"`);
  }
}

/**
 * Turns the column filters into SQL fragments (to be ANDed together).
 * `excludeField` drops the filter on that column — used by the distinct-values
 * endpoint so a column's own dropdown isn't narrowed by its own filter.
 */
export function buildFilterConditions(
  filters: ColumnFilterDto[] = [],
  excludeField?: string,
): Prisma.Sql[] {
  const out: Prisma.Sql[] = [];

  for (const filter of filters) {
    if (excludeField && filter.field === excludeField) continue;
    const col = resolveColumn(filter.field, filter.type);

    const parts = (filter.conditions ?? [])
      .map((c) => buildCondition(col, c))
      .filter((p): p is Prisma.Sql => p !== null);
    if (!parts.length) continue;

    const joiner = filter.join === 'OR' ? ' OR ' : ' AND ';
    out.push(Prisma.sql`(${Prisma.join(parts, joiner)})`);
  }

  return out;
}

export function buildGroupBeneficiaryWhere(
  groupUID: string,
  filters?: ColumnFilterDto[],
  excludeField?: string,
): Prisma.Sql {
  const conditions = buildFilterConditions(filters, excludeField);
  const base = Prisma.sql`WHERE bg."groupUID" = ${groupUID}::uuid`;
  return conditions.length
    ? Prisma.sql`${base} AND ${Prisma.join(conditions, ' AND ')}`
    : base;
}

export function buildOrderBy(sort?: BeneficiarySortDto): Prisma.Sql {
  const tieBreak = Prisma.sql`bg."createdAt" ASC, bg."id" ASC`;
  if (!sort?.field) return tieBreak;

  const col = resolveColumn(sort.field, sort.type);
  const expr =
    col.type === 'number'
      ? col.num
      : col.type === 'date'
      ? col.date
      : Prisma.sql`LOWER(${col.text})`;
  const dir = Prisma.raw(sort.dir === 'desc' ? 'DESC' : 'ASC');
  return Prisma.sql`${expr} ${dir} NULLS LAST, ${tieBreak}`;
}
