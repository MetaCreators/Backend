FROM node:21.1.0-alpine

WORKDIR /src

COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000

CMD [ "node","dist/index.js" ]