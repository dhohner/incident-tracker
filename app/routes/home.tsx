import type { Route } from "./+types/home";
import { useEffect, useMemo, useState } from "react";
import { useConvexConnectionState, useQuery } from "convex/react";

import { api } from "../../convex/_generated/api";
import { PageShell } from "~/components/layout/page-shell";
import { PreferencesDialog } from "~/features/settings/components/dialog";
import { TicketCommentsPanel } from "~/features/tickets/components/ticket-comments-panel";
import { TicketGrid } from "~/features/tickets/components/ticket-grid";
import { TicketSummary } from "~/features/tickets/components/ticket-summary";
import { TicketsHeader } from "~/features/tickets/components/tickets-header";
import { useTicketsWithSeverity } from "~/features/tickets/hooks/useTicketsWithSeverity";
import { useTicketComments } from "~/features/tickets/hooks/useTicketComments";
import { getStatusCounts } from "~/features/tickets/utils/status";
import { normalizeTicketSeverity } from "~/lib/tickets";

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
  const jiraStatus = useQuery(api.jira.getStatus);
  const activeProjectKey = jiraStatus?.projectKey ?? undefined;
  const allProjectTickets = useQuery(
    api.tickets.list,
    activeProjectKey ? { projectKey: activeProjectKey } : {},
  );
  const ticketSeverity = normalizeTicketSeverity(jiraStatus?.ticketSeverity);
  const tickets = useTicketsWithSeverity(allProjectTickets, 10, ticketSeverity);
  const [selectedTicketKey, setSelectedTicketKey] = useState<string>();
  const connectionState = useConvexConnectionState();
  const statusCounts = useMemo(() => getStatusCounts(tickets), [tickets]);
  const isConnected = connectionState.isWebSocketConnected;
  const hasEverConnected = connectionState.hasEverConnected;
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const selectedTicket = tickets.find(
    (ticket) => ticket.key === selectedTicketKey,
  );
  const { comments, isLoading } = useTicketComments(
    selectedTicket?.key,
    activeProjectKey,
  );

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
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setIsPreferencesOpen(true)}
            className="cursor-pointer rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-cyan-100 uppercase transition hover:border-cyan-300/70 hover:bg-cyan-500/20"
          >
            Settings
          </button>
        </div>
        <TicketsHeader
          isConnected={isConnected}
          hasEverConnected={hasEverConnected}
          severity={ticketSeverity}
        />
        <TicketSummary counts={statusCounts} />
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 lg:flex-[1.15]">
            <TicketGrid
              tickets={tickets}
              selectedTicketKey={selectedTicket?.key}
              onSelectTicket={handleSelectTicket}
            />
          </div>
          <aside className="min-w-0 lg:w-md lg:flex-none">
            <TicketCommentsPanel
              ticket={selectedTicket}
              comments={comments}
              isLoading={isLoading}
            />
          </aside>
        </section>
        <PreferencesDialog
          open={isPreferencesOpen}
          onOpenChange={setIsPreferencesOpen}
        />
      </main>
    </PageShell>
  );
}
