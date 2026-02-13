import {
  p1SummaryLabel,
  summaryMetricLabels,
} from "~/config/constants/tickets-ui";
import type { StatusCounts } from "~/services/tickets/status";

import { SummaryCard } from "./summary-card";

interface SummaryProps {
  counts: StatusCounts;
}

export function Summary({ counts }: SummaryProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-900/70">
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-xs tracking-[0.3em] text-cyan-300/70 uppercase">
          {p1SummaryLabel}
        </span>
      </div>
      <div className="grid gap-4 border-t border-cyan-400/10 bg-slate-950/70 px-6 py-6 sm:grid-cols-3">
        <SummaryCard label={summaryMetricLabels.open} value={counts.open} />
        <SummaryCard
          label={summaryMetricLabels.inProgress}
          value={counts.inProgress}
        />
        <SummaryCard
          label={summaryMetricLabels.mitigated}
          value={counts.mitigated}
        />
      </div>
    </section>
  );
}
