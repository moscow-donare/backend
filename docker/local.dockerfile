FROM oven/bun:debian

# Exponer puerto por si lo necesitás (aunque no es obligatorio)
EXPOSE 3000

# Seteás variables necesarias
ENV NODE_ENV="local"
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=20.18.0
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

# Instalás Node con NVM (aunque ya tenés Bun, ¿seguro necesitás Node 20? Solo hacelo si hay algún paquete que lo requiera)
RUN apt update && \
    apt install -y curl git && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install ${NODE_VERSION} && \
    nvm use v${NODE_VERSION} && \
    nvm alias default v${NODE_VERSION}

# Definís el working directory
WORKDIR /app

# Instalás dependencias antes de montar código (mejor cache)
COPY package.json bun.lock ./
RUN bun install

# El resto del código será montado por volumen, así no necesitás rebuild
CMD ["bun", "run", "dev"]
