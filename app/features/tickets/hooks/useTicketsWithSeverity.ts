import { useMemo } from "react";
import {
  matchesTicketSeverity,
  type Ticket,
  type TicketSeverity,
} from "~/lib/tickets";

export function useTicketsWithSeverity(
  allTickets: Ticket[] | undefined,
  limit = 8,
  severity: TicketSeverity = "P1",
) {
  const tickets = useMemo(() => {
    const matchingTickets = allTickets
      ? allTickets.filter((ticket) =>
          matchesTicketSeverity(ticket.priority, severity),
        )
      : [];
    return matchingTickets.slice(0, limit);
  }, [allTickets, limit, severity]);

  return tickets;
}
