# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
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

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

## Jira Integration (OAuth + Cron)

### Required environment variables (Convex)

Set these in your Convex environment (Dashboard or `convex env set`), and in your local dev `.env` if needed:

- `JIRA_CLIENT_ID`
- `JIRA_CLIENT_SECRET`
- `JIRA_OAUTH_CALLBACK_URL` (e.g. `http://127.0.0.1:3210/jira/oauth/callback`)

Optional:

- `JIRA_OAUTH_SCOPES` (space-separated scopes)
- `JIRA_OAUTH_SUCCESS_REDIRECT_URL` (send the user back to the app after OAuth)

If `JIRA_OAUTH_SUCCESS_REDIRECT_URL` is set, the callback appends
`jira_account_id` as a query parameter so the UI can establish the session.

Note: include `offline_access` in your scopes to receive refresh tokens for the 1‑minute cron sync.

### OAuth callback URL

Register the callback path `/jira/oauth/callback` in your Jira Cloud OAuth app.

### Project selection

The UI accepts a Jira Project Key (e.g. `INC`). The cron job syncs the most recently updated issues for each connected user every minute.

---

Built with ❤️ using React Router.
