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
