# 1. Build the React frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Cache-bust: 2026-07-23T00:02
RUN npm run build

# 2. Setup the Node.js backend
FROM node:20-alpine
WORKDIR /app

# Install ghostscript and poppler for PDF parsing if needed by pdf-parse
RUN apk add --no-cache ghostscript poppler-utils

# Create data directory for volume mount
RUN mkdir -p /app/data/library

# Copy server code and install its dependencies
COPY server ./server
RUN cd server && npm install --production

# Copy built-in library
COPY library ./library

# Copy built frontend
COPY --from=build /app/dist ./dist

ENV PORT=3001
ENV DATA_DIR=/app/data
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "server/index.js"]
