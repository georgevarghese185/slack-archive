FROM node:14-alpine

COPY backend/package*.json /root/app/backend/
WORKDIR /root/app/backend
RUN npm install --only=prod

COPY common /root/app/common
COPY backend/ /root/app/backend/

EXPOSE 80

CMD PORT=80 npm run start:prod