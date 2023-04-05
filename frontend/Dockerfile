FROM node as build

ARG REACT_APP_WS_URL
ARG REACT_APP_WS_PORT

COPY . .

RUN npm ci
RUN npm run build

FROM nginx:alpine

COPY --from=build build /usr/share/nginx/html
