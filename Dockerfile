FROM node:lts-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --fetch-timeout=600000 --fetch-retries=5
COPY . .

RUN npm run build

EXPOSE 8005
CMD ["npm", "start"]
