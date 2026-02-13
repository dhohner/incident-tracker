import type { TicketStatusCategory } from "~/services/tickets/status";

export const p1SummaryLabel = "Priority 1 Summary";

export const summaryMetricLabels = {
  open: "Open",
  inProgress: "In Progress",
  mitigated: "Mitigated",
} as const;

export const statusStylesByCategory: Record<
  TicketStatusCategory,
  { badge: string; dot: string; pulse: string }
> = {
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
};

const priorityStylesByLabel = {
  P1: "border-rose-300/70 bg-rose-400/18 text-rose-50 shadow-[0_0_0_1px_rgba(251,113,133,0.32)_inset]",
  P2: "border-amber-300/70 bg-amber-300/18 text-amber-50 shadow-[0_0_0_1px_rgba(252,211,77,0.32)_inset]",
  P3: "border-sky-300/70 bg-sky-300/18 text-sky-50 shadow-[0_0_0_1px_rgba(125,211,252,0.3)_inset]",
  P4: "border-emerald-300/70 bg-emerald-300/18 text-emerald-50 shadow-[0_0_0_1px_rgba(110,231,183,0.3)_inset]",
} as const;

const defaultPriorityStyles =
  "border-slate-300/65 bg-slate-200/20 text-slate-50";

export function getPriorityStyles(priority: string) {
  return (
    priorityStylesByLabel[priority as keyof typeof priorityStylesByLabel] ??
    defaultPriorityStyles
  );
}
