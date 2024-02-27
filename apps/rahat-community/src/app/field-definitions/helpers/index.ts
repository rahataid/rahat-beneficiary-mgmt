export const validateAllowedFieldAndTypes = (reqObject: any, dbFields: any) => {
  let nonMatchingFields = [];
  if (!dbFields.length) throw new Error('Please setup allowed fields first!');
  const keys = Object.keys(reqObject);
  // Check if req.extras match with allowed field and type
  for (let i = 0; i < keys.length; i++) {
    const fieldName = keys[i].toLocaleLowerCase();
    // const fieldType = typeof values[i];
    const found = dbFields.find((f: any) => f.name === fieldName);
    if (!found) nonMatchingFields.push(fieldName);
  }
  return nonMatchingFields;
};
