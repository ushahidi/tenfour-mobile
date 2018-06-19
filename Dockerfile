FROM ushahidi/node-ci:node-8

RUN npm install -g cordova@7.1.0 && \
    npm install -g ionic@3.20.0

WORKDIR /var/app
COPY package.json ./
RUN npm install
COPY ./ ./
