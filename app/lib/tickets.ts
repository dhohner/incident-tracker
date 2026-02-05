import type { Doc } from "../../convex/_generated/dataModel";

export type Ticket = Doc<"tickets">;

const prioOneMatchers = [
  /p1/i,
  /priority\s*1/i,
  /sev\s*1/i,
  /critical/i,
  /highest/i,
];

export function isPrioOne(priority: string) {
  return prioOneMatchers.some((matcher) => matcher.test(priority));
}

export function formatUpdatedAt(timestamp: number) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
