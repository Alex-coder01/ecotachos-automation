package main

import (
	"bytes"
	"fmt"
	"os"
	"strings"
	"time"

	"golang.org/x/crypto/ssh"
)

// Config estructura de configuración
type Config struct {
	DropletIP      string
	SSHUser        string
	SSHKeyPath     string
	ProjectPath    string
	BackendService string
	FrontendPort   int
}

// SSHClient cliente SSH para ejecutar comandos remotos
type SSHClient struct {
	config *ssh.ClientConfig
	addr   string
}

// NewSSHClient crea un nuevo cliente SSH
func NewSSHClient(keyPath, user, host string) (*SSHClient, error) {
	key, err := os.ReadFile(keyPath)
	if err != nil {
		return nil, fmt.Errorf("error leyendo clave SSH: %w", err)
	}

	signer, err := ssh.ParsePrivateKey(key)
	if err != nil {
		return nil, fmt.Errorf("error parseando clave SSH: %w", err)
	}

	config := &ssh.ClientConfig{
		User: user,
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(signer),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         10 * time.Second,
	}

	return &SSHClient{
		config: config,
		addr:   fmt.Sprintf("%s:22", host),
	}, nil
}

// Execute ejecuta un comando remoto
func (sc *SSHClient) Execute(command string) (string, error) {
	client, err := ssh.Dial("tcp", sc.addr, sc.config)
	if err != nil {
		return "", fmt.Errorf("error conectando SSH: %w", err)
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return "", fmt.Errorf("error creando sesión SSH: %w", err)
	}
	defer session.Close()

	var out bytes.Buffer
	session.Stdout = &out

	if err := session.Run(command); err != nil {
		return out.String(), fmt.Errorf("error ejecutando comando: %w", err)
	}

	return out.String(), nil
}

// ==================== FUNCIONES DE DEPLOYMENT ====================

// TestConnection prueba conexión con Droplet
func TestConnection(sshClient *SSHClient) error {
	fmt.Println("🔗 Probando conexión con Droplet...")
	output, err := sshClient.Execute("uname -a")
	if err != nil {
		fmt.Printf("❌ No se puede conectar: %v\n", err)
		return err
	}
	fmt.Printf("✅ Conectado: %s\n", strings.TrimSpace(output))
	return nil
}

// PullCode actualiza el código del repositorio
func PullCode(sshClient *SSHClient, projectPath string) error {
	fmt.Println("📥 Actualizando código...")
	cmd := fmt.Sprintf("cd %s && git pull origin main", projectPath)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("❌ Error actualizando código: %v\n", err)
		return err
	}
	fmt.Printf("✅ Código actualizado:\n%s\n", output)
	return nil
}

// BackupDatabase realiza backup de la base de datos
func BackupDatabase(sshClient *SSHClient, projectPath string) error {
	fmt.Println("💾 Realizando backup de base de datos...")
	timestamp := time.Now().Format("20060102_150405")
	cmd := fmt.Sprintf("cd %s && docker-compose exec -T postgres pg_dump -U postgres postgres > backup_db_%s.sql", projectPath, timestamp)
	_, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("⚠️  Error en backup (continuando): %v\n", err)
		return nil
	}
	fmt.Printf("✅ Backup realizado: backup_db_%s.sql\n", timestamp)
	return nil
}

// BuildImages construye las imágenes Docker
func BuildImages(sshClient *SSHClient, projectPath string) error {
	fmt.Println("🔨 Construyendo imágenes Docker...")
	cmd := fmt.Sprintf("cd %s && docker-compose build --no-cache", projectPath)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("❌ Error construyendo imágenes: %v\n", err)
		return err
	}
	fmt.Printf("✅ Imágenes construidas\n%s\n", output)
	return nil
}

// DeployServices inicia los servicios
func DeployServices(sshClient *SSHClient, projectPath string) error {
	fmt.Println("🚀 Iniciando servicios...")
	cmd := fmt.Sprintf("cd %s && docker-compose up -d", projectPath)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("❌ Error iniciando servicios: %v\n", err)
		return err
	}
	fmt.Printf("✅ Servicios iniciados\n%s\n", output)
	return nil
}

// RunMigrations ejecuta migraciones de Django
func RunMigrations(sshClient *SSHClient, projectPath string) error {
	fmt.Println("📊 Ejecutando migraciones...")
	cmd := fmt.Sprintf("cd %s && docker-compose exec -T backend python manage.py migrate", projectPath)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("⚠️  Error en migraciones: %v\n", err)
		return nil
	}
	fmt.Printf("✅ Migraciones ejecutadas\n%s\n", output)
	return nil
}

// HealthCheck verifica la salud de los servicios
func HealthCheck(sshClient *SSHClient, projectPath string) error {
	fmt.Println("💚 Verificando salud de servicios...")
	cmd := fmt.Sprintf("cd %s && docker-compose ps", projectPath)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("❌ Error verificando servicios: %v\n", err)
		return err
	}

	fmt.Printf("✅ Estado de servicios:\n%s\n", output)
	return nil
}

// GetLogs obtiene los logs de un servicio
func GetLogs(sshClient *SSHClient, projectPath, service string) error {
	fmt.Printf("📋 Obteniendo logs de %s...\n", service)
	cmd := fmt.Sprintf("cd %s && docker-compose logs --tail=50 %s", projectPath, service)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("❌ Error obteniendo logs: %v\n", err)
		return err
	}
	fmt.Printf("📝 Logs:\n%s\n", output)
	return nil
}

// Rollback revierte al despliegue anterior
func Rollback(sshClient *SSHClient, projectPath string) error {
	fmt.Println("⚠️  Iniciando rollback...")
	cmd := fmt.Sprintf("cd %s && git revert HEAD --no-edit && docker-compose restart", projectPath)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("❌ Error en rollback: %v\n", err)
		return err
	}
	fmt.Printf("✅ Rollback completado\n%s\n", output)
	return nil
}

// GetServiceStatus obtiene el estado de un servicio
func GetServiceStatus(sshClient *SSHClient, projectPath, service string) error {
	fmt.Printf("📊 Estado de %s\n", service)
	cmd := fmt.Sprintf("cd %s && docker-compose ps %s", projectPath, service)
	output, err := sshClient.Execute(cmd)
	if err != nil {
		fmt.Printf("❌ Error: %v\n", err)
		return err
	}
	fmt.Printf("Status:\n%s\n", output)
	return nil
}

// MonitorLoop monitorea continuamente los servicios
func MonitorLoop(sshClient *SSHClient, projectPath string, interval int) {
	fmt.Printf("📡 Iniciando monitoreo cada %d segundos...\n", interval)
	ticker := time.NewTicker(time.Duration(interval) * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		cmd := fmt.Sprintf("cd %s && docker-compose ps", projectPath)
		output, err := sshClient.Execute(cmd)
		if err != nil {
			fmt.Printf("❌ Error verificando: %v\n", err)
			continue
		}

		fmt.Printf("⏰ %s\n%s\n", time.Now().Format("15:04:05"), output)
	}
}

// FullDeploy ejecuta el pipeline completo de deployment
func FullDeploy(sshClient *SSHClient, cfg *Config) error {
	fmt.Println("🚀🚀🚀 Iniciando despliegue completo...")

	steps := []struct {
		name string
		fn   func() error
	}{
		{"Conexión", func() error { return TestConnection(sshClient) }},
		{"Actualizar código", func() error { return PullCode(sshClient, cfg.ProjectPath) }},
		{"Backup de BD", func() error { return BackupDatabase(sshClient, cfg.ProjectPath) }},
		{"Construir imágenes", func() error { return BuildImages(sshClient, cfg.ProjectPath) }},
		{"Desplegar servicios", func() error { return DeployServices(sshClient, cfg.ProjectPath) }},
		{"Migraciones", func() error { return RunMigrations(sshClient, cfg.ProjectPath) }},
		{"Health check", func() error { return HealthCheck(sshClient, cfg.ProjectPath) }},
	}

	for i, step := range steps {
		fmt.Printf("\n[%d/%d] %s\n", i+1, len(steps), step.name)
		if err := step.fn(); err != nil {
			fmt.Printf("❌ Error en paso: %s\n", step.name)
			fmt.Println("⚠️  Intentando rollback...")
			if rollbackErr := Rollback(sshClient, cfg.ProjectPath); rollbackErr != nil {
				fmt.Printf("❌ Error en rollback: %v\n", rollbackErr)
			}
			return err
		}
	}

	fmt.Println("✅✅✅ ¡Despliegue completado exitosamente!")
	return nil
}

// ==================== CLI ====================

func printHelp() {
	help := `
╔════════════════════════════════════════════════════════════════╗
║       ECOTACHOS - DigitalOcean Deployment Manager             ║
║                    v1.0                                        ║
╚════════════════════════════════════════════════════════════════╝

COMANDOS DISPONIBLES:

  deploy          Ejecutar despliegue completo
  status          Ver estado de servicios
  logs <service>  Obtener logs de un servicio
  health          Verificar salud general
  monitor <secs>  Monitorear servicios (cada N segundos)
  rollback        Revertir al despliegue anterior
  test            Probar conexión con Droplet

VARIABLES DE ENTORNO:

  DROPLET_IP      IP del Droplet de DigitalOcean
  SSH_USER        Usuario SSH (default: root)
  SSH_KEY         Ruta a la clave privada SSH
  PROJECT_PATH    Ruta del proyecto en el Droplet

EJEMPLOS:

  go run ops/do/main.go deploy
  go run ops/do/main.go status
  go run ops/do/main.go logs backend
  go run ops/do/main.go monitor 10

`
	fmt.Print(help)
}

func main() {
	if len(os.Args) < 2 {
		printHelp()
		return
	}

	// Configuración
	dropletIP := os.Getenv("DROPLET_IP")
	if dropletIP == "" {
		fmt.Println("❌ DROPLET_IP no configurada")
		os.Exit(1)
	}

	sshUser := os.Getenv("SSH_USER")
	if sshUser == "" {
		sshUser = "root"
	}

	sshKey := os.Getenv("SSH_KEY")
	if sshKey == "" {
		home, _ := os.UserHomeDir()
		sshKey = fmt.Sprintf("%s/.ssh/id_rsa", home)
	}

	projectPath := os.Getenv("PROJECT_PATH")
	if projectPath == "" {
		projectPath = "/root/ecotachos"
	}

	cfg := &Config{
		DropletIP:   dropletIP,
		SSHUser:     sshUser,
		SSHKeyPath:  sshKey,
		ProjectPath: projectPath,
	}

	fmt.Println("⚙️  Configuración:")
	fmt.Printf("   IP: %s\n", cfg.DropletIP)
	fmt.Printf("   Usuario: %s\n", cfg.SSHUser)
	fmt.Printf("   Ruta: %s\n", cfg.ProjectPath)

	// Conectar SSH
	sshClient, err := NewSSHClient(cfg.SSHKeyPath, cfg.SSHUser, cfg.DropletIP)
	if err != nil {
		fmt.Printf("❌ Error creando cliente SSH: %v\n", err)
		os.Exit(1)
	}

	// Ejecutar comando
	command := os.Args[1]

	switch command {
	case "deploy":
		if err := FullDeploy(sshClient, cfg); err != nil {
			fmt.Printf("❌ Despliegue falló: %v\n", err)
			os.Exit(1)
		}

	case "status":
		if err := GetServiceStatus(sshClient, cfg.ProjectPath, ""); err != nil {
			fmt.Printf("Error: %v\n", err)
		}

	case "logs":
		service := "backend"
		if len(os.Args) > 2 {
			service = os.Args[2]
		}
		if err := GetLogs(sshClient, cfg.ProjectPath, service); err != nil {
			fmt.Printf("Error: %v\n", err)
		}

	case "health":
		if err := HealthCheck(sshClient, cfg.ProjectPath); err != nil {
			fmt.Printf("Error: %v\n", err)
		}

	case "monitor":
		interval := 10
		if len(os.Args) > 2 {
			fmt.Sscanf(os.Args[2], "%d", &interval)
		}
		MonitorLoop(sshClient, cfg.ProjectPath, interval)

	case "rollback":
		if err := Rollback(sshClient, cfg.ProjectPath); err != nil {
			fmt.Printf("Error: %v\n", err)
		}

	case "test":
		if err := TestConnection(sshClient); err != nil {
			fmt.Printf("Error: %v\n", err)
		}

	case "help":
		printHelp()

	default:
		fmt.Printf("❌ Comando desconocido: %s\n", command)
		printHelp()
	}
}
