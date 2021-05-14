FROM node:lts-alpine

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN apk add --update --no-cache make g++ jpeg-dev cairo-dev giflib-dev pango-dev
RUN apk add ttf-ubuntu-font-family && fc-cache -f
RUN npm_config_build_from_source=true npm i canvas --build-from-source
RUN npm install copyfiles -g
RUN yarn install

COPY . .

RUN npm run build

CMD npm run start
