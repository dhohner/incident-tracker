import {
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const DEFAULT_ACCOUNT_ID = "default";

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getJiraSiteUrl = () => {
  const raw = requireEnv("JIRA_SITE_URL");
  return raw.replace(/\/$/, "");
};

const getPatAuthHeader = () => {
  const email = requireEnv("JIRA_PAT_EMAIL");
  const token = requireEnv("JIRA_PAT_TOKEN");
  const encoded = Buffer.from(`${email}:${token}`).toString("base64");
  return `Basic ${encoded}`;
};

const toPlainText = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return "";
  const node = value as { type?: string; text?: string; content?: unknown[] };
  if (node.text) return node.text;
  if (!Array.isArray(node.content)) return "";
  return node.content.map(toPlainText).filter(Boolean).join(" ").trim();
};

const summarize = (text: string, limit = 180) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit - 1)}…`;
};

export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("jiraSettings")
      .withIndex("by_accountId", (q) => q.eq("accountId", DEFAULT_ACCOUNT_ID))
      .first();
    const siteUrl = process.env.JIRA_SITE_URL ?? null;
    const patEmail = process.env.JIRA_PAT_EMAIL;
    const patToken = process.env.JIRA_PAT_TOKEN;
    return {
      connected: Boolean(siteUrl && patEmail && patToken),
      siteUrl,
      projectKey: settings?.projectKey ?? null,
      lastSyncAt: settings?.lastSyncAt ?? null,
      needsReauth: false,
    };
  },
});

export const setProjectKey = mutation({
  args: { projectKey: v.string() },
  handler: async (ctx, { projectKey }) => {
    const normalized = projectKey.trim().toUpperCase();
    if (!normalized) {
      throw new Error("Project key is required.");
    }
    const accountId = DEFAULT_ACCOUNT_ID;
    const existing = await ctx.db
      .query("jiraSettings")
      .withIndex("by_accountId", (q) => q.eq("accountId", accountId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { projectKey: normalized });
    } else {
      await ctx.db.insert("jiraSettings", {
        accountId,
        projectKey: normalized,
      });
    }
    return { projectKey: normalized };
  },
});

export const getSettings = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query("jiraSettings")
      .withIndex("by_accountId", (q) => q.eq("accountId", DEFAULT_ACCOUNT_ID))
      .first();
  },
});

export const syncAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.runQuery(internal.jira.getSettings, {});
    if (!settings?.projectKey) return;
    await syncAccount(ctx, settings.projectKey);
  },
});

const fetchJson = async <T>(
  url: string,
  authHeader: string,
  init?: RequestInit,
) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Jira API error ${response.status}: ${detail}`);
  }
  return response.json() as Promise<T>;
};

const syncAccount = async (ctx: ActionCtx, projectKey: string) => {
  const now = Date.now();
  const siteUrl = getJiraSiteUrl();
  const authHeader = getPatAuthHeader();

  const searchUrl = `${siteUrl}/rest/api/3/search`;
  const searchResult = await fetchJson<{
    issues: Array<{
      id: string;
      key: string;
      fields: {
        summary?: string;
        status?: { name?: string };
        priority?: { name?: string };
        assignee?: { displayName?: string };
        description?: unknown;
        updated?: string;
        project?: { key?: string; name?: string };
      };
    }>;
  }>(searchUrl, authHeader, {
    method: "POST",
    body: JSON.stringify({
      jql: `project = ${projectKey} ORDER BY updated DESC`,
      maxResults: 25,
      fields: [
        "summary",
        "status",
        "priority",
        "assignee",
        "description",
        "updated",
        "project",
      ],
    }),
  });

  const issuePayloads = searchResult.issues.map((issue) => {
    const description = toPlainText(issue.fields.description);
    return {
      issueId: issue.id,
      key: issue.key,
      title: issue.fields.summary ?? issue.key,
      description,
      status: issue.fields.status?.name ?? "Unknown",
      priority: issue.fields.priority?.name ?? "Unspecified",
      assignee: issue.fields.assignee?.displayName ?? "Unassigned",
      updatedAt: issue.fields.updated ? Date.parse(issue.fields.updated) : now,
      projectKey,
      summary: summarize(description) || issue.fields.summary || "",
      url: `${siteUrl}/browse/${issue.key}`,
    };
  });

  await ctx.runMutation(internal.jira.upsertIssues, {
    accountId: DEFAULT_ACCOUNT_ID,
    projectKey,
    issues: issuePayloads,
  });

  const commentPayloads: Array<{
    issueId: string;
    comments: Array<{
      commentId: string;
      author: string;
      body: string;
      createdAt: number;
      updatedAt: number;
    }>;
  }> = [];

  for (const issue of searchResult.issues) {
    const commentUrl = `${siteUrl}/rest/api/3/issue/${issue.id}/comment?maxResults=100`;
    const commentResult = await fetchJson<{
      comments: Array<{
        id: string;
        body?: unknown;
        created?: string;
        updated?: string;
        author?: { displayName?: string };
      }>;
    }>(commentUrl, authHeader);
    commentPayloads.push({
      issueId: issue.id,
      comments: commentResult.comments.map((comment) => ({
        commentId: comment.id,
        author: comment.author?.displayName ?? "Unknown",
        body: toPlainText(comment.body),
        createdAt: comment.created ? Date.parse(comment.created) : now,
        updatedAt: comment.updated ? Date.parse(comment.updated) : now,
      })),
    });
  }

  await ctx.runMutation(internal.jira.upsertComments, {
    accountId: DEFAULT_ACCOUNT_ID,
    issueComments: commentPayloads,
  });

  await ctx.runMutation(internal.jira.updateSyncStatus, {
    accountId: DEFAULT_ACCOUNT_ID,
    lastSyncAt: now,
  });
};

export const upsertIssues = internalMutation({
  args: {
    accountId: v.string(),
    projectKey: v.string(),
    issues: v.array(
      v.object({
        issueId: v.string(),
        key: v.string(),
        title: v.string(),
        description: v.string(),
        status: v.string(),
        priority: v.string(),
        assignee: v.string(),
        updatedAt: v.number(),
        projectKey: v.string(),
        summary: v.string(),
        url: v.string(),
      }),
    ),
  },
  handler: async (ctx, { accountId, issues }) => {
    for (const issue of issues) {
      const existingIssue = await ctx.db
        .query("jiraIssues")
        .withIndex("by_issueId", (q) => q.eq("issueId", issue.issueId))
        .first();
      if (existingIssue) {
        await ctx.db.patch(existingIssue._id, {
          ...issue,
          accountId,
        });
      } else {
        await ctx.db.insert("jiraIssues", { ...issue, accountId });
      }

      const existingTicket = await ctx.db
        .query("tickets")
        .withIndex("by_key_source", (q) =>
          q.eq("key", issue.key).eq("source", "jira"),
        )
        .first();
      if (existingTicket) {
        await ctx.db.patch(existingTicket._id, {
          key: issue.key,
          title: issue.title,
          status: issue.status,
          priority: issue.priority,
          assignee: issue.assignee,
          service: issue.projectKey,
          updatedAt: issue.updatedAt,
          summary: issue.summary,
          description: issue.description,
          source: "jira",
        });
      } else {
        await ctx.db.insert("tickets", {
          key: issue.key,
          title: issue.title,
          status: issue.status,
          priority: issue.priority,
          assignee: issue.assignee,
          service: issue.projectKey,
          updatedAt: issue.updatedAt,
          summary: issue.summary,
          description: issue.description,
          source: "jira",
        });
      }
    }
  },
});

export const upsertComments = internalMutation({
  args: {
    accountId: v.string(),
    issueComments: v.array(
      v.object({
        issueId: v.string(),
        comments: v.array(
          v.object({
            commentId: v.string(),
            author: v.string(),
            body: v.string(),
            createdAt: v.number(),
            updatedAt: v.number(),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, { accountId, issueComments }) => {
    for (const issue of issueComments) {
      for (const comment of issue.comments) {
        const existing = await ctx.db
          .query("jiraComments")
          .withIndex("by_issueId_commentId", (q) =>
            q.eq("issueId", issue.issueId).eq("commentId", comment.commentId),
          )
          .first();
        if (existing) {
          await ctx.db.patch(existing._id, {
            ...comment,
            accountId,
            issueId: issue.issueId,
          });
        } else {
          await ctx.db.insert("jiraComments", {
            ...comment,
            accountId,
            issueId: issue.issueId,
          });
        }
      }
    }
  },
});

export const updateSyncStatus = internalMutation({
  args: { accountId: v.string(), lastSyncAt: v.number() },
  handler: async (ctx, { accountId, lastSyncAt }) => {
    const settings = await ctx.db
      .query("jiraSettings")
      .withIndex("by_accountId", (q) => q.eq("accountId", accountId))
      .first();
    if (settings) {
      await ctx.db.patch(settings._id, { lastSyncAt });
    }
  },
});
