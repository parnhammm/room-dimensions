# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend
COPY backend/ ./backend/
WORKDIR /app/backend
RUN npm run build

# Stage 2: Production
FROM node:22-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend --omit=dev
COPY --from=builder /app/backend/dist ./backend/dist
RUN chown -R node:node /app
USER node
WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "dist/index.js"]
