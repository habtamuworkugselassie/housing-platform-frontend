# --- Build stage (Debian base so Rollup optional deps install correctly; Alpine/musl has npm optional-dep bugs) ---
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
# Work around npm optional deps bug: explicitly install Rollup native binary for Linux (https://github.com/npm/cli/issues/4828)
RUN npm install @rollup/rollup-linux-x64-gnu@4.59.0 --no-save

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: custom nginx.conf if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
