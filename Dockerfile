FROM node:20-slim

# Install build toolchain (for native modules like better-sqlite3), python3, ffmpeg, ca-certificates, and curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    pkg-config \
    python3 \
    ffmpeg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
