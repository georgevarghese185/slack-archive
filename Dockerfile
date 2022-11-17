FROM node:14-alpine AS builder

WORKDIR /root/slack-archive/source

COPY package.json yarn.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY libs/common/package.json ./libs/common/
RUN yarn

COPY . .

RUN yarn run:web build

RUN mkdir -p /root/slack-archive/build/apps
RUN mkdir -p /root/slack-archive/build/libs
RUN mv yarn.lock package.json /root/slack-archive/build/
RUN mv apps/server /root/slack-archive/build/apps/
RUN mv libs/common /root/slack-archive/build/libs/
RUN mv apps/web/dist /root/slack-archive/build/apps/server/public

WORKDIR /root/slack-archive/build

RUN yarn install --production

FROM node:14-alpine

COPY --from=builder /root/slack-archive/build /root/slack-archive/

WORKDIR /root/slack-archive/apps/server

ENV STATIC_WEB_DIR=./public

CMD yarn start:prod