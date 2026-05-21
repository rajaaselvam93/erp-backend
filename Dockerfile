FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache dumb-init

FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS development
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["dumb-init", "npm", "run", "dev"]

FROM deps AS production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p uploads/avatars uploads/documents uploads/exports uploads/temp logs
EXPOSE 5000
ENV NODE_ENV=production
CMD ["dumb-init", "node", "src/server.js"]
