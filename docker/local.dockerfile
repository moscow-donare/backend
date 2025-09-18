FROM oven/bun:debian

# Exponer puerto por si lo necesitás (aunque no es obligatorio)
EXPOSE 3000

# Seteás variables necesarias
ENV NODE_ENV="local"
ENV NODE_VERSION=20.18.0

# Definís el working directory
WORKDIR /app

# Instalás dependencias antes de montar código (mejor cache)
COPY package.json bun.lock ./
RUN bun install

# El resto del código será montado por volumen, así no necesitás rebuild
CMD ["bun", "run", "dev"]
