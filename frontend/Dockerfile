# ---------- Etapa de build ----------
FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# La URL del backend se inyecta en tiempo de build (Vite la "hornea" en el bundle).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ---------- Etapa de runtime (nginx) ----------
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
