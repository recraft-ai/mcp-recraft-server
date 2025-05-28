FROM node:24-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

ENTRYPOINT ["node", "dist/index.js"]
