export const getFormattedDate = (date: Date): string => {
  return date.getUTCFullYear() + ", " + (date.getUTCMonth() + 1) + ", " + date.getUTCDate();
}

export const getPartOfDate = (date: string, part: number): number => {
  return Number.parseInt(date.split("-")[part]);
}

export enum PartOfDate {
  "day" = 0,
  "month" = 1,
  "year" = 2
}

export const oneDayDiff = 1000 * 60 * 60 * 24;