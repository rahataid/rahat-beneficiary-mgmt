export const calculateNumberOfDays = (startDate: Date, currentDate: Date) => {
  const targetDate = new Date(startDate);
  const timeDiff = Math.abs(targetDate.getTime() - currentDate.getTime());
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
};

export const convertDateToISO = (date: string) => {
  return new Date(date).toISOString();
};

export const convertToValidString = (inputString: string) => {
  // Replace spaces with underscores
  let stringWithUnderscores = inputString.replace(/ /g, '_');
  // Remove special characters using regex
  let stringWithoutSpecialChars = stringWithUnderscores.replace(
    /[^\w\s]/gi,
    '',
  );
  return stringWithoutSpecialChars;
};
