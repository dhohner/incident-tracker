import * as Ariakit from "@ariakit/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  isTicketSeverity,
  ticketSeverities,
  type TicketSeverity,
} from "~/services/tickets/severity";

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
  const select = Ariakit.useSelectStore({
    value,
    setValue: (nextValue) => {
      if (typeof nextValue === "string" && isTicketSeverity(nextValue)) {
        onChange(nextValue);
      }
    },
  });

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
          <Ariakit.SelectLabel
            store={select}
            className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase"
          >
            Severity
          </Ariakit.SelectLabel>
          <Ariakit.Select
            store={select}
            name="ticketSeverity"
            className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 ring-cyan-400/50 transition outline-none focus-visible:border-cyan-300 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={disabled}
          >
            <Ariakit.SelectValue />
            <Ariakit.SelectArrow className="text-slate-300" />
          </Ariakit.Select>
          <Ariakit.SelectPopover
            store={select}
            portal={false}
            gutter={6}
            className="z-60 w-(--popover-anchor-width) overflow-hidden rounded-xl border border-slate-700 bg-slate-950/95 p-1 shadow-[0_10px_30px_rgba(2,6,23,0.7)]"
          >
            {ticketSeverities.map((severity) => (
              <Ariakit.SelectItem
                key={severity}
                store={select}
                value={severity}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-slate-200 outline-hidden data-active-item:bg-cyan-500/20"
              >
                {severity}
              </Ariakit.SelectItem>
            ))}
          </Ariakit.SelectPopover>
        </div>
      </CardContent>
    </Card>
  );
}
