FROM node:14-alpine

COPY frontend/package*.json /root/app/frontend/
WORKDIR /root/app/frontend

RUN npm install && npm install http-server

COPY common /root/app/common
COPY frontend /root/app/frontend

ARG apiUrl
ENV VUE_APP_API_BASE_URL=${apiUrl}
RUN npm run build

EXPOSE 80

CMD node_modules/.bin/http-server -p 80 dist/ --proxy http://localhost?