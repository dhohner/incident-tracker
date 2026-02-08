# Incident Tracker

## Quickstart (Local)

1. Install dependencies:

```bash
bun install
```

2. Start Convex (backend + database):

```bash
bunx convex dev
```

Copy the `VITE_CONVEX_URL` value printed in the output.

3. Create a local env file:

```bash
cat <<'EOF' > .env.local
VITE_CONVEX_URL=your-convex-url
EOF
```

4. Start the app:

```bash
bun run dev
```

The app runs at `http://localhost:5173`.

## Docker (Optional)

Build and run:

```bash
docker build -t incident-tracker .
docker run -p 3000:3000 incident-tracker
```

## Mise (Self-Hosted Convex + App)

1. Determine container runtime (Docker or Podman):

```bash
export CONTAINER_TOOL="$(mise run detect-container-tool)"
```

2. Create Instance Secret:

```bash
# Generate a random secret
openssl rand -hex 32
```

3. Create `.env.local`:

```bash
cat <<'EOF' > .env.local
INSTANCE_NAME=convex_self_hosted
INSTANCE_SECRET=your-secret
POSTGRES_USER=convex
POSTGRES_PASSWORD=your-postgres-password
POSTGRES_DB=convex_self_hosted
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=your-admin-key
VITE_CONVEX_URL=http://127.0.0.1:3210
EOF
```

4. Start Convex (backend + dashboard):

```bash
mise run convex-up
```

5. Generate an admin key:

```bash
$CONTAINER_TOOL exec incident-tracker-convex-backend ./generate_admin_key.sh
```

6. Run the app with hot reload:

```bash
mise run run-dev
```

Stop containers (volumes kept):

```bash
mise run convex-down
```
