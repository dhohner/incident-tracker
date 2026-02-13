import { useEffect, useRef } from "react";
import * as Ariakit from "@ariakit/react";
import { motion } from "framer-motion";
import type { Ticket } from "~/types/ticket";

import { CardItem } from "./card";

interface GridProps {
  tickets: Ticket[];
  selectedTicketKey?: string;
  onSelectTicket: (ticketKey: string) => void;
}

export function Grid({
  tickets,
  selectedTicketKey,
  onSelectTicket,
}: GridProps) {
  const ticketNavigation = Ariakit.useCompositeStore({
    orientation: "vertical",
    focusLoop: true,
  });
  const hasAnimatedInitialLoad = useRef(false);
  const shouldAnimateInitialLoad =
    tickets.length > 0 && !hasAnimatedInitialLoad.current;

  useEffect(() => {
    if (tickets.length > 0) {
      hasAnimatedInitialLoad.current = true;
    }
  }, [tickets.length]);

  return (
    <Ariakit.Composite
      store={ticketNavigation}
      render={<section />}
      aria-label="Tickets"
      className="grid gap-4"
    >
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
          <CardItem
            ticket={ticket}
            isSelected={ticket.key === selectedTicketKey}
            onSelect={onSelectTicket}
          />
        </motion.div>
      ))}
    </Ariakit.Composite>
  );
}
