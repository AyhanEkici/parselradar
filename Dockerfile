FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json packages/shared/
COPY apps/api/package*.json apps/api/

RUN npm install --prefix packages/shared
RUN npm install --prefix apps/api

COPY packages/shared packages/shared
COPY apps/api apps/api

RUN npm run build --prefix packages/shared
RUN npm run build --prefix apps/api

WORKDIR /app/apps/api

CMD ["npm", "start"]
