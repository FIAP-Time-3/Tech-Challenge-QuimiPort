FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

COPY ./.env.docker ./.env

RUN npm run prisma:generate

RUN npm run build

CMD [ "sh", "-c", "npx prisma migrate deploy && node dist/main.js" ]