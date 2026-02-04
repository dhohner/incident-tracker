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

const DEFAULT_SCOPES = [
  "read:jira-work",
  "read:jira-user",
  "read:me",
  "read:account",
  "offline_access",
];

const JIRA_AUTH_BASE = "https://auth.atlassian.com";
const JIRA_API_BASE = "https://api.atlassian.com";

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getScopes = () => {
  const raw = process.env.JIRA_OAUTH_SCOPES;
  const scopes = raw ? raw.split(/\s+/).filter(Boolean) : DEFAULT_SCOPES;
  if (!scopes.includes("offline_access")) scopes.push("offline_access");
  return Array.from(new Set(scopes));
};

const stringifyAuthUrl = (state: string) => {
  const clientId = requireEnv("JIRA_CLIENT_ID");
  const redirectUri = requireEnv("JIRA_OAUTH_CALLBACK_URL");
  const url = new URL(`${JIRA_AUTH_BASE}/authorize`);
  url.searchParams.set("audience", "api.atlassian.com");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", getScopes().join(" "));
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("prompt", "consent");
  return url.toString();
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

export const getAuthUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const state = crypto.randomUUID();
    await ctx.db.insert("jiraOAuthStates", {
      accountIdHint: undefined,
      state,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000,
    });
    return { url: stringifyAuthUrl(state) };
  },
});

export const getStatus = query({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }) => {
    const account = await ctx.db
      .query("jiraAccounts")
      .withIndex("by_accountId", (q) => q.eq("accountId", accountId))
      .first();
    const settings = await ctx.db
      .query("jiraSettings")
      .withIndex("by_accountId", (q) => q.eq("accountId", accountId))
      .first();
    return {
      connected: Boolean(account),
      siteUrl: account?.siteUrl ?? null,
      projectKey: settings?.projectKey ?? null,
      lastSyncAt: settings?.lastSyncAt ?? null,
      needsReauth: account ? !account.refreshToken : false,
    };
  },
});

export const setProjectKey = mutation({
  args: { accountId: v.string(), projectKey: v.string() },
  handler: async (ctx, { accountId, projectKey }) => {
    const normalized = projectKey.trim().toUpperCase();
    if (!normalized) {
      throw new Error("Project key is required.");
    }
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

export const getOAuthState = internalQuery({
  args: { state: v.string() },
  handler: async (ctx, { state }) => {
    return ctx.db
      .query("jiraOAuthStates")
      .withIndex("by_state", (q) => q.eq("state", state))
      .first();
  },
});

export const deleteOAuthState = internalMutation({
  args: { id: v.id("jiraOAuthStates") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const upsertUser = internalMutation({
  args: {
    accountId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, { accountId, email, displayName }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_accountId", (q) => q.eq("accountId", accountId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        displayName,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      accountId,
      email,
      displayName,
      createdAt: now,
      updatedAt: now,
    });
  },
});
export const upsertAccount = internalMutation({
  args: {
    accountId: v.string(),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.number(),
    scopes: v.array(v.string()),
    cloudId: v.string(),
    siteUrl: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("jiraAccounts")
      .withIndex("by_accountId", (q) => q.eq("accountId", args.accountId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert("jiraAccounts", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listAccounts = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("jiraAccounts").collect();
  },
});

export const getSettingsByUserId = internalQuery({
  args: { accountId: v.string() },
  handler: async (ctx, { accountId }) => {
    return ctx.db
      .query("jiraSettings")
      .withIndex("by_accountId", (q) => q.eq("accountId", accountId))
      .first();
  },
});

export const syncAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.runQuery(internal.jira.listAccounts, {});
    for (const account of accounts) {
      const settings = await ctx.runQuery(internal.jira.getSettingsByUserId, {
        accountId: account.accountId,
      });
      if (!settings?.projectKey) continue;
      await syncAccount(ctx, account, settings.projectKey);
    }
  },
});

const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch(`${JIRA_AUTH_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: requireEnv("JIRA_CLIENT_ID"),
      client_secret: requireEnv("JIRA_CLIENT_SECRET"),
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Failed to refresh token: ${response.status} ${detail}`);
  }
  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }>;
};

const fetchJson = async <T>(url: string, accessToken: string, init?: RequestInit) => {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Jira API error ${response.status}: ${detail}`);
  }
  return response.json() as Promise<T>;
};

const syncAccount = async (
  ctx: ActionCtx,
  account: {
    accountId: string;
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt: number;
    cloudId: string;
    siteUrl: string;
    email?: string;
    scopes: string[];
  },
  projectKey: string,
) => {
  let accessToken = account.accessToken;
  let refreshToken = account.refreshToken;
  const now = Date.now();
  if (account.accessTokenExpiresAt - now < 2 * 60 * 1000) {
    if (!refreshToken) {
      return;
    }
    const refreshed = await refreshAccessToken(refreshToken);
    accessToken = refreshed.access_token;
    refreshToken = refreshed.refresh_token ?? refreshToken;
    await ctx.runMutation(internal.jira.upsertAccount, {
      accountId: account.accountId,
      accessToken,
      refreshToken,
      accessTokenExpiresAt: now + refreshed.expires_in * 1000,
      scopes: refreshed.scope?.split(/\s+/).filter(Boolean) ?? account.scopes,
      cloudId: account.cloudId,
      siteUrl: account.siteUrl,
      email: account.email,
    });
  }

  const searchUrl = `${JIRA_API_BASE}/ex/jira/${account.cloudId}/rest/api/3/search/jql`;
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
  }>(searchUrl, accessToken, {
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
      updatedAt: issue.fields.updated
        ? Date.parse(issue.fields.updated)
        : now,
      projectKey,
      summary: summarize(description) || issue.fields.summary || "",
      url: `${account.siteUrl}/browse/${issue.key}`,
    };
  });

  await ctx.runMutation(internal.jira.upsertIssues, {
    accountId: account.accountId,
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
    const commentUrl = `${JIRA_API_BASE}/ex/jira/${account.cloudId}/rest/api/3/issue/${issue.id}/comment?maxResults=100`;
    const commentResult = await fetchJson<{
      comments: Array<{
        id: string;
        body?: unknown;
        created?: string;
        updated?: string;
        author?: { displayName?: string };
      }>;
    }>(commentUrl, accessToken);
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
    accountId: account.accountId,
    issueComments: commentPayloads,
  });

  await ctx.runMutation(internal.jira.updateSyncStatus, {
    accountId: account.accountId,
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
