FROM node:23-alpine

WORKDIR /app

COPY . .
RUN yarn install

CMD ["/app/docker-entrypoint.sh"]

EXPOSE 3000
