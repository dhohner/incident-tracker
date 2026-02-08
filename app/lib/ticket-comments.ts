import type { Doc } from "../../convex/_generated/dataModel";

export type TicketComment = Doc<"ticketComments">;

export function formatCommentTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
