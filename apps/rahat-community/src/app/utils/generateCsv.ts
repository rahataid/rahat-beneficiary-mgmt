import { generateExcelData } from './export-to-excel';

export const generateCsvBuffer = (data: any[]): Buffer => {
  const flattenedData = generateExcelData(data);
  if (!flattenedData.length) return Buffer.from('');

  const headers: string[] = Array.from(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Set(flattenedData.flatMap((row: Record<string, any>) => Object.keys(row))),
  );

  const csvRows = [
    headers.join(','),
    ...flattenedData.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? '';
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(','),
    ),
  ];

  return Buffer.from(csvRows.join('\n'), 'utf-8');
};
