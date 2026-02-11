import { useState } from "react";
import { easeOut, motion } from "framer-motion";
import {
  formatUpdatedAt,
  ticketPriorityLabel,
  type Ticket,
} from "~/lib/tickets";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { getStatusCategory } from "../utils/status";

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
  const priority = ticketPriorityLabel(ticket.priority);
  const statusCategory = getStatusCategory(ticket.status);
  const borderClassName = isSelected
    ? "border-cyan-300/70"
    : "border-slate-800/80";
  const followButtonClassName = isSelected
    ? "border-cyan-300/70 text-cyan-100"
    : "border-slate-700 text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200";
  const statusStyles = {
    open: {
      badge:
        "border-rose-400/45 bg-rose-400/15 text-rose-100 shadow-[0_0_0_1px_rgba(251,113,133,0.22)_inset]",
      dot: "bg-rose-300",
      pulse: "animate-pulse",
    },
    inProgress: {
      badge:
        "border-amber-300/45 bg-amber-300/15 text-amber-100 shadow-[0_0_0_1px_rgba(252,211,77,0.2)_inset]",
      dot: "bg-amber-200",
      pulse: "",
    },
    mitigated: {
      badge:
        "border-emerald-300/45 bg-emerald-300/15 text-emerald-100 shadow-[0_0_0_1px_rgba(110,231,183,0.18)_inset]",
      dot: "bg-emerald-200",
      pulse: "",
    },
    unknown: {
      badge:
        "border-slate-500/60 bg-slate-700/30 text-slate-100 shadow-[0_0_0_1px_rgba(148,163,184,0.2)_inset]",
      dot: "bg-slate-300",
      pulse: "",
    },
  }[statusCategory];
  const priorityStyles =
    {
      P1: "border-rose-300/70 bg-rose-400/18 text-rose-50 shadow-[0_0_0_1px_rgba(251,113,133,0.32)_inset]",
      P2: "border-amber-300/70 bg-amber-300/18 text-amber-50 shadow-[0_0_0_1px_rgba(252,211,77,0.32)_inset]",
      P3: "border-sky-300/70 bg-sky-300/18 text-sky-50 shadow-[0_0_0_1px_rgba(125,211,252,0.3)_inset]",
      P4: "border-emerald-300/70 bg-emerald-300/18 text-emerald-50 shadow-[0_0_0_1px_rgba(110,231,183,0.3)_inset]",
    }[priority] ?? "border-slate-300/65 bg-slate-200/20 text-slate-50";

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
      <CardContent className="relative pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="min-w-0 flex-1 text-lg leading-tight font-semibold tracking-tight text-slate-50 sm:pr-3">
            <span className="block truncate">{ticket.title}</span>
          </h2>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant="accent" className="tracking-normal normal-case">
              {ticket.key}
            </Badge>
            <Badge
              variant="default"
              className={`gap-2 border px-2.5 text-xs font-semibold tracking-widest ${priorityStyles}`}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-current"
              />
              {priority}
            </Badge>
            <Badge
              className={`inline-flex items-center gap-2 text-[11px] tracking-normal normal-case ${statusStyles.badge}`}
              variant="muted"
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${statusStyles.dot} ${statusStyles.pulse}`}
              />
              {ticket.status}
            </Badge>
          </div>
        </div>
        <div className="relative mt-3 rounded-lg border border-slate-800/60 bg-slate-950/40 px-3 py-2">
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
              className="mt-2 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-cyan-200/90 uppercase transition hover:text-cyan-100"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              selectComments();
            }}
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase transition ${followButtonClassName}`}
            aria-label={`Load comments for ${ticket.key}`}
          >
            {isSelected ? "Unfollow" : "Follow"}
          </button>
          <Badge variant="muted" className="tracking-normal normal-case">
            {ticket.assignee}
          </Badge>
          <Badge variant="accent" className="tracking-normal normal-case">
            {formatUpdatedAt(ticket.updatedAt)}
          </Badge>
        </div>
      </CardContent>
    </MotionCard>
  );
}
