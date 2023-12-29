FROM bitnami/node:20 AS builder
WORKDIR /app
COPY . .
RUN yarn install --immutable && \
    yarn build

# Production image, copy all the files and run next
FROM bitnami/node:18 AS runner
WORKDIR /app

RUN useradd -r ml-demo

COPY --from=builder --chown=ml-demo:ml-demo /app/package.json ./package.json
COPY --from=builder --chown=ml-demo:ml-demo /app/yarn.lock ./yarn.lock
COPY --from=builder --chown=ml-demo:ml-demo /app/dist ./dist
COPY --from=builder --chown=ml-demo:ml-demo /app/node_modules ./node_modules

USER ml-demo

CMD ["yarn", "start"]
