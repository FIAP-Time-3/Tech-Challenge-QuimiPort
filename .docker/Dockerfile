FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Gera o client Prisma durante o build (não aplica migrations aqui)
RUN npm run prisma:generate

RUN npm run build

CMD [ "sh", "-c", "npx prisma migrate deploy && node dist/main.js" ]