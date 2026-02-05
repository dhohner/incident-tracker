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
RUN bun run build

FROM oven/bun:1.3.8-distroless
WORKDIR /app
COPY package.json bun.lock /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
CMD ["bun", "run", "start"]
