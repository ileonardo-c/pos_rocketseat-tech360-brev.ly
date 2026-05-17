FROM node:22-alpine

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/package.json
COPY server/package.json ./server/package.json

RUN pnpm install --filter web... --frozen-lockfile

COPY web ./web

WORKDIR /workspace/web

EXPOSE 5173

CMD ["pnpm", "dev"]
