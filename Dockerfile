FROM node:22.4.1-bookworm-slim AS build-stage
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build-production

FROM nginx:1.27.2
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 443/tcp