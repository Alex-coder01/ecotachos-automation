# 🐳 Guía de Docker para EcoTachosTec Frontend

## 📋 Archivos Creados

- **Dockerfile** - Compilación multi-stage (Build + Nginx)
- **docker-compose.yml** - Orquestación de servicios
- **nginx.conf** - Configuración de servidor web
- **.env.example** - Variables de entorno
- **.dockerignore** - Archivos a excluir en imagen Docker

---

## 🚀 Inicio Rápido

### 1️⃣ Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus valores reales
# - Firebase credentials
# - URLs de API
# - Credenciales de base de datos
```

### 2️⃣ Construir y ejecutar con Docker Compose

```bash
# Construir imágenes
docker-compose build

# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Detener servicios
docker-compose down
```

### 3️⃣ Acceder a la aplicación

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Health Check**: http://localhost:3000/health

---

## 🏗️ Estructura de Docker

### **Dockerfile (Multi-stage)**

```
Stage 1: Builder (Node)
├─ Instala dependencias
├─ Compila código React/Vite
└─ Genera archivos en /app/dist

Stage 2: Production (Nginx)
├─ Copia archivos compilados
├─ Configura servidor web
└─ Expone puerto 3000
```

### **nginx.conf (Configuración)**

✅ **Características:**
- SPA routing (React Router)
- CORS headers para APIs
- **COOP headers para Firebase popup**
- Gzip compression
- Rate limiting
- Cache control
- Health endpoint
- API proxy (backend Django)

---

## 📦 Docker Compose - Servicios

### **frontend**
- Puerto: `3000`
- Imagen: Nginx + archivos compilados
- Health check: `/health`

### **backend** (Opcional)
- Puerto: `8000`
- Imagen: Django + Python
- Motor IA: Local (YOLO) o Roboflow

### **postgres** (Opcional)
- Puerto: `5432`
- Base de datos para Django

---

## 🔧 Comandos Útiles

### Construir una sola imagen
```bash
docker build -t ecotachos-frontend:latest .
```

### Ejecutar frontend solo (sin compose)
```bash
docker run -p 3000:3000 \
  -e VITE_API_URL=http://localhost:8000/api \
  ecotachos-frontend:latest
```

### Ver imágenes y contenedores
```bash
docker images
docker ps -a
```

### Limpiar Docker
```bash
# Eliminar contenedores parados
docker container prune

# Eliminar imágenes no usadas
docker image prune

# Eliminar todo (cuidado)
docker system prune -a
```

### Acceder a contenedor en ejecución
```bash
docker exec -it ecotachos-frontend sh
docker exec -it ecotachos-backend bash
```

### Ver logs en tiempo real
```bash
docker-compose logs -f
docker-compose logs -f frontend
docker-compose logs backend --tail 100
```

---

## 📊 Volúmenes Persistentes

```yaml
volumes:
  backend_data:      # Datos del backend
  backend_logs:      # Logs del backend
  postgres_data:     # Base de datos PostgreSQL
```

Ubicación en tu sistema (Docker Desktop):
- **Windows**: `C:\ProgramData\Docker\volumes`
- **Linux**: `/var/lib/docker/volumes`
- **Mac**: `~/Library/Containers/com.docker.docker/Data/vms/0/data`

---

## 🌍 Despliegue en Producción

### Variables de entorno para producción:

```bash
NODE_ENV=production
VITE_API_URL=https://api.tudominio.com/api
ALLOWED_HOSTS=tudominio.com,www.tudominio.com
DEBUG=False
```

### Usando un reverse proxy (Nginx/Apache)

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔒 Seguridad

✅ Headers de seguridad en nginx.conf:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Cross-Origin-Opener-Policy: same-origin-allow-popups` (para Firebase)

✅ Rate limiting por zona

✅ Archivos sensibles bloqueados (/.*, /.git, etc)

---

## 🐛 Solucionar Problemas

### "Connection refused" - Backend no responde
```bash
# Verificar que backend esté en red
docker network ls
docker inspect ecotachos-network

# Asegurar que backend está corriendo
docker-compose ps
```

### Firebase popup no funciona
✅ Ya está configurado en `nginx.conf`:
```nginx
add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
```

### Cambios en código no se reflejan
```bash
# Reconstruir imagen
docker-compose build --no-cache

# Reiniciar servicio
docker-compose restart frontend
```

### Puerto 3000 en uso
```bash
# Cambiar puerto en .env
FRONTEND_PORT=3001

# Reiniciar
docker-compose down
docker-compose up -d
```

---

## 📝 Próximos Pasos

1. **Copiar `.env.example` a `.env.local`** con tus credenciales
2. **Asegurar que backend está accesible** en `http://localhost:8000`
3. **Ejecutar**: `docker-compose up -d`
4. **Verificar**: `curl http://localhost:3000/health`

---

## ✨ Tips

- Usa `docker-compose logs -f` para debugging en tiempo real
- Mantén `.env.local` fuera del control de versiones (en `.gitignore`)
- Puedes cambiar puertos en `.env` sin editar archivos de Docker
- El health check evita que Nginx levante antes de estar listo

---

¿Necesitas ayuda con algo específico?
