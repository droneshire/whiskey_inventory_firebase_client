const HOURS = 60*60*1000;

export function addHour(hours: number) {
  return HOURS * hours;
}

export function getFixedTimeWithHourAndMinute(fixedDate: Date, hours: number, minutes: number): Date {
  const new_date: Date = new Date(Math.floor(fixedDate.getTime() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000));
  new_date.setFullYear(fixedDate.getFullYear());
  new_date.setMonth(fixedDate.getMonth());
  new_date.setDate(fixedDate.getDate());
  new_date.setHours(hours, minutes, 0, 0);
  return new_date;
}

export function getMinutesFromMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
