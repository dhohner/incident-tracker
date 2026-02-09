import { query } from "./_generated/server";
import { v } from "convex/values";

const getTicketKeyPrefix = (projectKey?: string) => {
  const normalizedProjectKey = projectKey?.trim().toUpperCase();
  return normalizedProjectKey ? `${normalizedProjectKey}-` : undefined;
};

export const listByTicketKey = query({
  args: {
    ticketKey: v.string(),
  },
  handler: async (ctx, { ticketKey }) => {
    return ctx.db
      .query("ticketComments")
      .withIndex("by_ticket_key", (q) => q.eq("ticketKey", ticketKey))
      .order("desc")
      .collect();
  },
});

export const listAllLatest = query({
  args: {
    projectKey: v.optional(v.string()),
  },
  handler: async (ctx, { projectKey }) => {
    const keyPrefix = getTicketKeyPrefix(projectKey);
    const comments = await ctx.db
      .query("ticketComments")
      .withIndex("by_updated_at")
      .order("desc")
      .collect();

    return keyPrefix
      ? comments.filter((comment) => comment.ticketKey.startsWith(keyPrefix))
      : comments;
  },
});
