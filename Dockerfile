FROM bitnami/node:22.4.0 AS builder
WORKDIR /app
COPY . .
RUN yarn install --immutable && \
    yarn build

# Production image, copy all the files and run next
FROM bitnami/nginx:1.27 AS runner


COPY --from=builder /app/dist /app
