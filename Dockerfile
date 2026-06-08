# something

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT = 5173

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0"]