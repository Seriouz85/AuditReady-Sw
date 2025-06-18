FROM node:22.12-alpine as builder

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN --mount=type=cache,target=/root/.npm npm install
COPY src ./src
RUN npm run build

FROM node:22.12-alpine AS release
WORKDIR /app
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
COPY --from=builder /app/build /app/build

ENV NODE_ENV=production
RUN npm ci --ignore-scripts --omit-dev

ENTRYPOINT ["node", "build/index.js"]
