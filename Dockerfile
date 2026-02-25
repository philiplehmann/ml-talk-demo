FROM node:24.14.0-trixie-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && \
    yarn install --immutable && \
    yarn build

# Production image, copy all the files and run next
FROM nginx:1.29-trixie-perl AS runner

COPY --from=builder /app/dist /app
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Disable entrypoint scripts that try to edit configs
RUN rm -rf /docker-entrypoint.d

# Ensure writable dirs for non-root
RUN mkdir -p /tmp/nginx && chown -R 1001:1001 /tmp/nginx /app

USER 1001
EXPOSE 8080
