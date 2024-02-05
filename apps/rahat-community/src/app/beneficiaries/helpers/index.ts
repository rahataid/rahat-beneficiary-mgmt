export const FILTER_KEY = {
  MIN_AGE: 'min_age',
  MAX_AGE: 'max_age',
};

export const filterExtraFieldValues = (main_query_result: any, extras: any) => {
  if (Object.keys(extras).length < 1) return main_query_result;
  const nonEmptyExtras = main_query_result.filter(
    (item: any) => item.extras !== null,
  );
  const filteredData = nonEmptyExtras.filter((item: any) => {
    // Iterate over the key-value pairs in extras
    for (const [key, value] of Object.entries(extras)) {
      // Check if the key exists in extras and the value matches
      if (key === FILTER_KEY.MAX_AGE) return item.extras['age'] < value;
      if (key === FILTER_KEY.MIN_AGE) return item.extras['age'] > value;
      if (item.extras[key] !== value) return false;
    }
    // If all conditions pass, keep the item
    return true;
  });
  return filteredData;
};

export const createSearchQuery = (filters: any) => {
  const AND_CONDITIONS = [];
  const filtersKeys = Object.keys(filters);
  let conditions = {};

  for (const key of filtersKeys) {
    if (filters[key]) {
      let condition = {};

      if (
        key === 'firstName' ||
        key === 'lastName' ||
        key === 'email' ||
        key === 'location'
      ) {
        condition[key] = { contains: filters[key], mode: 'insensitive' };
      } else {
        condition[key] = filters[key];
      }

      AND_CONDITIONS.push(condition);
    }
  }

  if (AND_CONDITIONS.length > 0) {
    conditions = { AND: AND_CONDITIONS };
  }
  return conditions;
};
