# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.11.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage bind mounts to package.json and package-lock.json to avoid having to copy them into
# this layer.
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Ensure the Prisma schema file is in the expected location
COPY prisma/schema.prisma prisma/schema.prisma

# Run Prisma generate
RUN npx prisma generate

# Run the application as a non-root user.
USER node

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
CMD npm start
