FROM node:18-alpine

# Install build dependencies for bcrypt
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
