FROM node

COPY . .

RUN cd frontend && npm ci && npm run build
RUN cd backend && npm ci && ln -s ../frontend/build frontend

WORKDIR backend
ENTRYPOINT ["npm", "run", "with-frontend"]
