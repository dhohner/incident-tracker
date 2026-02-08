import type { Ticket } from "~/lib/tickets";

import { TicketCard } from "./ticket-card";

interface TicketGridProps {
  tickets: Ticket[];
  selectedTicketKey?: string;
  onSelectTicket: (ticketKey: string) => void;
}

export function TicketGrid({
  tickets,
  selectedTicketKey,
  onSelectTicket,
}: TicketGridProps) {
  return (
    <section className="grid gap-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket._id}
          ticket={ticket}
          isSelected={ticket.key === selectedTicketKey}
          onSelect={onSelectTicket}
        />
      ))}
    </section>
  );
}
