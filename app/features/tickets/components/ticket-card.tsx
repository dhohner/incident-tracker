import { useState } from "react";
import { easeOut, motion } from "framer-motion";
import { formatUpdatedAt, type Ticket } from "~/lib/tickets";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

const MotionCard = motion.create(Card);

interface TicketCardProps {
  ticket: Ticket;
  isSelected: boolean;
  onSelect: (ticketKey: string) => void;
}

export function TicketCard({ ticket, isSelected, onSelect }: TicketCardProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = ticket.description.length > 140;
  const selectComments = () => onSelect(ticket.key);
  const borderClassName = isSelected ? "border-cyan-300/70" : "border-slate-800/80";
  const followButtonClassName = isSelected
    ? "border-cyan-300/70 text-cyan-100"
    : "border-slate-700 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200";

  return (
    <MotionCard
      layout
      initial={false}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onClick={selectComments}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectComments();
        }
      }}
      className={`group relative cursor-pointer overflow-hidden bg-slate-950/60 transition hover:border-cyan-400/40 ${borderClassName}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" />
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
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpanded((value) => !value);
                  }}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90 transition hover:text-cyan-100"
                >
                  {expanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              selectComments();
            }}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${followButtonClassName}`}
            aria-label={`Load comments for ${ticket.key}`}
          >
            {isSelected ? "Unfollow" : "Follow"}
          </button>
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
