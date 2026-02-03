import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Ticket, TicketStats, UpdateItem } from "./types";
import { getTrackingMessage } from "./utils";

type HomeState = {
  autoSync: boolean;
  trackedKey: string;
  trackingMessage: string;
  showConvexBanner: boolean;
  stats: TicketStats;
  trackedTicket: Ticket | null;
  ticketList: Ticket[];
  updatesList: UpdateItem[];
  onAutoSyncChange: (value: boolean) => void;
  onManualUpdate: () => void;
  onResetSeed: () => void;
  onTrackChange: (value: string) => void;
  onClearTracking: () => void;
};

const useSeedTickets = (seed: (args: { reset?: boolean }) => Promise<unknown>) => {
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    void seed({});
  }, [seed]);
};

const useAutoSyncUpdates = (
  autoSync: boolean,
  simulateUpdate: (args: Record<string, never>) => Promise<unknown>,
) => {
  useEffect(() => {
    if (!autoSync) return;
    const handle = window.setInterval(() => {
      void simulateUpdate({});
    }, 5000);
    return () => window.clearInterval(handle);
  }, [autoSync, simulateUpdate]);
};

const useTicketStats = (tickets: Ticket[] | undefined): TicketStats =>
  useMemo(() => {
    return (tickets ?? []).reduce(
      (acc, ticket) => {
        if (ticket.status === "Open") acc.openCount += 1;
        if (ticket.status === "In Progress") acc.inProgressCount += 1;
        if (ticket.priority === "P0" || ticket.priority === "P1") {
          acc.criticalCount += 1;
        }
        return acc;
      },
      { openCount: 0, inProgressCount: 0, criticalCount: 0 },
    );
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
  const [autoSync, setAutoSync] = useState(false);
  const [trackedKey, setTrackedKey] = useState("");
  const convexUrl = import.meta.env.VITE_CONVEX_URL;

  const tickets = useQuery(api.tickets.list) as Ticket[] | undefined;
  const updates = useQuery(api.tickets.recentUpdates, {
    limit: 6,
  }) as UpdateItem[] | undefined;

  const seed = useMutation(api.tickets.seed);
  const simulateUpdate = useMutation(api.tickets.simulateUpdate);

  useSeedTickets(seed);
  useAutoSyncUpdates(autoSync, simulateUpdate);

  const stats = useTicketStats(tickets);
  const trackedTicket = useTrackedTicket(tickets, trackedKey);

  const handleTrackChange = (value: string) => {
    setTrackedKey(value.toUpperCase());
  };
  const handleClearTracking = () => setTrackedKey("");
  const handleManualUpdate = () => void simulateUpdate({});
  const handleResetSeed = () => void seed({ reset: true });

  return {
    autoSync,
    trackedKey,
    trackingMessage: getTrackingMessage(trackedKey, trackedTicket),
    showConvexBanner: !convexUrl,
    stats,
    trackedTicket,
    ticketList: tickets ?? [],
    updatesList: updates ?? [],
    onAutoSyncChange: setAutoSync,
    onManualUpdate: handleManualUpdate,
    onResetSeed: handleResetSeed,
    onTrackChange: handleTrackChange,
    onClearTracking: handleClearTracking,
  };
};
