ARG REACT_APP_WS_URL
ARG REACT_APP_WS_PORT

FROM node as build

COPY . .

RUN npm ci
RUN npm run build

FROM nginx:alpine

COPY --from=build build /usr/share/nginx/html
