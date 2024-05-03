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
  return words.join('_').toLocaleLowerCase();
};

export const formatDateAndTime = (date: Date) => {
  // Add leading zero if number is single digit
  const addLeadingZero = (number) => {
    return number < 10 ? '0' + number : number;
  };

  // Get date components
  const year = date.getFullYear();
  const month = addLeadingZero(date.getMonth() + 1);
  const day = addLeadingZero(date.getDate());
  const hours = addLeadingZero(date.getHours());
  const minutes = addLeadingZero(date.getMinutes());
  const seconds = addLeadingZero(date.getSeconds());

  // Format date and time
  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hours}H:${minutes}M:${seconds}S`;
  return `${formattedDate}(${formattedTime})`;
};

export const sanitizePhoneAndGovtID = (inputString: string) => {
  if (!inputString) return '';
  const pattern = /[0-9A-Za-z]/g;
  let matches = inputString.match(pattern);
  let result = matches ? matches.join('') : '';
  return result;
};

export const bulkSanitizePhoneAndGovtID = (payload: any, existingData: any) => {
  const sanitizedExistingData = existingData.map((d) => {
    return {
      ...d,
      phone: sanitizePhoneAndGovtID(d.phone),
      govtIDNumber: sanitizePhoneAndGovtID(d.govtIDNumber),
    };
  });
  const sanitizedPayload = payload.map((d) => {
    return {
      ...d,
      phone: sanitizePhoneAndGovtID(d.phone),
      govtIDNumber: sanitizePhoneAndGovtID(d.govtIDNumber),
    };
  });
  return { sanitizedExistingData, sanitizedPayload };
};
