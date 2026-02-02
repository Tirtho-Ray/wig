# ---- Base Stage: Common setup for all other stages ----
# Using a specific version of Node.js on Alpine Linux provides a small and reproducible base.
FROM node:22-alpine AS base
# Prisma's database connectors require OpenSSL.
RUN apk add --no-cache openssl
WORKDIR /app
# Install pnpm, the package manager used by this project.
RUN npm install -g pnpm

# ---- Builder Stage: Compile the TypeScript application ----
FROM base AS builder
# Copy package definitions and install all dependencies (including devDependencies)
# required for the build process.
COPY package.json pnpm-lock.yaml ./
# Make sure prisma.config.ts is available in builder for later copying
COPY prisma.config.ts ./
RUN pnpm install --prod=false
# Copy the rest of the source code and run the build.
COPY . .
RUN pnpm run build
# Generate the Prisma Client in the builder stage, where prisma CLI is available.
RUN pnpm exec prisma generate

# ---- Prod-Deps Stage: Install only production dependencies ----
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod=true

# ---- Production Stage: Final lean image ----
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app

# Copy relevant files for application startup from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma.config.ts ./

# Copy the clean production node_modules from the prod-deps stage.
COPY --from=prod-deps /app/node_modules ./node_modules
# Copy compiled code from the builder stage.
COPY --from=builder /app/dist ./dist
# Copy prisma schema. It's needed for `migrate deploy` in docker-compose.
COPY prisma ./prisma

# Expose the application port.
EXPOSE 9000

# The command to start the production application.
CMD ["pnpm", "run", "start:prod"]
