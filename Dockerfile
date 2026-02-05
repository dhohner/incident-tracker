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
ARG VITE_CONVEX_URL
ARG VITE_CONVEX_SITE_URL
ENV CONVEX_DEPLOYMENT=$CONVEX_DEPLOYMENT
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
ENV VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL
RUN --mount=type=secret,id=convex_deploy_key,required=true \
  sh -c 'CONVEX_DEPLOY_KEY="$(cat /run/secrets/convex_deploy_key)" bunx convex codegen'
RUN bun run build

FROM oven/bun:1.3.8-alpine
WORKDIR /app
COPY package.json bun.lock /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
CMD ["bun", "x", "@react-router/serve", "/app/build/server/index.js"]
