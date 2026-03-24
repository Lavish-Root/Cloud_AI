FROM node:20-slim as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-slim as production

WORKDIR /app

COPY --from=build /app/dist ./dist
RUN npm install -g serve

EXPOSE 5173

# Serve the static files from dist on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
