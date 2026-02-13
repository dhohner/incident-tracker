import { useMemo } from "react";
import {
  matchesTicketSeverity,
  type TicketSeverity,
} from "~/services/tickets/severity";
import type { Ticket } from "~/types/ticket";

export function useSeverityTickets(
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
