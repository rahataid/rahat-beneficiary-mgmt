export const calculateNumberOfDays = (startDate: Date, currentDate: Date) => {
  const targetDate = new Date(startDate);
  const timeDiff = Math.abs(targetDate.getTime() - currentDate.getTime());
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
};

export const parseIsoDateToString = (dateIsoString: string) => {
  const date = new Date(dateIsoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const convertDateToISO = (date: string) => {
  return new Date(date).toISOString();
};

export const convertToValidString = (inputString: string) => {
  // Remove special characters using regular expression
  const cleanedString = inputString.replace(/[^\w\s]/gi, '');

  // Split the string into words
  const words = cleanedString.split(/\s+/);

  // Join the words with underscore
  return words.join('_');
};
