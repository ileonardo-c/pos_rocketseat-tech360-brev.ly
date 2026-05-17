FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/package.json
COPY web/package.json ./web/package.json

RUN pnpm install --filter server... --frozen-lockfile

COPY server ./server

WORKDIR /workspace/server

EXPOSE 3333

CMD ["pnpm", "dev"]
