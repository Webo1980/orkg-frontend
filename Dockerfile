FROM node:lts-buster as build

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package-lock.json ./

RUN npm install react-scripts opencollective --production
RUN HUSKY_SKIP_INSTALL=1 npm clean-install

COPY . ./

# Include default values; override in deployment image
RUN cp default.env .env

# Build
RUN ./pre-release.sh
RUN npm run build




FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html/
