FROM node:24.12.0-trixie-slim AS builder
WORKDIR /app
COPY . .
RUN corepack enable && \
    yarn install --immutable && \
    yarn build

# Production image, copy all the files and run next
FROM nginx:1.29-trixie-perl AS runner


COPY --from=builder /app/dist /app
