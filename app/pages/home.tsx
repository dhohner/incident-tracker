import type { Route } from "./+types/home";
import { useEffect, useMemo, useState } from "react";
import * as Ariakit from "@ariakit/react";
import { useConvexConnectionState, useQuery } from "convex/react";

import { PreferencesDialog } from "~/components/settings/dialog";
import { CommentsPanel } from "~/components/tickets/comments-panel";
import { Grid } from "~/components/tickets/grid";
import { Header } from "~/components/tickets/header";
import { Summary } from "~/components/tickets/summary";
import { appMetadata } from "~/config/constants/app";
import { useComments } from "~/hooks/useComments";
import { useSeverityTickets } from "~/hooks/useSeverityTickets";
import { PageShell } from "~/layouts/page-shell";
import { api } from "~/services/convex/api";
import { getStatusCounts } from "~/services/tickets/status";
import { normalizeTicketSeverity } from "~/services/tickets/severity";

export function meta(_: Route.MetaArgs) {
  return [
    { title: appMetadata.title },
    {
      name: "description",
      content: appMetadata.description,
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
  const p1Tickets = useSeverityTickets(allProjectTickets, 10, "P1");
  const tickets = useSeverityTickets(allProjectTickets, 10, ticketSeverity);
  const [selectedTicketKey, setSelectedTicketKey] = useState<string>();
  const connectionState = useConvexConnectionState();
  const p1StatusCounts = useMemo(() => getStatusCounts(p1Tickets), [p1Tickets]);
  const isConnected = connectionState.isWebSocketConnected;
  const hasEverConnected = connectionState.hasEverConnected;
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const preferencesDialog = Ariakit.useDialogStore({
    open: isPreferencesOpen,
    setOpen: setIsPreferencesOpen,
  });
  const selectedTicket = tickets.find(
    (ticket) => ticket.key === selectedTicketKey,
  );
  const { comments, isLoading } = useComments(
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
          <Ariakit.DialogDisclosure
            store={preferencesDialog}
            className="cursor-pointer rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-cyan-100 uppercase transition hover:border-cyan-300/70 hover:bg-cyan-500/20"
          >
            Settings
          </Ariakit.DialogDisclosure>
        </div>
        <Header
          isConnected={isConnected}
          hasEverConnected={hasEverConnected}
          severity={ticketSeverity}
        />
        <Summary counts={p1StatusCounts} />
        <section className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 lg:flex-[1.15]">
            <Grid
              tickets={tickets}
              selectedTicketKey={selectedTicket?.key}
              onSelectTicket={handleSelectTicket}
            />
          </div>
          <aside className="min-w-0 lg:w-md lg:flex-none">
            <CommentsPanel
              ticket={selectedTicket}
              comments={comments}
              isLoading={isLoading}
            />
          </aside>
        </section>
        <PreferencesDialog store={preferencesDialog} />
      </main>
    </PageShell>
  );
}
