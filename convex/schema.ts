import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const ticketFields = {
  key: v.string(),
  title: v.string(),
  status: v.string(),
  priority: v.string(),
  assignee: v.string(),
  updatedAt: v.number(),
  summary: v.string(),
  description: v.string(),
};

export default defineSchema({
  tickets: defineTable({
    ...ticketFields,
    service: v.string(),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_key", ["key"]),
});
