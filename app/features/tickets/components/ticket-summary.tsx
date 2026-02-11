import type { StatusCounts } from "../utils/status";

import { SummaryCard } from "./summary-card";

interface TicketSummaryProps {
  counts: StatusCounts;
}

export function TicketSummary({ counts }: TicketSummaryProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/70">
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-xs tracking-[0.3em] text-cyan-300/70 uppercase">
          Priority 1 Summary
        </span>
      </div>
      <div className="grid gap-4 border-t border-cyan-400/10 bg-slate-950/70 px-6 py-6 sm:grid-cols-3">
        <SummaryCard label="Open" value={counts.open} />
        <SummaryCard label="In Progress" value={counts.inProgress} />
        <SummaryCard label="Mitigated" value={counts.mitigated} />
      </div>
    </section>
  );
}
