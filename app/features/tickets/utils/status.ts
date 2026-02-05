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

export function getStatusCounts(tickets: Ticket[]): StatusCounts {
  let open = 0;
  let inProgress = 0;
  let mitigated = 0;

  tickets.forEach((ticket) => {
    if (matchesAny(ticket.status, statusMatchers.mitigated)) {
      mitigated += 1;
      return;
    }
    if (matchesAny(ticket.status, statusMatchers.inProgress)) {
      inProgress += 1;
      return;
    }
    if (matchesAny(ticket.status, statusMatchers.open)) {
      open += 1;
    }
  });

  return { open, inProgress, mitigated };
}
