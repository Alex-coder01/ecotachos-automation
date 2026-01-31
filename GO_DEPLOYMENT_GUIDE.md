# 🚀 ECOTACHOS - Despliegue Automático en Go

## Descripción

Scripts en **Go** para automatizar el despliegue de ECOTACHOS Tecnología en **DigitalOcean**. Incluye:

✅ **Script de Despliegue** - Gestión completa de recursos  
✅ **Función Serverless** - Procesamiento de detecciones IA  
✅ **GitHub Actions** - CI/CD automático en cada push  
✅ **Health Checks** - Monitoreo de servicios  
✅ **Rollback Automático** - Reversión en caso de fallos  

---

## 📋 Requisitos

### En tu máquina local

```bash
✓ Go 1.19 o superior
✓ Git configurado
✓ SSH key para DigitalOcean
```

### En el Droplet (137.184.234.244)

```bash
✓ Ubuntu 24.04 LTS
✓ Docker & Docker Compose
✓ Git
✓ SSH key configurada
```

---

## 🔧 Configuración

### 1. Preparar el Droplet

```bash
# Conectar
ssh root@137.184.234.244

# Actualizar
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Git
apt install -y git

# Clonar proyecto
git clone https://github.com/tu-usuario/ecotachos.git /root/ecotachos
cd /root/ecotachos
```

### 2. Configurar GitHub Actions

Ve a tu repositorio → **Settings → Secrets and variables → Actions**

Agrega estos secretos:

| Secret | Valor |
|--------|-------|
| `DROPLET_IP` | `137.184.234.244` |
| `DROPLET_SSH_KEY` | Contenido de tu clave privada SSH |

```bash
# Obtener la clave privada en formato para GitHub
cat ~/.ssh/id_rsa | base64 -w 0
```

### 3. Editar `ops/aws/main.go` (si es necesario)

```go
func LoadConfig() *DeployConfig {
    return &DeployConfig{
        DropletIP:    "137.184.234.244",  // ✏️ Tu IP
        SSHUser:      "root",              // ✏️ Usuario SSH
        SSHKeyPath:   os.ExpandUser("~/.ssh/id_rsa"),
        ProjectPath:  "/root/ecotachos",
        // ... más configuración
    }
}
```

---

## 🚀 Uso del Script Go

### Instalación de dependencias

```bash
cd ops/aws
go mod download
```

### Comandos Disponibles

#### **Deploy Completo** (Recomendado)
```bash
go run main.go deploy
```

Ejecuta:
1. Prueba de conexión SSH
2. Backup de BD
3. Git pull del código
4. Build de imágenes Docker
5. docker-compose up
6. Migraciones
7. Health checks
8. Monitoreo

#### **Ver Estado**
```bash
go run main.go status
```

#### **Ver Logs**
```bash
go run main.go logs backend
go run main.go logs frontend
go run main.go logs db
```

#### **Health Check**
```bash
go run main.go health
```

#### **Monitoreo Continuo**
```bash
go run main.go monitor         # Cada 30 segundos (default)
go run main.go monitor 15      # Cada 15 segundos
```

#### **Rollback**
```bash
go run main.go rollback
```

#### **Test de Conexión**
```bash
go run main.go test
```

---

## 📡 Función Serverless (GoCP)

Ubicación: `ops/gcp/main.go`

### Uso

```bash
cd ops/gcp
go run main.go
```

**Endpoints disponibles:**

#### **POST /detect** - Procesar detección
```bash
curl -X POST http://localhost:9000/detect \
  -H "Content-Type: application/json" \
  -d '{
    "tacho_id": "tacho_001",
    "image_url": "https://...",
    "classification": "organico",
    "confidence": 0.95,
    "timestamp": "2026-01-31T17:00:00Z"
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Detección procesada exitosamente",
  "data": {
    "tacho_id": "tacho_001",
    "classification": "organico",
    "confidence": 0.95,
    "processed_at": "2026-01-31T17:05:00Z",
    "status": "processed"
  }
}
```

#### **GET /health** - Health check
```bash
curl http://localhost:9000/health
```

#### **GET /stats** - Estadísticas
```bash
curl http://localhost:9000/stats
```

### Desplegar como servicio en el Droplet

```bash
# En el Droplet
ssh root@137.184.234.244

cd /root/ecotachos/ops/gcp

# Compilar
go build -o serverless main.go

# Crear servicio systemd
cat > /etc/systemd/system/ecotachos-serverless.service << EOF
[Unit]
Description=ECOTACHOS Serverless Function
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/ecotachos/ops/gcp
ExecStart=/root/ecotachos/ops/gcp/serverless
Restart=always
RestartSec=10
Environment="PORT=9000"
Environment="BACKEND_URL=http://localhost:8000"

[Install]
WantedBy=multi-user.target
EOF

# Iniciar
systemctl enable ecotachos-serverless
systemctl start ecotachos-serverless
systemctl status ecotachos-serverless

# Ver logs
journalctl -u ecotachos-serverless -f
```

---

## 🔄 GitHub Actions CI/CD

El pipeline se ejecuta automáticamente en cada push a `main` o tag `v*`:

### Flujo:

1. **Test** (🧪)
   - Lint del Backend
   - Tests del Backend
   - Validación de dependencies

2. **Build** (🐳)
   - Build imagen Backend
   - Build imagen Frontend

3. **Deploy** (🚀)
   - SSH al Droplet
   - rsync de código
   - docker-compose up
   - Migraciones
   - Health checks

4. **Rollback** (🔙)
   - Si Deploy falla, revierte automáticamente

### Ejecutar despliegue

```bash
# Push a main (despliegue automático)
git add .
git commit -m "Feature: nueva funcionalidad"
git push origin main

# O crear un tag para release
git tag v1.0.0
git push origin v1.0.0
```

### Ver progreso

Ve a: **GitHub → Actions → Deploy** workflow

---

## 📊 Monitoreo y Logging

### Logs en tiempo real

```bash
# Todos los servicios
docker-compose logs -f

# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# Celery
docker-compose logs -f celery
```

### Health endpoints

```bash
# Backend
curl http://137.184.234.244:8000/health/

# Frontend
curl http://137.184.234.244/health

# Serverless
curl http://137.184.234.244:9000/health
```

### Estadísticas del sistema

```bash
# En el Droplet
docker stats
docker-compose ps

# Desde tu máquina
go run ops/aws/main.go status
```

---

## 🔙 Rollback

### Automático
Si el deploy falla, GitHub Actions ejecuta rollback automáticamente.

### Manual

```bash
# Opción 1: Con Go script
go run ops/aws/main.go rollback

# Opción 2: Directo en Droplet
ssh root@137.184.234.244

cd /root/ecotachos
docker-compose down
git revert HEAD --no-edit
docker-compose up -d
docker-compose ps
```

---

## 📈 Estructura del Código

```
ops/
├── go.mod                    # Módulo Go
├── .env                      # Configuración
├── aws/
│   └── main.go              # Script de despliegue
├── gcp/
│   └── main.go              # Función serverless
└── deploy.sh                # Script bash alternativo

.github/
└── workflows/
    └── deploy.yml           # GitHub Actions CI/CD
```

---

## 🛠️ Troubleshooting

### Error de conexión SSH
```bash
# Asegurar permisos correctos
chmod 600 ~/.ssh/id_rsa
chmod 700 ~/.ssh

# Añadir a conocidos
ssh-keyscan -H 137.184.234.244 >> ~/.ssh/known_hosts
```

### Los servicios no inician
```bash
# Ver logs detallados
docker-compose logs

# Reconstruir
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### Migraciones fallan
```bash
ssh root@137.184.234.244
cd /root/ecotachos

docker-compose exec backend bash
python manage.py migrate --noinput
python manage.py migrate core
exit
```

### Limpiar todo
```bash
# ⚠️ PELIGROSO - Elimina todo, incluyendo BD
docker-compose down -v
rm -rf /root/ecotachos/backups/*
```

---

## 📝 Variables de Entorno

### En el Droplet - `.env`

```env
# Django
DJANGO_DEBUG=False
SECRET_KEY=tu-secret-key-aqui

# Base de Datos
DB_ENGINE=django.db.backends.postgresql
DB_NAME=ecotachostec
DB_USER=postgres
DB_PASSWORD=tu-contraseña

# Redis
REDIS_URL=redis://redis:6379/0

# MQTT
MQTT_BROKER=mosquitto
MQTT_PORT=1883

# Serverless
BACKEND_URL=http://localhost:8000
PORT=9000
```

---

## 🎯 Checklist Pre-Despliegue

- [ ] SSH keys configuradas en Droplet
- [ ] GitHub secrets agregados (DROPLET_IP, DROPLET_SSH_KEY)
- [ ] Docker instalado en Droplet
- [ ] Código pusheado a repositorio
- [ ] `.env` configurado en Droplet
- [ ] Base de datos inicializada

---

## 📞 Comandos Rápidos

```bash
# Deploy completo
go run ops/aws/main.go deploy

# Ver estado
go run ops/aws/main.go status

# Monitorear
go run ops/aws/main.go monitor 15

# Logs
go run ops/aws/main.go logs backend

# Verificar salud
go run ops/aws/main.go health

# Rollback
go run ops/aws/main.go rollback

# Función serverless
cd ops/gcp && go run main.go
```

---

## 📄 Documentación Adicional

- **DEPLOYMENT.md** - Guía detallada de despliegue
- **ACADEMIC_DEPLOYMENT_REPORT.md** - Documento académico completo
- **.github/workflows/deploy.yml** - Pipeline CI/CD

---

**Versión**: 1.0  
**Última actualización**: Enero 2026  
**Soporte**: [GitHub Issues](https://github.com/tu-usuario/ecotachos/issues)
