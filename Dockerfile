FROM node:20-alpine3.22

WORKDIR /app

RUN apk upgrade --no-cache
RUN apk add --no-cache dumb-init

COPY package*.json ./
COPY packages/shared/package*.json packages/shared/
COPY apps/api/package*.json apps/api/

RUN npm install --ignore-scripts

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm install --prefix packages/shared
RUN npm install --prefix apps/api

RUN npm run build --prefix packages/shared
RUN npm run build --prefix apps/api
RUN npm prune --omit=dev --prefix apps/api
RUN npm cache clean --force

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

USER appuser

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1:${PORT:-3000}/health/live > /dev/null || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
