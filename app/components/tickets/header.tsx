import { Card } from "~/components/ui/card";
import {
  ticketSeverityLabel,
  type TicketSeverity,
} from "~/services/tickets/severity";

interface HeaderProps {
  isConnected: boolean;
  hasEverConnected: boolean;
  severity: TicketSeverity;
}

export function Header({
  isConnected,
  hasEverConnected,
  severity,
}: HeaderProps) {
  let connectionLabel = "Connecting...";
  if (isConnected) {
    connectionLabel = "Connected";
  } else if (hasEverConnected) {
    connectionLabel = "Reconnecting...";
  }
  const connectionColorClass = isConnected
    ? "text-emerald-200"
    : "text-amber-200";

  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <p
          className="text-xs tracking-[0.4em] text-cyan-300/70 uppercase"
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
          Streaming the newest {ticketSeverityLabel(severity)} tickets. Watch
          for fresh escalations and status shifts.
        </p>
      </div>
      <Card className="border-cyan-400/20 bg-slate-900/60 p-4 text-right shadow-[0_0_40px_rgba(34,211,238,0.12)]">
        <p className="text-xs text-slate-400 uppercase">Convex live updates</p>
        <p className={`mt-2 text-lg ${connectionColorClass}`}>
          {connectionLabel}
        </p>
      </Card>
    </header>
  );
}
