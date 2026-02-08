import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  const hasAnimatedInitialLoad = useRef(false);
  const shouldAnimateInitialLoad =
    tickets.length > 0 && !hasAnimatedInitialLoad.current;

  useEffect(() => {
    if (tickets.length > 0) {
      hasAnimatedInitialLoad.current = true;
    }
  }, [tickets.length]);

  return (
    <section className="grid gap-4">
      {tickets.map((ticket, index) => (
        <motion.div
          key={ticket._id}
          initial={shouldAnimateInitialLoad ? { opacity: 0, y: 18 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldAnimateInitialLoad
              ? {
                  duration: 0.28,
                  delay: Math.min(index * 0.06, 0.42),
                  ease: [0.22, 1, 0.36, 1],
                }
              : undefined
          }
        >
          <TicketCard
            ticket={ticket}
            isSelected={ticket.key === selectedTicketKey}
            onSelect={onSelectTicket}
          />
        </motion.div>
      ))}
    </section>
  );
}
