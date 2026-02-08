import type { Route } from "./+types/home";
import { useMemo } from "react";
import { useConvexConnectionState } from "convex/react";

import { PageShell } from "~/components/layout/page-shell";
import { TicketGrid } from "~/features/tickets/components/ticket-grid";
import { TicketSummary } from "~/features/tickets/components/ticket-summary";
import { TicketsHeader } from "~/features/tickets/components/tickets-header";
import { usePrioOneTickets } from "~/features/tickets/hooks/usePrioOneTickets";
import { getStatusCounts } from "~/features/tickets/utils/status";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Incident Tracker - JIRA Pulse" },
    {
      name: "description",
      content: "Live incident tracking console",
    },
  ];
}

export default function Home() {
  const tickets = usePrioOneTickets(10);
  const connectionState = useConvexConnectionState();
  const statusCounts = useMemo(() => getStatusCounts(tickets), [tickets]);
  const isConnected = connectionState.isWebSocketConnected;
  const hasEverConnected = connectionState.hasEverConnected;

  return (
    <PageShell>
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <TicketsHeader isConnected={isConnected} hasEverConnected={hasEverConnected} />
        <TicketSummary counts={statusCounts} />
        <TicketGrid tickets={tickets} />
      </main>
    </PageShell>
  );
}
