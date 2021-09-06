FROM node:latest

WORKDIR /app
COPY package*.json ./

RUN npm install copyfiles nodemon -g

RUN npm install ffmpeg-static
RUN npm install sodium
RUN npm install canvas

RUN npm install

COPY . .

RUN npm run build

CMD npm run start
