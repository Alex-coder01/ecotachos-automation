# ============================================
# ETAPA 1: BUILD - React + Vite
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# ============================================
# ETAPA 2: PRODUCCIÓN (Nginx)
# ============================================
FROM nginx:alpine

# Copiar configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos (dist de Vite)
COPY --from=builder /app/dist /usr/share/nginx/html

# Crear directorio de logs
RUN mkdir -p /var/log/nginx /var/run/nginx && \
    chown -R nginx:nginx /var/log/nginx /var/run/nginx /var/cache/nginx

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
