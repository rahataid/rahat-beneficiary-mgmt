export const filterExtraFieldValues = (query_result: any, extras: any) => {
  const nonEmptyExtras = query_result.filter(
    (item: any) => item.extras !== null,
  );
  const filteredData = nonEmptyExtras.filter((item: any) => {
    // Iterate over the key-value pairs in extras
    for (const [key, value] of Object.entries(extras)) {
      // Check if the key exists in extras and the value matches
      if (item.extras[key] !== value) return false;
    }
    // If all conditions pass, keep the item
    return true;
  });
  return filteredData;
};

export const createSearchQuery = (filters: any) => {
  const OR_CONDITIONS = [];
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

      OR_CONDITIONS.push(condition);
    }
  }

  if (OR_CONDITIONS.length > 0) {
    conditions = { OR: OR_CONDITIONS };
  }
  return conditions;
};
