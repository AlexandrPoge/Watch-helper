FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm run build:server && npm prune --omit=dev

FROM node:22-bookworm-slim AS api
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/build/server ./server
USER node
CMD ["node", "server/index.js"]

FROM caddy:2-alpine AS web
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile

FROM api AS app
ENV SERVE_WEB=1
COPY --from=build /app/dist ./dist
