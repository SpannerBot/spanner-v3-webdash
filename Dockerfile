FROM node:lts-alpine

RUN npm install -g pnpm@latest
WORKDIR /app
COPY package.json /app
COPY package-lock.json /app
RUN pnpm install
COPY . /app
RUN pnpm build
CMD ["pnpm", "start"]
