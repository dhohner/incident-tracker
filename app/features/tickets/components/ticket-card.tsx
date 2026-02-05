import { formatUpdatedAt, type Ticket } from "~/lib/tickets";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card className="group relative border-slate-800 bg-slate-900/60 transition hover:border-cyan-400/40">
      <Badge className="absolute right-4 top-4 text-[11px]" variant="muted">
        {ticket.status}
      </Badge>
      <CardContent className="pt-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-cyan-400/40 bg-cyan-400/10 text-center text-xs leading-10 text-cyan-200">
            {ticket.key}
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              {ticket.title}
            </h2>
            <p className="text-xs text-slate-400">{ticket.summary}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <Badge variant="muted" className="normal-case tracking-normal">
            {ticket.service}
          </Badge>
          <Badge variant="muted" className="normal-case tracking-normal">
            {ticket.assignee}
          </Badge>
          <Badge variant="accent" className="normal-case tracking-normal">
            {formatUpdatedAt(ticket.updatedAt)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
