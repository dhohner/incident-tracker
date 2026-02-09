import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const ticketFields = {
  key: v.string(),
  title: v.string(),
  status: v.string(),
  priority: v.string(),
  assignee: v.string(),
  updatedAt: v.number(),
  description: v.string(),
};

const ticketCommentFields = {
  jiraCommentId: v.string(),
  ticketKey: v.string(),
  body: v.string(),
  author: v.string(),
  updatedAt: v.number(),
};

const settingFields = {
  name: v.string(),
  value: v.string(),
};

export default defineSchema({
  tickets: defineTable({
    ...ticketFields,
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_key", ["key"]),
  ticketComments: defineTable({
    ...ticketCommentFields,
  })
    .index("by_ticket_key", ["ticketKey"])
    .index("by_updated_at", ["updatedAt"])
    .index("by_jira_comment_id", ["jiraCommentId"]),
  settings: defineTable({
    ...settingFields,
  }).index("by_name", ["name"]),
});
