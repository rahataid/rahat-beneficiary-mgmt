import { Beneficiary } from '../beneficiary';

export type GroupInput = {
  name: string;
  isSystem: boolean;
};

export type ListGroup = {
  name: string;
  isSystem: boolean;
  uuid: string;
  id: number;
  beneficiariesGroup: [
    {
      beneficiary: Beneficiary;
    },
  ];
};
export type GroupResponse = {
  uuid: string;
  isSystem: boolean;
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GroupBeneficiaryQuery = {
  page: number;
  perPage: number;
};

export type ListGroupBeneficiary = {
  name: string;
  uuid: string;
  id: number;
  beneficiariesGroup: [
    {
      beneficiary: Beneficiary;
    },
  ];
};

export type GroupResponseById = {
  id: number;
  uuid: string;
  beneficiaryId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;
  beneficiary: Beneficiary;
};

export type GroupPurge = {
  beneficiaryUuid: string[];
  groupUuid: string;
};

export type GroupMessage = {
  message: string;
  flag: string;
};

export type RemoveGroup = {
  uuid: string;
  deleteBeneficiaryFlag: boolean;
  beneficiaryUuid: string[];
};

export type ResultGroup = {
  message: string;
  success: boolean;
};

export type BulkUpdateResponse = {
  success: boolean;
  message: string;
};

export type DownloadExcelQuery = {
  fields?: string;
};

// ── Excel-like beneficiary filter (POST /group/:uuid/beneficiaries/search|distinct)

export type GroupBeneficiaryFieldType =
  | 'text'
  | 'enum'
  | 'number'
  | 'date'
  | 'boolean';

export type GroupBeneficiaryFilterOperator =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEquals'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between';

export type GroupBeneficiaryCondition = {
  operator: GroupBeneficiaryFilterOperator;
  /** Single value. Dates as YYYY-MM-DD. */
  value?: string;
  /** Upper bound for "between" (inclusive). */
  valueTo?: string;
  /** Ticked values for "in" / "notIn". An empty string "" means (Blanks). */
  values?: string[];
};

export type GroupBeneficiaryColumnFilter = {
  /** Primary beneficiary column (firstName, phone, ...) or an extras key. */
  field: string;
  /** Only needed for number/date fields stored in extras. Defaults to "text". */
  type?: GroupBeneficiaryFieldType;
  /** One or two conditions. */
  conditions: GroupBeneficiaryCondition[];
  /** How the conditions of this column are combined. Defaults to "AND". */
  join?: 'AND' | 'OR';
};

export type GroupBeneficiarySort = {
  field: string;
  dir?: 'asc' | 'desc';
  type?: GroupBeneficiaryFieldType;
};

export type SearchGroupBeneficiariesInput = {
  /** Column filters, combined with AND. Send [] for an unfiltered list. */
  filters?: GroupBeneficiaryColumnFilter[];
  sort?: GroupBeneficiarySort;
  /** Default 1. */
  page?: number;
  /** Default 50, max 1000. */
  perPage?: number;
};

export type GroupBeneficiaryRow = Beneficiary & {
  /** True when this phone number appears more than once in the group. */
  isDuplicate: boolean;
};

/** `data` of the search response; pagination is in `response.meta`. */
export type SearchGroupBeneficiariesResult = {
  rows: GroupBeneficiaryRow[];
};

export type GroupBeneficiarySearchMeta = {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
};

export type DistinctGroupBeneficiaryValuesInput = {
  field: string;
  type?: GroupBeneficiaryFieldType;
  /** Text typed in the filter dropdown's search box. */
  search?: string;
  /** Active filters; the filter on `field` itself is ignored. */
  filters?: GroupBeneficiaryColumnFilter[];
  /** Default 100, max 1000. */
  limit?: number;
};

export type GroupBeneficiaryDistinctValue = {
  /** null means (Blanks). */
  value: string | null;
  count: number;
};

export type DistinctGroupBeneficiaryValuesResult = {
  field: string;
  type: GroupBeneficiaryFieldType;
  values: GroupBeneficiaryDistinctValue[];
  hasMore: boolean;
};
