FROM node:lts-buster as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./

# NOTE: opencollective is not required but leads to warnings if missing
RUN npm install react-scripts@3.4.1 opencollective -g
RUN npm clean-install 
# --production TODO: fix installing production dependencies only 

COPY . ./

# Include default values; override in deployment image
RUN cp default.env .env

# Build
RUN ./pre-release.sh
RUN npm run build


FROM nginx:stable-alpine

RUN apk add --no-cache nodejs npm

RUN npm install -g @beam-australia/react-env

ADD entrypoint.sh /var/entrypoint.sh
RUN ["chmod", "+x", "/var/entrypoint.sh"]

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

ENTRYPOINT ["/var/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
