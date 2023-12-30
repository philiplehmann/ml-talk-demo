FROM bitnami/node:20 AS builder
WORKDIR /app
COPY . .
RUN yarn install --immutable && \
    yarn build

# Production image, copy all the files and run next
FROM bitnami/nginx:1.25 AS runner


COPY --from=builder /app/dist /app
