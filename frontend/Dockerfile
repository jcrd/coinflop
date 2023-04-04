FROM nginx:alpine

ARG REACT_APP_WS_URL
ARG REACT_APP_WS_PORT

RUN apk add --update nodejs npm

COPY . .

RUN npm ci
RUN npm run build

RUN cp -r build/* /usr/share/nginx/html/
