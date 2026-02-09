import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";

const getAllCommentsArgs = (
  isTicketSelected: boolean,
  projectKey?: string,
): { projectKey?: string } | "skip" => {
  if (isTicketSelected) {
    return "skip";
  }

  if (projectKey) {
    return { projectKey };
  }

  return {};
};

export function useTicketComments(ticketKey?: string, projectKey?: string) {
  const isTicketSelected = ticketKey !== undefined;
  const ticketCommentsArgs = isTicketSelected ? { ticketKey } : "skip";
  const allCommentsArgs = getAllCommentsArgs(isTicketSelected, projectKey);
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
