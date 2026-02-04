import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query(async (ctx) => {
  return ctx.db
    .query("tickets")
    .withIndex("by_updatedAt")
    .order("desc")
    .filter((q) => q.eq(q.field("source"), "jira"))
    .collect();
});

export const recentUpdates = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    return ctx.db
      .query("updates")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
  },
});
