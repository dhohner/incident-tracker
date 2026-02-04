import type { Ticket } from "./types";

type ChipColor = "default" | "success" | "warning" | "danger" | "accent";

const STATUS_COLOR: Record<string, ChipColor> = {
  Open: "warning",
  "In Progress": "accent",
  "Needs Review": "default",
  "Awaiting Vendor": "default",
  Resolved: "success",
  Monitoring: "success",
  Blocked: "danger",
};

const PRIORITY_COLOR: Record<string, ChipColor> = {
  P0: "danger",
  P1: "warning",
  P2: "accent",
  P3: "default",
};

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  month: "short",
  day: "numeric",
});

export const formatTime = (value: number) =>
  TIME_FORMATTER.format(new Date(value));

export const getStatusColor = (status: string) =>
  STATUS_COLOR[status] ?? "default";

export const getPriorityColor = (priority: string) =>
  PRIORITY_COLOR[priority] ?? "default";

export const getTrackingMessage = (
  trackedKey: string,
  trackedTicket: Ticket | null,
) => {
  if (!trackedKey) return "Enter a ticket key to follow updates";
  if (trackedTicket) return `Tracking ${trackedTicket.key}`;
  return "No matching ticket yet";
};
