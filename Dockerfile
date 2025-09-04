# Docker para Desenvolvimento
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies)
RUN pnpm install --frozen-lockfile

# Generate Prisma client (será executado no runtime via volumes)
# RUN pnpm prisma:generate

# Expose port
EXPOSE 3333

# Start development server with hot reload
CMD ["pnpm", "dev"]