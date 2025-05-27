FROM oven/bun:debian

EXPOSE $PORT

WORKDIR /app

# https://stackoverflow.com/a/57546198
# Install node.js
RUN apt update && \
	apt install -y curl && \
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=20.18.0
RUN . "$NVM_DIR/nvm.sh" && \
	nvm install ${NODE_VERSION} && \
	nvm use v${NODE_VERSION} && \
	nvm alias default v${NODE_VERSION}

ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

ENV NODE_ENV="local"

# Setup OS and system dependencies
RUN apt update -y && \
	apt install git -y

# Setup app
WORKDIR /app
COPY . .
COPY .env.dev .env
RUN bun install
