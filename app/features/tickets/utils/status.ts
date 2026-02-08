import type { Ticket } from "~/lib/tickets";

const statusMatchers = {
  open: ["open", "to do", "new", "neu", "zu erledigen"],
  inProgress: ["in progress", "in arbeit", "doing", "progress"],
  mitigated: ["mitigated", "resolved", "done", "closed", "geschlosse"],
};

export type StatusCounts = {
  open: number;
  inProgress: number;
  mitigated: number;
};

const normalize = (value: string) => value.toLowerCase().trim();
const matchesAny = (value: string, options: string[]) =>
  options.some((label) => normalize(value).includes(label));

export type TicketStatusCategory =
  | "open"
  | "inProgress"
  | "mitigated"
  | "unknown";

export function getStatusCategory(status: string): TicketStatusCategory {
  if (matchesAny(status, statusMatchers.mitigated)) {
    return "mitigated";
  }
  if (matchesAny(status, statusMatchers.inProgress)) {
    return "inProgress";
  }
  if (matchesAny(status, statusMatchers.open)) {
    return "open";
  }
  return "unknown";
}

export function getStatusCounts(tickets: Ticket[]): StatusCounts {
  let open = 0;
  let inProgress = 0;
  let mitigated = 0;

  tickets.forEach((ticket) => {
    const category = getStatusCategory(ticket.status);

    if (category === "mitigated") {
      mitigated += 1;
      return;
    }
    if (category === "inProgress") {
      inProgress += 1;
      return;
    }
    if (category === "open") {
      open += 1;
    }
  });

  return { open, inProgress, mitigated };
}
