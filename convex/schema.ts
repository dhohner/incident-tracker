import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tickets: defineTable({
    key: v.string(),
    title: v.string(),
    status: v.string(),
    priority: v.string(),
    assignee: v.string(),
    service: v.string(),
    updatedAt: v.number(),
    summary: v.string(),
  }).index("by_updatedAt", ["updatedAt"]),
  updates: defineTable({
    ticketId: v.id("tickets"),
    ticketKey: v.string(),
    ticketTitle: v.string(),
    status: v.string(),
    priority: v.string(),
    assignee: v.string(),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
