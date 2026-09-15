export function reportWeek(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() || 7) + 1);
  const weekStart = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 6);
  return { weekStart, weekEnd: date.toISOString().slice(0, 10) };
}
export function currentReportDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
}
