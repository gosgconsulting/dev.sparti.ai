# Use the official bolt.diy image as base
FROM ghcr.io/stackblitz-labs/bolt.diy:latest

# Set working directory
WORKDIR /app

# Bring in our app code and dependencies so the container runs THIS repo, not the base image demo
# 1) Install deps based on our lockfile
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate && pnpm install --frozen-lockfile

# 2) Copy the rest of the repo (respects .dockerignore)
COPY . .
# Ensure shell scripts are executable (fixes: sh: 1: ./bindings.sh: Permission denied)
RUN chmod +x ./bindings.sh || true

# 3) Optional theme assets (if present)
RUN mkdir -p /app/public/themes/sparti || true
COPY ["Sparti Theme/public/themes/sparti/", "/app/public/themes/sparti/"]

# Railway requires the app to bind to 0.0.0.0 and use the PORT environment variable
ENV HOST=0.0.0.0
ENV PORT=${PORT:-5173}
ENV NODE_ENV=production
ENV RUNNING_IN_DOCKER=true

# Railway environment configuration
ENV VITE_HMR_HOST=0.0.0.0
ENV VITE_HMR_PORT=${PORT:-5173}
ENV VITE_HMR_PROTOCOL=ws
ENV VITE_LOG_LEVEL=info

# File watching configuration for Railway
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Security and performance
ENV FORCE_COLOR=0
ENV CI=true

# Expose the port that Railway will assign
EXPOSE ${PORT:-5173}

# Use the base image's default CMD/ENTRYPOINT which will now run our package.json scripts