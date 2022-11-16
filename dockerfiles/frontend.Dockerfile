FROM node:14-alpine

COPY frontend/package*.json /root/app/frontend/
WORKDIR /root/app/frontend

RUN npm install && npm install http-server

COPY frontend /root/app/frontend

ARG apiUrl
ENV VUE_APP_API_BASE_URL=${apiUrl}

EXPOSE 80

CMD npm run build && node_modules/.bin/http-server -p 80 dist/ --proxy http://localhost?