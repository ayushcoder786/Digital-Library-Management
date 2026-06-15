# ── Node.js / Express – Task Services ────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

EXPOSE 8002

CMD ["node", "main.js"]
