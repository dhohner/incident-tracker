import type { Ticket } from "~/lib/tickets";

import { TicketCard } from "./ticket-card";

interface TicketGridProps {
  tickets: Ticket[];
}

export function TicketGrid({ tickets }: TicketGridProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {tickets.map((ticket) => (
        <TicketCard key={ticket._id} ticket={ticket} />
      ))}
    </section>
  );
}
