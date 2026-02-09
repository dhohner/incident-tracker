# Incident Tracker

Incident Tracker is a React Router + Convex app that syncs Jira issues and comments into Convex, then distributes them via a live dashboard.

## Stack

- React 19 + React Router 7 (SSR)
- Convex (queries, mutations, actions, cron jobs)
- Tailwind CSS v4
- Bun for local app runtime
- Optional Docker/Podman + `mise` orchestration for self-hosted Convex

## Prerequisites

- Bun (project currently uses Bun 1.3.x in Docker)
- Node-compatible terminal environment
- Convex account/project for cloud dev, or Docker/Podman for self-hosted Convex
- Jira PAT credentials (email + token) and Jira site URL

## Quickstart (Convex Cloud dev)

1. Install dependencies:

```bash
bun install
```

2. Start Convex dev:

```bash
bunx convex dev
```

3. In another shell, set Convex environment variables used by Jira sync:

```bash
bunx convex env set JIRA_PAT_EMAIL "you@example.com"
bunx convex env set JIRA_PAT_TOKEN "your-jira-pat"
bunx convex env set JIRA_PROJECT_KEY "INCIDENTS"
bunx convex env set JIRA_SITE_URL "https://your-domain.atlassian.net"
```

4. Create `.env.local` with the `VITE_CONVEX_URL` printed by `convex dev`:

```bash
cat <<'EOF_ENV' > .env.local
VITE_CONVEX_URL=your-convex-url
EOF_ENV
```

5. Run the app:

```bash
bun run dev
```

App URL: `http://localhost:5173`

## App Scripts

- `bun run dev`: start dev server with HMR
- `bun run build`: production build to `build/`
- `bun run start`: serve built app
- `bun run typecheck`: React Router typegen + TypeScript checks

## Self-Hosted Convex + App (Mise)

`mise.toml` includes end-to-end tasks for Docker/Podman-based local infra.

1. Bootstrap env and Jira settings interactively:

```bash
mise run convex-init
```

2. Run with hot reload:

```bash
mise run dev
```

3. Stop containers:

```bash
mise run down
```

Useful helpers:

- `mise run help`
- `mise run convex-up`
- `mise run run-dev`
- `mise run start`

## Docker Build/Run (without Mise)

The Docker build runs `bunx convex codegen` and requires one secret:

- Cloud Convex: `CONVEX_DEPLOY_KEY`
- Self-hosted Convex: `CONVEX_SELF_HOSTED_ADMIN_KEY`

Example (cloud deployment):

```bash
export CONVEX_DEPLOYMENT="your-deployment"
export CONVEX_DEPLOY_KEY="your-deploy-key"
export VITE_CONVEX_URL="https://your-deployment.convex.cloud"

docker build \
  --secret id=convex_deploy_key,env=CONVEX_DEPLOY_KEY \
  --build-arg CONVEX_DEPLOYMENT="$CONVEX_DEPLOYMENT" \
  --build-arg VITE_CONVEX_URL="$VITE_CONVEX_URL" \
  -t incident-tracker .

docker run -p 3000:3000 incident-tracker
```
