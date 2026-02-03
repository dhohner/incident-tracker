# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the React Router app source. Entry points are `app/root.tsx` and `app/routes.ts`, with route modules in `app/routes/`.
- `app/app.css` holds global styles; Tailwind is configured via Vite.
- `public/` contains static assets served as-is.
- `convex/` holds backend data functions and schema (`convex/schema.ts`, `convex/tickets.ts`).
- Build output is generated in `build/` (server and client bundles) after `bun run build`.

## Build, Test, and Development Commands
- `bun run dev`: start the local dev server with HMR.
- `bun run build`: create a production build in `build/`.
- `bun run start`: serve the production build via the React Router server.
- `bun run typecheck`: run React Router typegen and TypeScript type checking.
- `docker build -t incident-tracker .`: build the Docker image.
- `docker run -p 3000:3000 incident-tracker`: run the containerized app.

## Coding Style & Naming Conventions
- Language: TypeScript + React. Use `.tsx` for components and route modules, `.ts` for non-UI code.
- Indentation: 2 spaces (match existing files).
- No repo-wide lint/format config is present; keep formatting consistent with nearby code.
- Prefer descriptive, kebab-free file names for routes (e.g., `app/routes/home.tsx`).

## Type Safety & LSP
- After UI changes, run `bun run typecheck` and fix any TS/LSP errors before further refactors.
- HeroUI props are strictly typed; only use documented `variant/color/size` values.
- Avoid guessing component props: check `node_modules/@heroui/react/dist/components/*/*.d.ts` when unsure.
- Do not suppress errors with `any`; resolve the underlying type mismatch.

## Testing Guidelines
- No test framework or test directory is currently configured.
- If adding tests, introduce a clear convention (e.g., `app/**/__tests__/*.test.tsx`) and document the command in `package.json`.

## Commit & Pull Request Guidelines
- Git history is empty, so no commit message convention is established. Use concise, imperative messages (e.g., “Add ticket status badge”).
- PRs should include: a short summary, test/verification notes, and screenshots for UI changes.
- Link relevant issues and call out any required configuration changes.

## Configuration & Security Notes
- Avoid committing secrets. If you add environment variables, document them in `README.md` and keep them in an untracked `.env` file.
