export const ticketSeverities = ["ALL", "P1", "P2", "P3", "P4"] as const;
export type TicketSeverity = (typeof ticketSeverities)[number];

export function isTicketSeverity(value: string): value is TicketSeverity {
  return (ticketSeverities as readonly string[]).includes(value);
}
