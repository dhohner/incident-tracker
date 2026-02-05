import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Ticket, TicketStats, UpdateItem } from "./types";
import { getTrackingMessage } from "./utils";

type HomeState = {
  trackedKey: string;
  trackingMessage: string;
  isHydrated: boolean;
  jiraConnected: boolean;
  jiraSiteUrl: string | null;
  jiraProjectKey: string;
  jiraLastSyncAt: number | null;
  stats: TicketStats;
  trackedTicket: Ticket | null;
  ticketList: Ticket[];
  updatesList: UpdateItem[];
  onProjectKeyChange: (value: string) => void;
  onProjectKeySave: () => void;
  onTrackChange: (value: string) => void;
  onClearTracking: () => void;
};

const OPEN_STATUS = "Zu Erledigen";
const IN_PROGRESS_STATUS = "In Arbeit";
const CRITICAL_PRIORITY = "Highest";

const useTicketStats = (tickets: Ticket[] | undefined): TicketStats =>
  useMemo(() => {
    const base: TicketStats = {
      openCount: 0,
      inProgressCount: 0,
      criticalCount: 0,
    };

    return (tickets ?? []).reduce((acc, ticket) => {
      if (ticket.status === OPEN_STATUS) acc.openCount += 1;
      if (ticket.status === IN_PROGRESS_STATUS) acc.inProgressCount += 1;
      if (ticket.priority === CRITICAL_PRIORITY) acc.criticalCount += 1;
      return acc;
    }, base);
  }, [tickets]);

const useTrackedTicket = (tickets: Ticket[] | undefined, trackedKey: string) =>
  useMemo(() => {
    const target = trackedKey.trim().toUpperCase();
    if (!target) return null;
    return (
      (tickets ?? []).find((ticket) => ticket.key.toUpperCase() === target) ??
      null
    );
  }, [tickets, trackedKey]);

export const useHomeState = (): HomeState => {
  const [trackedKey, setTrackedKey] = useState("");
  const [projectKeyInput, setProjectKeyInput] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  const tickets = useQuery(api.tickets.list) as Ticket[] | undefined;
  const updates = useQuery(api.tickets.recentUpdates, {
    limit: 6,
  }) as UpdateItem[] | undefined;
  const jiraStatus = useQuery(api.jira.getStatus);

  const saveProjectKey = useMutation(api.jira.setProjectKey);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  useEffect(() => {
    if (!jiraStatus?.projectKey) return;
    setProjectKeyInput(jiraStatus.projectKey);
  }, [jiraStatus?.projectKey]);

  const stats = useTicketStats(tickets);
  const trackedTicket = useTrackedTicket(tickets, trackedKey);

  const handleTrackChange = (value: string) => {
    setTrackedKey(value.toUpperCase());
  };
  const handleClearTracking = () => setTrackedKey("");
  const handleProjectKeyChange = (value: string) => {
    setProjectKeyInput(value.toUpperCase());
  };
  const handleProjectKeyCommit = () => {
    if (!projectKeyInput.trim()) return;
    void saveProjectKey({ projectKey: projectKeyInput.trim() });
  };

  return {
    trackedKey,
    trackingMessage: getTrackingMessage(trackedKey, trackedTicket),
    isHydrated,
    jiraConnected: Boolean(jiraStatus?.connected),
    jiraSiteUrl: jiraStatus?.siteUrl ?? null,
    jiraProjectKey: projectKeyInput,
    jiraLastSyncAt: jiraStatus?.lastSyncAt ?? null,
    stats,
    trackedTicket,
    ticketList: tickets ?? [],
    updatesList: updates ?? [],
    onProjectKeyChange: handleProjectKeyChange,
    onProjectKeySave: handleProjectKeyCommit,
    onTrackChange: handleTrackChange,
    onClearTracking: handleClearTracking,
  };
};
