FROM node:20-alpine3.21

WORKDIR /app

RUN apk upgrade --no-cache

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

USER appuser

CMD ["npm", "start"]
