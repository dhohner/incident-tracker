# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the React Router app source.
- Entry points are `app/root.tsx` and `app/routes.ts`; route modules are in `app/routes/` (`home.tsx`, `settings.tsx`).
- Ticket UI is organized under `app/features/tickets/` (components, hooks, and utils).
- Shared UI/layout building blocks live in `app/components/`; app-level helpers are in `app/lib/`.
- Global styles are in `app/app.css` (Tailwind CSS v4 via Vite).
- `convex/` contains backend schema and functions:
  - `convex/schema.ts` defines `tickets`, `ticketComments`, and `settings` tables.
  - `convex/jira.ts` handles Jira status, project-key settings, and sync actions/mutations.
  - `convex/crons.ts` schedules periodic Jira sync.
  - `convex/tickets.ts` and `convex/ticketComments.ts` expose query functions used by the UI.
- `convex/_generated/` contains generated Convex API/types; treat as generated output.
- `public/` contains static assets served as-is.
- Production build output is generated in `build/` by `bun run build`.

## Build, Dev, and Runtime Commands
- `bun install`: install dependencies.
- `bun run dev`: start React Router dev server with HMR.
- `bun run build`: create production build in `build/`.
- `bun run start`: serve production build from `build/server/index.js`.
- `bun run typecheck`: run React Router typegen + TypeScript checking.
- `bunx convex dev`: run Convex dev backend and database locally.

Container workflows:
- `docker build -t incident-tracker .`: build app image.
- `docker run -p 3000:3000 incident-tracker`: run built image.

Mise workflows (self-hosted Convex + app orchestration):
- `mise run help`: list available tasks.
- `mise run dev`: start self-hosted Convex and run app with hot reload.
- `mise run start`: start self-hosted Convex, build, and run app container.
- `mise run down`: stop self-hosted Convex/app containers.
- `mise run convex-init`: bootstrap self-hosted Convex env and prompt for Jira env setup.

## Coding Style & Naming Conventions
- Language: TypeScript + React.
- Use `.tsx` for components/routes and `.ts` for non-UI modules.
- Indentation: 2 spaces; match surrounding file style.
- Keep route module names descriptive and consistent with existing files (`home.tsx`, `settings.tsx`).
- Prefer colocating feature logic in `app/features/<feature>/...` when adding new UI capabilities.

## Type Safety & Generated Types
- Run `bun run typecheck` after changes and resolve all TS/LSP errors.
- Do not suppress type errors with `any` unless absolutely unavoidable; prefer explicit narrowing and shared types.
- Prefer using Convex-generated types from `convex/_generated/*` and app types derived from schema docs.
- When schema or Convex function signatures change, regenerate/update generated artifacts via Convex tooling before finalizing.

## Testing Guidelines
- No dedicated test framework is currently configured.
- If you add tests, use a clear convention (for example, `app/**/__tests__/*.test.tsx`) and add a runnable command in `package.json`.
- At minimum, validate changes with `bun run typecheck` and any relevant local run path (`bun run dev` or `mise run dev`).

## Commit & Pull Request Guidelines
- Use concise, imperative commit messages (for example, `Add ticket comment sync guard`).
- PRs should include:
  - short summary of behavior changes,
  - verification steps/results (`bun run typecheck`, local runtime checks),
  - screenshots or short recordings for UI changes.
- Link related issues and highlight any config/env changes required to run the update.

## Configuration & Security Notes
- Keep secrets out of git; use `.env.local` for local configuration.
- Required app env: `VITE_CONVEX_URL`.
- Jira/Convex sync relies on environment values such as:
  - `JIRA_PAT_EMAIL`
  - `JIRA_PAT_TOKEN`
  - `JIRA_PROJECT_KEY`
  - `JIRA_SITE_URL`
- For self-hosted Convex flows, also configure variables used by `mise`/compose (for example `INSTANCE_SECRET`, `CONVEX_SELF_HOSTED_URL`, `CONVEX_SELF_HOSTED_ADMIN_KEY`, and Postgres settings).
