FROM oven/bun:1.3.8-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json bun.lock /app/
RUN bun install

FROM oven/bun:1.3.8-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json bun.lock /app/
RUN bun install --production

FROM oven/bun:1.3.8-alpine AS build-env
WORKDIR /app
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
ARG CONVEX_DEPLOYMENT
ARG CONVEX_SELF_HOSTED_URL
ARG VITE_CONVEX_URL
ARG VITE_CONVEX_SITE_URL
ENV CONVEX_DEPLOYMENT=$CONVEX_DEPLOYMENT
ENV CONVEX_SELF_HOSTED_URL=$CONVEX_SELF_HOSTED_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL
RUN --mount=type=secret,id=convex_deploy_key,required=false \
  --mount=type=secret,id=convex_admin_key,required=false \
  sh -c '\
    set -e; \
    if [ -f /run/secrets/convex_deploy_key ]; then \
      CONVEX_DEPLOY_KEY="$(cat /run/secrets/convex_deploy_key)" bunx convex codegen; \
    elif [ -f /run/secrets/convex_admin_key ]; then \
      CONVEX_SELF_HOSTED_ADMIN_KEY="$(cat /run/secrets/convex_admin_key)" bunx convex codegen; \
    else \
      echo "Missing convex deploy/admin key for codegen"; \
      exit 1; \
    fi'
RUN bun run build

FROM node:24-alpine
WORKDIR /app
COPY package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
CMD ["npx", "@react-router/serve", "/app/build/server/index.js"]
