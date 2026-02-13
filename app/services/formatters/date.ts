const monthDayTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMonthDayTime(timestamp: number) {
  return monthDayTimeFormatter.format(new Date(timestamp));
}
