FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts
COPY tsconfig*.json ./

RUN pnpm config set strict-dep-builds false
RUN pnpm install --no-frozen-lockfile
RUN pnpm rebuild esbuild

ENV PORT=3000
ENV BASE_PATH=/

RUN cd artifacts/dcim-frontend && pnpm run build
RUN cd artifacts/api-server && pnpm run build

EXPOSE 3000

CMD ["sh", "-c", "cd artifacts/api-server && pnpm run start"]
