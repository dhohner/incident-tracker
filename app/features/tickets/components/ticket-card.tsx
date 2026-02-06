import { useMemo, useState } from "react";
import {
  easeOut,
  motion,
} from "framer-motion";
import { formatUpdatedAt, type Ticket } from "~/lib/tickets";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

const MotionCard = motion.create(Card);

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = useMemo(
    () => ticket.description.length > 140,
    [ticket.description],
  );
  return (
    <MotionCard
      layout
      initial={false}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden border-slate-800/80 bg-slate-950/60 transition hover:border-cyan-400/40"
    >
      <div className="pointer-events-none absolute inset-0  opacity-0 transition group-hover:opacity-100" />
      <Badge className="absolute right-4 top-4 text-[11px]" variant="muted">
        {ticket.status}
      </Badge>
      <CardContent className="relative pt-5">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex flex-col flex-1 gap-3">
            <div className="flex gap-3">
              <Badge variant="accent" className="normal-case tracking-normal">
                {ticket.key}
              </Badge>
              <h2 className="text-base font-semibold text-slate-100">
                {ticket.title}
              </h2>
            </div>
            <div className="relative mt-1 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2">
              <motion.div layout transition={{ duration: 0.34, ease: easeOut }}>
                <motion.div
                  initial={false}
                  animate={{ height: expanded ? "auto" : 60 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="relative overflow-hidden"
                >
                  <p
                    className="text-xs leading-relaxed text-slate-300/90"
                    title={ticket.description}
                  >
                    {ticket.description}
                  </p>
                  <motion.div
                    initial={false}
                    animate={{ opacity: expanded ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-slate-950/90 to-transparent"
                  />
                </motion.div>
              </motion.div>
              {shouldTruncate && (
                <button
                  type="button"
                  onClick={() => setExpanded((value) => !value)}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90 transition hover:text-cyan-100"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end items-center gap-3 text-xs text-slate-400">
          <Badge variant="muted" className="normal-case tracking-normal">
            {ticket.assignee}
          </Badge>
          <Badge variant="accent" className="normal-case tracking-normal">
            {formatUpdatedAt(ticket.updatedAt)}
          </Badge>
        </div>
      </CardContent>
    </MotionCard>
  );
}
