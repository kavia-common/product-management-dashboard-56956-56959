# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Install deps first for better caching
COPY package.json package-lock.json* /app/
RUN npm install

# Copy the rest of the app
COPY . /app/

EXPOSE 3000

# Vite dev server (this repo's package.json + vite.config.ts already bind to 0.0.0.0:3000)
CMD ["npm", "run", "dev"]
