import * as XLSX from 'xlsx';

export const generateExcelData = (data: any[]): Buffer => {
  {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    return XLSX.write(wb, { type: 'buffer' });
  }
};
