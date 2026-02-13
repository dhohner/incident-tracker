import { formatMonthDayTime } from "~/services/formatters/date";

export function formatCommentTimestamp(timestamp: number) {
  return formatMonthDayTime(timestamp);
}
