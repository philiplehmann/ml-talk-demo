FROM node:24.10.0-trixie-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && \
    yarn install --immutable && \
    yarn build

# Production image, copy all the files and run next
FROM bitnami/nginx:1.29 AS runner


COPY --from=builder /app/dist /app
