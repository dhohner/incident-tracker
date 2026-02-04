import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const JIRA_AUTH_BASE = "https://auth.atlassian.com";
const JIRA_API_BASE = "https://api.atlassian.com";

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const jiraOAuthCallback = httpAction(async (ctx, req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return new Response(`OAuth error: ${error}`, { status: 400 });
  }
  if (!code || !state) {
    return new Response("Missing code or state.", { status: 400 });
  }

  const stateRecord = await ctx.runQuery(internal.jira.getOAuthState, { state });
  if (!stateRecord || stateRecord.expiresAt < Date.now()) {
    return new Response("OAuth state expired. Please try again.", {
      status: 400,
    });
  }

  const tokenResponse = await fetch(`${JIRA_AUTH_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: requireEnv("JIRA_CLIENT_ID"),
      client_secret: requireEnv("JIRA_CLIENT_SECRET"),
      code,
      redirect_uri: requireEnv("JIRA_OAUTH_CALLBACK_URL"),
    }),
  });

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text();
    return new Response(`Token exchange failed: ${detail}`, { status: 500 });
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  };

  const resourcesResponse = await fetch(
    `${JIRA_API_BASE}/oauth/token/accessible-resources`,
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );
  if (!resourcesResponse.ok) {
    const detail = await resourcesResponse.text();
    return new Response(`Failed to fetch resources: ${detail}`, {
      status: 500,
    });
  }
  const resources = (await resourcesResponse.json()) as Array<{
    id: string;
    url: string;
    name: string;
    scopes: string[];
  }>;
  const resource = resources[0];
  if (!resource) {
    return new Response("No accessible Jira resources found.", { status: 400 });
  }

  const meResponse = await fetch(`${JIRA_API_BASE}/me`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const me = meResponse.ok
    ? ((await meResponse.json()) as {
        account_id?: string;
        email?: string;
        name?: string;
      })
    : null;
  if (!me?.account_id) {
    return new Response("Jira account id missing from profile.", {
      status: 400,
    });
  }

  await ctx.runMutation(internal.jira.upsertUser, {
    accountId: me.account_id,
    email: me.email,
    displayName: me.name,
  });

  await ctx.runMutation(internal.jira.upsertAccount, {
    accountId: me.account_id,
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    accessTokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
    scopes: tokenData.scope?.split(/\s+/).filter(Boolean) ?? resource.scopes,
    cloudId: resource.id,
    siteUrl: resource.url,
    email: me?.email,
  });

  await ctx.runMutation(internal.jira.deleteOAuthState, {
    id: stateRecord._id,
  });

  const redirectUrl = process.env.JIRA_OAUTH_SUCCESS_REDIRECT_URL;
  if (redirectUrl) {
    const url = new URL(redirectUrl);
    url.searchParams.set("jira_account_id", me.account_id);
    return Response.redirect(url.toString(), 302);
  }

  return new Response(
    "<html><body><h2>Jira connected.</h2><p>You can close this tab.</p></body></html>",
    { headers: { "Content-Type": "text/html" } },
  );
});

const http = httpRouter();

http.route({
  path: "/jira/oauth/callback",
  method: "GET",
  handler: jiraOAuthCallback,
});

export default http;
