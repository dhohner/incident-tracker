import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    accountId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_accountId", ["accountId"]),
  tickets: defineTable({
    key: v.string(),
    title: v.string(),
    status: v.string(),
    priority: v.string(),
    assignee: v.string(),
    service: v.string(),
    updatedAt: v.number(),
    summary: v.string(),
    description: v.string(),
    source: v.string(),
  })
    .index("by_updatedAt", ["updatedAt"])
    .index("by_key", ["key"])
    .index("by_key_source", ["key", "source"]),
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
  jiraAccounts: defineTable({
    accountId: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.number(),
    scopes: v.array(v.string()),
    cloudId: v.string(),
    siteUrl: v.string(),
    email: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_accountId", ["accountId"])
    .index("by_cloudId", ["cloudId"]),
  jiraOAuthStates: defineTable({
    accountIdHint: v.optional(v.string()),
    state: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_state", ["state"])
    .index("by_accountIdHint", ["accountIdHint"]),
  jiraSettings: defineTable({
    accountId: v.string(),
    projectKey: v.string(),
    lastSyncAt: v.optional(v.number()),
  }).index("by_accountId", ["accountId"]),
  jiraIssues: defineTable({
    accountId: v.string(),
    projectKey: v.string(),
    issueId: v.string(),
    key: v.string(),
    title: v.string(),
    description: v.string(),
    status: v.string(),
    priority: v.string(),
    assignee: v.string(),
    updatedAt: v.number(),
    summary: v.string(),
    url: v.string(),
  })
    .index("by_accountId", ["accountId"])
    .index("by_accountId_projectKey", ["accountId", "projectKey"])
    .index("by_issueId", ["issueId"]),
  jiraComments: defineTable({
    accountId: v.string(),
    issueId: v.string(),
    commentId: v.string(),
    author: v.string(),
    body: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_accountId", ["accountId"])
    .index("by_issueId", ["issueId"])
    .index("by_issueId_commentId", ["issueId", "commentId"]),
});
