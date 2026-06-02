# something

FROM ubuntu

WORKDIR /app

COPY package*.jsno ./

RUN nmp install

COPY . .

ENV PORT = 5173

EXPOSE 5173

CMD ["npm", "run", "dev"]