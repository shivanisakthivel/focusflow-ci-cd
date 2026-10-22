FROM node:22-alpine

WORKDIR /app

COPY app.js .
COPY public ./public

EXPOSE 80

CMD ["node", "app.js"]
