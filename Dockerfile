FROM node:16-alpine3.15

RUN apt-get update && apt-get install -y

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package*.json /usr/src/bot
RUN npm install

COPY . /usr/src/bot
RUN npm run build

CMD ["npm", "run", "start"]
