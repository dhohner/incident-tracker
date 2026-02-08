import type { Route } from "./+types/home";
import { useEffect, useMemo, useState } from "react";
import { useConvexConnectionState } from "convex/react";

import { PageShell } from "~/components/layout/page-shell";
import { TicketCommentsPanel } from "~/features/tickets/components/ticket-comments-panel";
import { TicketGrid } from "~/features/tickets/components/ticket-grid";
import { TicketSummary } from "~/features/tickets/components/ticket-summary";
import { TicketsHeader } from "~/features/tickets/components/tickets-header";
import { usePrioOneTickets } from "~/features/tickets/hooks/usePrioOneTickets";
import { useTicketComments } from "~/features/tickets/hooks/useTicketComments";
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
  const [selectedTicketKey, setSelectedTicketKey] = useState<string>();
  const connectionState = useConvexConnectionState();
  const statusCounts = useMemo(() => getStatusCounts(tickets), [tickets]);
  const isConnected = connectionState.isWebSocketConnected;
  const hasEverConnected = connectionState.hasEverConnected;
  const selectedTicket = tickets.find(
    (ticket) => ticket.key === selectedTicketKey,
  );
  const { comments, isLoading } = useTicketComments(selectedTicket?.key);

  useEffect(() => {
    const isSelectionMissing =
      selectedTicketKey &&
      !tickets.some((ticket) => ticket.key === selectedTicketKey);

    if (isSelectionMissing) {
      setSelectedTicketKey(undefined);
    }
  }, [selectedTicketKey, tickets]);

  const handleSelectTicket = (ticketKey: string) => {
    setSelectedTicketKey((current) =>
      current === ticketKey ? undefined : ticketKey,
    );
  };

  return (
    <PageShell>
      <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <TicketsHeader isConnected={isConnected} hasEverConnected={hasEverConnected} />
        <TicketSummary counts={statusCounts} />
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 lg:flex-[1.15]">
            <TicketGrid
              tickets={tickets}
              selectedTicketKey={selectedTicket?.key}
              onSelectTicket={handleSelectTicket}
            />
          </div>
          <aside className="min-w-0 lg:w-[28rem] lg:flex-none">
            <TicketCommentsPanel
              ticket={selectedTicket}
              comments={comments}
              isLoading={isLoading}
            />
          </aside>
        </section>
      </main>
    </PageShell>
  );
}
