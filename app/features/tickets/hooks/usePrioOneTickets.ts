import { useMemo } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { isPrioOne } from "~/lib/tickets";

export function usePrioOneTickets(limit = 8) {
  const data = useQuery(api.tickets.list);

  const tickets = useMemo(() => {
    if (!data) return [];
    return data.filter((ticket) => isPrioOne(ticket.priority)).slice(0, limit);
  }, [data, limit]);

  return tickets;
}
