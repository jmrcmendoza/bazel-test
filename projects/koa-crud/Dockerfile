FROM node:14.15.4-slim

WORKDIR /srv/node

COPY ./build /srv/node/build
COPY ./node_modules /srv/node/node_modules
COPY ./package.json /srv/node/package.json

CMD npm start
