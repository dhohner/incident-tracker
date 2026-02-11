import type { Doc } from "../../convex/_generated/dataModel";
import {
  isTicketSeverity,
  ticketSeverities,
  type TicketSeverity,
} from "../../shared/ticket-severity";

export type Ticket = Doc<"tickets">;
export { isTicketSeverity, ticketSeverities, type TicketSeverity };

const prioOneMatchers = [
  /p1/i,
  /priority\s*1/i,
  /sev\s*1/i,
  /critical/i,
  /highest/i,
];

const prioTwoMatchers = [/p2/i, /priority\s*2/i, /sev\s*2/i, /\bhigh\b/i];
const prioThreeMatchers = [/p3/i, /priority\s*3/i, /sev\s*3/i, /medium/i];
const prioFourMatchers = [/p4/i, /priority\s*4/i, /sev\s*4/i, /low/i];
const matchersBySeverity = {
  P1: prioOneMatchers,
  P2: prioTwoMatchers,
  P3: prioThreeMatchers,
  P4: prioFourMatchers,
} as const;
const orderedSeverities: Array<Exclude<TicketSeverity, "ALL">> = [
  "P1",
  "P2",
  "P3",
  "P4",
];

export function isPrioOne(priority: string) {
  return prioOneMatchers.some((matcher) => matcher.test(priority));
}

export function normalizeTicketSeverity(value?: string | null): TicketSeverity {
  const normalizedValue = value?.trim().toUpperCase();
  return normalizedValue && isTicketSeverity(normalizedValue)
    ? normalizedValue
    : "P1";
}

export function matchesTicketSeverity(
  priority: string,
  severity: TicketSeverity,
) {
  if (severity === "ALL") return true;
  const matchers = matchersBySeverity[severity];
  return matchers.some((matcher) => matcher.test(priority));
}

export function ticketPriorityLabel(priority: string) {
  const matchedSeverity = orderedSeverities.find((severity) =>
    matchesTicketSeverity(priority, severity),
  );
  return matchedSeverity ?? priority;
}

export function ticketSeverityLabel(severity: TicketSeverity) {
  return severity === "ALL" ? "All severities" : severity;
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
