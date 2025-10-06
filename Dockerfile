# Frontend container (Node)
FROM node:20-alpine
WORKDIR /app

# Install deps first for caching
COPY package*.json ./
RUN npm ci || npm install

# App source
COPY . .

# Build if you have a build step (safe to leave)
RUN [ -f package.json ] && (npm run build || true)

# Non-root user
RUN adduser -D appuser && chown -R appuser /app
USER appuser

# Your frontend listens on 8080 inside the container
ENV PORT=8080
EXPOSE 8080

# Adjust to your frontend start command (e.g., npm run dev / start)
CMD ["sh","-c","npm run serve"]
