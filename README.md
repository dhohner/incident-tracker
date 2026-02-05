# Incident Tracker

Enterprise-ready incident tracking console built with React Router + Convex.

## Highlights

- 🚀 React Router SSR with Convex realtime data
- ⚡️ Vite + HMR
- 🎉 TailwindCSS styling
- 🔒 TypeScript strict mode
- 🧱 Feature-based architecture with reusable UI primitives

## Getting Started

### Installation

Install the dependencies:

```bash
bun install
```

### Quickstart

1. Start Convex (backend + database):

```bash
bunx convex dev
```

Copy the `VITE_CONVEX_URL` value printed in the output.

2. Create a local env file and add the URL:

```bash
cat <<'EOF' > .env
VITE_CONVEX_URL=your-convex-url
EOF
```

3. Start the app:

```bash
bun run dev
```

### Development

Start the development server with HMR:

```bash
bun run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t incident-tracker .

# Run the container
docker run -p 3000:3000 incident-tracker
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `bun run build`

```
├── package.json
├── bun.lock
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Project Structure

```text
app/
  components/
    ui/             # Reusable UI primitives (shadcn/ui-style)
    layout/         # Layout shells
  features/
    tickets/        # Ticket-specific logic & UI
  routes/           # Route modules
  lib/              # Shared utilities
convex/             # Backend functions & schema
public/             # Static assets
```

---

## Jira Integration (PAT + Cron)

### Required environment variables (Convex)

Set these in your Convex environment (Dashboard or `convex env set`), and in your local dev `.env` if needed:

- `JIRA_SITE_URL` (e.g. `https://your-domain.atlassian.net`)
- `JIRA_PAT_EMAIL` (email address for the Jira user who owns the PAT)
- `JIRA_PAT_TOKEN` (Jira Cloud personal access token)

## Convex Environment Setup

You can manage Convex environment variables in the Convex Dashboard or via CLI:

```bash
bunx convex env set JIRA_SITE_URL https://your-domain.atlassian.net
bunx convex env set JIRA_PAT_EMAIL you@example.com
bunx convex env set JIRA_PAT_TOKEN your-token
```

For local development, ensure `VITE_CONVEX_URL` is set in `.env` as shown in the quickstart above.

### Project selection

The UI accepts a Jira Project Key (e.g. `INC`). The cron job syncs the most recently updated issues for each connected user every minute.

---

Built with ❤️ using React Router.
