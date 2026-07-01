FROM node:22-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache openssl \
    && mkdir -p /etc/nginx/certs \
    && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/nginx/certs/portal.local.key \
        -out /etc/nginx/certs/portal.local.crt \
        -subj "/CN=localhost"

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080 8443
