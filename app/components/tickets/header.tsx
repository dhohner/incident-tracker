import { ConnectionStatus } from "~/components/tickets/connection-status";
import {
  ticketSeverityLabel,
  type TicketSeverity,
} from "~/services/tickets/severity";

interface HeaderProps {
  severity: TicketSeverity;
}

export function Header({ severity }: HeaderProps) {
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
      <ConnectionStatus />
    </header>
  );
}
