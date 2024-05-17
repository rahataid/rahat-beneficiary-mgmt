import * as XLSX from 'xlsx';

const flattenObject = (obj: any, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}_${key}` : key;
    const fieldKey = newKey.replace(/^extras[^a-zA-Z]*/, '');
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], newKey));
    } else {
      acc[fieldKey] = obj[key];
    }
    return acc;
  }, {});
};
export const generateExcelData = (data: any) => {
  {
    const flattenedData = data.map((item) => {
      const flattenedItem = flattenObject(item);
      return Object.keys(flattenedItem)
        .filter(
          (key) =>
            flattenedItem[key] !== null &&
            flattenedItem[key] !== undefined &&
            flattenedItem[key] !== '',
        )
        .reduce((acc, key) => {
          acc[key] = flattenedItem[key];
          return acc;
        }, {});
    });

    return flattenedData;

    // const ws = XLSX.utils.json_to_sheet(flattenedData);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // return XLSX.write(wb, { type: 'buffer' });
  }
};
