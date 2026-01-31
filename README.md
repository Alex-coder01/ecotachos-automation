# ECOTACHOS Automation Project

Sistema completo de automatización y despliegue para **ECOTACHOS Tecnología**, incluyendo:

- 🎯 **Backend Django** - API REST para gestión de detecciones IoT
- ⚛️ **Frontend React** - Interfaz de usuario con Vite
- 🚀 **DigitalOcean Deployment** - Script Go para orquestación
- 🤖 **Serverless Detection** - Función para procesamiento de IA
- 🔄 **CI/CD Pipeline** - GitHub Actions automatizado
- 🐳 **Docker Compose** - Infraestructura containerizada

## 📁 Estructura del Proyecto

```
ecotachos-automation/
├── ecotachostec-backend3/          # Backend Django
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── entrypoint.sh
│   ├── src/
│   │   ├── manage.py
│   │   ├── requirements.txt
│   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── views/
│   │   │   ├── serializers/
│   │   │   ├── serverless/         # Función serverless integrada
│   │   │   │   └── detection.go
│   │   │   └── iot/                # IoT y MQTT
│   │   └── ecotachostec_backend/   # Configuración Django
│   └── .env.example
│
├── ecotachostec-frontend2/         # Frontend React + Vite
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── api/
│   │   │   ├── detectionServerlessApi.js
│   │   │   └── ... (otros apis)
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/detectionHelper.js
│   └── .env.local
│
├── ops/                            # Operaciones y Deploy
│   ├── do/                         # DigitalOcean Deployment
│   │   ├── main.go
│   │   └── go.mod
│   └── gcp/                        # Función Serverless
│       ├── main.go
│       └── go.mod
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD Pipeline
│
├── docker-compose.yml              # Orquestación de servicios
├── .gitignore
└── README.md
```

## 🚀 Inicio Rápido

### Requisitos

- Docker & Docker Compose
- Node.js 18+
- Python 3.10+
- Go 1.21+ (para scripts de deployment)
- SSH Key para DigitalOcean

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/Alex-coder01/ecotachos-automation.git
cd ecotachos-automation

# Iniciar servicios con Docker Compose
docker-compose up -d

# Frontend: http://localhost:80
# Backend: http://localhost:8000
# Serverless: http://localhost:9000
```

### Variables de Entorno

Crear `.env` en la raíz del proyecto:

```env
# DigitalOcean
DROPLET_IP=137.184.234.244
SSH_USER=root
SSH_KEY=/path/to/private/key
PROJECT_PATH=/root/ecotachos

# Backend
DEBUG=False
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@postgres:5432/ecotachos
REDIS_URL=redis://redis:6379/0
MQTT_BROKER=mosquitto

# Frontend
VITE_API_URL=http://localhost:8000
VITE_SERVERLESS_URL=http://localhost:9000
VITE_FIREBASE_API_KEY=your-firebase-key

# Serverless
PORT=9000
BACKEND_URL=http://localhost:8000
ENVIRONMENT=development
```

## 🐳 Servicios Docker

```bash
# Ver estado
docker-compose ps

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery

# Detener
docker-compose down
```

## 🚀 Despliegue en DigitalOcean

### 1. Preparar Droplet

```bash
# SSH al droplet
ssh root@137.184.234.244

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clonar proyecto
git clone https://github.com/Alex-coder01/ecotachos-automation.git /root/ecotachos
cd /root/ecotachos
```

### 2. Configurar Variables de Entorno

```bash
# En el Droplet
cp .env.example .env
# Editar .env con valores de producción
nano .env
```

### 3. Ejecutar Despliegue

**Opción A: Usando Go Script (local)**

```bash
export DROPLET_IP=137.184.234.244
export SSH_USER=root
export SSH_KEY=~/.ssh/id_rsa
export PROJECT_PATH=/root/ecotachos

go run ops/do/main.go deploy
```

**Opción B: GitHub Actions (automático)**

```bash
git push origin main
```

### 4. Verificar Despliegue

```bash
# Health check
go run ops/do/main.go health

# Ver logs
go run ops/do/main.go logs backend

# Monitoreo continuo
go run ops/do/main.go monitor 10
```

## 📊 Servicios Disponibles

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend | 80 | React app (Nginx) |
| Backend | 8000 | API Django/Gunicorn |
| PostgreSQL | 5432 | Base de datos |
| Redis | 6379 | Cache/Celery broker |
| Mosquitto | 1883 | MQTT Broker |
| Serverless | 9000 | Función IA Detection |

## 🤖 API Endpoints

### Backend (Django REST)

```
GET    /api/detecciones/              - Listar detecciones
POST   /api/detecciones/              - Crear detección
GET    /api/detecciones/{id}/         - Obtener detección
PUT    /api/detecciones/{id}/         - Actualizar detección
DELETE /api/detecciones/{id}/         - Eliminar detección
```

### Serverless (Go HTTP)

```
POST   /detect   - Procesar detección
GET    /health   - Health check
GET    /stats    - Estadísticas
GET    /info     - Información del servicio
```

## 🔄 CI/CD Pipeline

GitHub Actions ejecuta automáticamente:

1. **Test** - Linting y tests unitarios
2. **Build** - Construir imágenes Docker
3. **Deploy** - Desplegar a DigitalOcean via SSH
4. **Rollback** - Revertir si hay errores
5. **Notify** - Notificaciones post-deployment

### Configurar Secrets en GitHub

```
Settings → Secrets and variables → Actions
```

Agregar:
- `DROPLET_IP` - IP del Droplet
- `DROPLET_SSH_KEY` - Clave privada SSH

## 📝 Desarrollo

### Backend

```bash
# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Aplicar migraciones
docker-compose exec backend python manage.py migrate

# Crear superuser
docker-compose exec backend python manage.py createsuperuser

# Tests
docker-compose exec backend python manage.py test
```

### Frontend

```bash
# Instalar dependencias
cd ecotachostec-frontend2
npm install

# Desarrollo
npm run dev

# Build producción
npm run build
```

### Go Scripts

```bash
# DigitalOcean Deployment
cd ops/do
go mod tidy
go run main.go help

# Serverless Function
cd ops/gcp
go mod tidy
go run main.go
```

## 🔧 Troubleshooting

### Conexión SSH rechazada

```bash
# Verificar permisos de clave
chmod 600 ~/.ssh/id_rsa

# Probar conexión
go run ops/do/main.go test
```

### Servicios no inician

```bash
# Ver logs
docker-compose logs postgres
docker-compose logs backend
docker-compose logs frontend

# Reiniciar
docker-compose restart
```

### Puerto en uso

```bash
# Encontrar qué usa el puerto
lsof -i :8000

# O cambiar puerto en docker-compose.yml
```

## 📚 Documentación Adicional

- [Django REST Framework](https://www.django-rest-framework.org/)
- [React + Vite](https://vitejs.dev/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Go SSH Package](https://golang.org/x/crypto/ssh)
- [GitHub Actions](https://docs.github.com/en/actions)

## 👥 Contribuciones

Hacer fork → Crear branch → Commit cambios → Push → Pull Request

## 📄 Licencia

Todos los derechos reservados © ECOTACHOS Tecnología

## 📞 Soporte

- Email: support@ecotachos.com
- Issue Tracker: https://github.com/Alex-coder01/ecotachos-automation/issues

---

**Versión:** 1.0.0  
**Última actualización:** Enero 31, 2026
