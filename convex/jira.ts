import { internalAction, internalMutation, query } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getProjectKey = () => requireEnv("JIRA_PROJECT_KEY").trim().toUpperCase();

const getJiraSiteUrl = () => {
  const raw = requireEnv("JIRA_SITE_URL");
  return raw.replace(/\/$/, "");
};

const getPatAuthHeader = () => {
  const email = requireEnv("JIRA_PAT_EMAIL");
  const token = requireEnv("JIRA_PAT_TOKEN");
  const encoded = base64Encode(`${email}:${token}`);
  return `Basic ${encoded}`;
};

const base64Encode = (value: string) => {
  // Convex actions run in a JS runtime without Node's Buffer.
  if (typeof btoa === "function") return btoa(value);
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
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

const toTicketFields = (params: {
  key: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  updatedAt: number;
}) => ({
  key: params.key,
  title: params.title,
  description: params.description,
  status: params.status,
  priority: params.priority,
  assignee: params.assignee,
  updatedAt: params.updatedAt,
});

const fetchIssueComments = async (params: {
  siteUrl: string;
  issueIdOrKey: string;
  authHeader: string;
}) => {
  const { siteUrl, issueIdOrKey, authHeader } = params;
  const encodedIssueIdOrKey = encodeURIComponent(issueIdOrKey);
  const comments: Array<{
    jiraCommentId: string;
    ticketKey: string;
    body: string;
    author: string;
    updatedAt: number;
  }> = [];

  let startAt = 0;
  let total = Number.POSITIVE_INFINITY;

  while (startAt < total) {
    const url = `${siteUrl}/rest/api/3/issue/${encodedIssueIdOrKey}/comment?startAt=${startAt}&maxResults=100&orderBy=created`;
    const result = await fetchJson<{
      startAt: number;
      maxResults: number;
      total: number;
      comments: Array<{
        id: string;
        body?: unknown;
        author?: { displayName?: string };
        updated?: string;
      }>;
    }>(url, authHeader);

    total = result.total;

    comments.push(
      ...result.comments.map((comment) => ({
        jiraCommentId: comment.id,
        ticketKey: issueIdOrKey,
        body: toPlainText(comment.body),
        author: comment.author?.displayName ?? "Unknown",
        updatedAt: comment.updated ? Date.parse(comment.updated) : Date.now(),
      })),
    );

    startAt = result.startAt + result.maxResults;
  }

  return comments;
};

export const getStatus = query({
  args: {},
  handler: async () => {
    const siteUrl = process.env.JIRA_SITE_URL ?? null;
    const projectKey = process.env.JIRA_PROJECT_KEY ?? null;
    const patEmail = process.env.JIRA_PAT_EMAIL;
    const patToken = process.env.JIRA_PAT_TOKEN;
    return {
      connected: Boolean(siteUrl && patEmail && patToken),
      siteUrl,
      projectKey,
      lastSyncAt: null,
      needsReauth: false,
    };
  },
});

export const syncAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const projectKey = getProjectKey();
    await syncAccount(ctx, projectKey);
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

  const searchUrl = `${siteUrl}/rest/api/3/search/jql`;
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

  const ticketPayloads = searchResult.issues.map((issue) => {
    const description = toPlainText(issue.fields.description);
    return toTicketFields({
      key: issue.key,
      title: issue.fields.summary ?? issue.key,
      description,
      status: issue.fields.status?.name ?? "Unknown",
      priority: issue.fields.priority?.name ?? "Unspecified",
      assignee: issue.fields.assignee?.displayName ?? "Unassigned",
      updatedAt: issue.fields.updated ? Date.parse(issue.fields.updated) : now,
    });
  });

  await ctx.runMutation(internal.jira.upsertTickets, {
    tickets: ticketPayloads,
  });

  for (const issue of searchResult.issues) {
    const comments = await fetchIssueComments({
      siteUrl,
      issueIdOrKey: issue.key,
      authHeader,
    });
    await ctx.runMutation(internal.jira.upsertTicketComments, {
      ticketKey: issue.key,
      comments,
    });
  }
};

export const upsertTickets = internalMutation({
  args: {
    tickets: v.array(
      v.object({
        key: v.string(),
        title: v.string(),
        description: v.string(),
        status: v.string(),
        priority: v.string(),
        assignee: v.string(),
        updatedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, { tickets }) => {
    for (const ticket of tickets) {
      const existingTicket = await ctx.db
        .query("tickets")
        .withIndex("by_key", (q) => q.eq("key", ticket.key))
        .first();
      if (existingTicket) {
        await ctx.db.patch(existingTicket._id, ticket);
      } else {
        await ctx.db.insert("tickets", ticket);
      }
    }
  },
});

export const upsertTicketComments = internalMutation({
  args: {
    ticketKey: v.string(),
    comments: v.array(
      v.object({
        jiraCommentId: v.string(),
        ticketKey: v.string(),
        body: v.string(),
        author: v.string(),
        updatedAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, { ticketKey, comments }) => {
    const incomingCommentIds = new Set(
      comments.map((comment) => comment.jiraCommentId),
    );

    for (const comment of comments) {
      const existingComment = await ctx.db
        .query("ticketComments")
        .withIndex("by_jira_comment_id", (q) =>
          q.eq("jiraCommentId", comment.jiraCommentId),
        )
        .first();

      if (existingComment) {
        await ctx.db.patch(existingComment._id, comment);
      } else {
        await ctx.db.insert("ticketComments", comment);
      }
    }

    const existingCommentsForTicket = await ctx.db
      .query("ticketComments")
      .withIndex("by_ticket_key", (q) => q.eq("ticketKey", ticketKey))
      .collect();

    for (const existingComment of existingCommentsForTicket) {
      if (!incomingCommentIds.has(existingComment.jiraCommentId)) {
        await ctx.db.delete(existingComment._id);
      }
    }
  },
});
