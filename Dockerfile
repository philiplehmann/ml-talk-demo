FROM bitnami/node:22.7.0 AS builder
WORKDIR /app
COPY . .
RUN corepack enable && \
    yarn install --immutable && \
    yarn build

# Production image, copy all the files and run next
FROM bitnami/nginx:1.27 AS runner


COPY --from=builder /app/dist /app
