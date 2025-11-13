FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
COPY node_modules /app/node_modules
COPY src /app/src

RUN npm install --production

CMD ["node", "src/index.js"]
