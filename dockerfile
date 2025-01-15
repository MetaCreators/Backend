FROM node:21.1.0-alpine

WORKDIR /src

COPY . .

RUN npm install
RUN npm run build

CMD [ "node","dist/index.js" ]