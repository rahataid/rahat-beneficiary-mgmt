export const filterExtraFieldValues = (main_query_result: any, extras: any) => {
  if (Object.keys(extras).length < 1) return main_query_result;

  const filteredArray = main_query_result.filter((item) => {
    for (const key in extras) {
      if (
        item.extras &&
        Object.prototype.hasOwnProperty.call(item.extras, key)
      ) {
        const filterValues = extras[key].split(',');
        const itemValue = item.extras[key];
        if (filterValues.includes(itemValue)) {
          return true;
        }
      }
    }
    return false;
  });
  return filteredArray;
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
