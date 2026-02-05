import { query } from "./_generated/server";

export const list = query(async (ctx) => {
  return ctx.db
    .query("tickets")
    .withIndex("by_updatedAt")
    .order("desc")
    .collect();
});
