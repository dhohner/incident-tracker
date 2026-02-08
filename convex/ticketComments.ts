import { query } from "./_generated/server";
import { v } from "convex/values";

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
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("ticketComments")
      .withIndex("by_updated_at")
      .order("desc")
      .collect();
  },
});
