export const filterExtraFieldValues = (main_query_result: any, extras: any) => {
  if (Object.keys(extras).length < 1) return main_query_result;

  const filteredArray = () => {
    return main_query_result.filter((item) => {
      return Object.keys(extras).every((key) => {
        const queryValues = extras[key]
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value !== '');
        if (queryValues.length === 0) return true; // Don't filter if all query values are empty
        return queryValues.some((value) => item.extras[key] === value);
      });
    });
  };

  const result = filteredArray();
  return result;
};

export const createSearchQuery = (filters: any) => {
  const AND_CONDITIONS = [];
  const filtersKeys = Object.keys(filters);
  let conditions = {};

  for (const key of filtersKeys) {
    if (filters[key]) {
      let condition = {};

      if (key === 'firstName' || key === 'lastName' || key === 'location') {
        condition[key] = { contains: filters[key], mode: 'insensitive' };
      } else {
        if (filters[key].includes(',')) {
          // Multiple values
          const values = filters[key].split(',').map((value) => value.trim());
          condition[key] = { in: values };
        } else {
          condition[key] = filters[key]; // Single Value
        }
      }

      AND_CONDITIONS.push(condition);
    }
  }

  if (AND_CONDITIONS.length > 0) {
    conditions = { AND: AND_CONDITIONS };
  }
  return conditions;
};
