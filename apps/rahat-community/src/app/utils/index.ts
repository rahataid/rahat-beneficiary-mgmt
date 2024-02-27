export const calculateNumberOfDays = (startDate: Date, currentDate: Date) => {
  const targetDate = new Date(startDate);
  const timeDiff = Math.abs(targetDate.getTime() - currentDate.getTime());
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
};
