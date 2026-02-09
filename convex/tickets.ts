import { query } from "./_generated/server";
import { v } from "convex/values";

const getTicketKeyPrefix = (projectKey?: string) => {
  const normalizedProjectKey = projectKey?.trim().toUpperCase();
  return normalizedProjectKey ? `${normalizedProjectKey}-` : undefined;
};

export const list = query({
  args: {
    projectKey: v.optional(v.string()),
  },
  handler: async (ctx, { projectKey }) => {
    const keyPrefix = getTicketKeyPrefix(projectKey);

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();

    return keyPrefix
      ? tickets.filter((ticket) => ticket.key.startsWith(keyPrefix))
      : tickets;
  },
});
