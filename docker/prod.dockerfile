FROM oven/bun:debian as base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

CMD ["bun", "run", "start"]
