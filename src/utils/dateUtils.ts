export const getFormattedDate = (date: Date): string => {
  return date.getUTCFullYear() + ", " + (date.getUTCMonth() + 1) + ", " + date.getUTCDate();
}
