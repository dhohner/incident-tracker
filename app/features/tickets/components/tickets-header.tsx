import { formatUpdatedAt } from "~/lib/tickets";
import { Card } from "~/components/ui/card";

interface TicketsHeaderProps {
  latestUpdate?: number;
}

export function TicketsHeader({ latestUpdate }: TicketsHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p
          className="text-xs uppercase tracking-[0.4em] text-cyan-300/70"
          style={{ fontFamily: '"Space Mono", monospace' }}
        >
          Live ticker
        </p>
        <h1
          className="mt-3 text-4xl sm:text-6xl"
          style={{ fontFamily: '"Unbounded", sans-serif' }}
        >
          Jira Pulse
        </h1>
        <p className="mt-4 max-w-xl text-sm text-slate-300/80">
          Streaming the newest Priority 1 tickets. Watch for fresh escalations
          and status shifts.
        </p>
      </div>
      <Card className="border-cyan-400/20 bg-slate-900/60 p-4 text-right shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <p className="text-xs uppercase text-slate-400">Latest update</p>
        <p className="mt-2 text-lg text-cyan-200">
          {latestUpdate ? formatUpdatedAt(latestUpdate) : "Waiting..."}
        </p>
      </Card>
    </header>
  );
}
