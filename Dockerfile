FROM node:20-alpine
WORKDIR /app

# Install deps (layer-cached)
COPY package*.json ./
RUN npm ci || npm install

# App source
COPY . .

# Build if a build script exists
RUN [ -f package.json ] && (npm run build || true)

# Non-root user
RUN adduser -D appuser && chown -R appuser /app
USER appuser

# Default port (override with PORT env)
EXPOSE 3000

# Simple healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s CMD node -e "require('http').get('http://127.0.0.1:'+ (process.env.PORT || 3000)).on('error',()=>process.exit(1))"

# Start command (change if your app uses a different script)
CMD ["sh","-c","npm run start"]
