FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

COPY src /app/src

RUN npm install --production

ENV TOKEN=bot_token

CMD ["node", "src/index.js"]
