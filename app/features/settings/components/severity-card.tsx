import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ticketSeverities, type TicketSeverity } from "~/lib/tickets";

type SeverityCardProps = {
  value: TicketSeverity;
  onChange: (value: TicketSeverity) => void;
  disabled?: boolean;
};

export function SeverityCard({
  value,
  onChange,
  disabled = false,
}: SeverityCardProps) {
  return (
    <Card className="border-cyan-400/25 bg-slate-900/70">
      <CardHeader>
        <CardTitle>Displayed Ticket Severity</CardTitle>
        <CardDescription>
          Control which severity level appears on the home page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label
            htmlFor="ticket-severity"
            className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase"
          >
            Severity
          </label>
          <select
            id="ticket-severity"
            name="ticketSeverity"
            value={value}
            onChange={(event) => onChange(event.target.value as TicketSeverity)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 ring-cyan-400/50 transition outline-none focus:border-cyan-300 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled}
          >
            {ticketSeverities.map((severity) => (
              <option key={severity} value={severity}>
                {severity}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
