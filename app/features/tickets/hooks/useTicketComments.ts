import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

export function useTicketComments(ticketKey?: string) {
  const isTicketSelected = ticketKey !== undefined;
  const ticketCommentsArgs = isTicketSelected ? { ticketKey } : "skip";
  const allCommentsArgs = isTicketSelected ? "skip" : {};
  const ticketComments = useQuery(
    api.ticketComments.listByTicketKey,
    ticketCommentsArgs,
  );
  const allComments = useQuery(
    api.ticketComments.listAllLatest,
    allCommentsArgs,
  );

  return {
    comments: isTicketSelected ? (ticketComments ?? []) : (allComments ?? []),
    isLoading: isTicketSelected
      ? ticketComments === undefined
      : allComments === undefined,
  };
}
