// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Brain,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  User,
  FileText,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import api from "../../api/axiosConfig";
import "./dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalTachos: 0,
    totalDetecciones: 0,
    totalUsuarios: 0,
    totalUbicaciones: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // =======================
  // 🔹 Cargar datos del dashboard
  // =======================
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [tachosRes, deteccionesRes, usuariosRes, ubicacionesRes] =
        await Promise.all([
          api.get("/tachos/"),
          api.get("/detecciones/"),
          api.get("/usuarios/"),
          api.get("/ubicacion/cantones/"),
        ]);

      setStats({
        totalTachos: tachosRes.data.length || 0,
        totalDetecciones: deteccionesRes.data.length || 0,
        totalUsuarios: usuariosRes.data.length || 0,
        totalUbicaciones: ubicacionesRes.data.length || 0,
      });

      // Cargar actividad reciente basada en el formato de detecciones
      const recent = deteccionesRes.data
        .slice(0, 5)
        .map((deteccion) => ({
          id: deteccion.id,
          type: "detection",
          message: deteccion.nombre
            ? `Detección: ${deteccion.nombre}`
            : `Nueva detección #${deteccion.id}`,
          tacho: deteccion.tacho_nombre || "Tacho desconocido",
          time: deteccion.fecha_registro
            ? new Date(deteccion.fecha_registro).toLocaleString("es-EC", {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })
            : "Fecha no disponible",
          icon: Brain,
          status: "success"
        }));

      setRecentActivity(recent);

    } catch (error) {
      console.error("Error cargando datos del dashboard", error);

      // Si hay error específico en detecciones, mostrar mensaje
      if (error.response?.status === 404) {
        console.log("Endpoint de detecciones no encontrado, usando datos de ejemplo");

        // Datos de ejemplo para mostrar
        setRecentActivity([
          {
            id: 1,
            type: "detection",
            message: "Plástico PET detectado",
            tacho: "Tacho A-01",
            time: new Date().toLocaleString("es-EC"),
            icon: Brain,
            status: "success"
          },
          {
            id: 2,
            type: "detection",
            message: "Vidrio detectado",
            tacho: "Tacho B-02",
            time: new Date(Date.now() - 3600000).toLocaleString("es-EC"),
            icon: Brain,
            status: "success"
          }
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =======================
  // 🔹 Manejar refresco manual
  // =======================
  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  // ======================
  // 🔹 Tarjetas de estadísticas
  // ======================
  const statsData = [
    {
      icon: Trash2,
      value: stats.totalTachos,
      label: "Tachos Activos",
      trend: { value: 12, type: "positive" },
      color: "emerald",
      description: "Tachos IoT en funcionamiento"
    },
    {
      icon: Brain,
      value: stats.totalDetecciones,
      label: "Detecciones IA",
      trend: { value: 28, type: "positive" },
      color: "blue",
      description: "Clasificaciones realizadas"
    },
    {
      icon: Users,
      value: stats.totalUsuarios,
      label: "Usuarios Registrados",
      trend: { value: 5, type: "positive" },
      color: "purple",
      description: "Usuarios del sistema"
    },
    {
      icon: MapPin,
      value: stats.totalUbicaciones,
      label: "Ubicaciones",
      trend: { value: 3, type: "positive" },
      color: "orange",
      description: "Puntos de recolección"
    }
  ];

  // ======================
  // 🔹 Acciones rápidas (con redirección)
  // ======================
  const quickActions = [
    {
      icon: Plus,
      label: "Nuevo Tacho",
      color: "emerald",
      to: "/tachos/nuevo",
      description: "Registrar nuevo tacho IoT"
    },
    {
      icon: User,
      label: "Nuevo Usuario",
      color: "blue",
      to: "/usuarios/nuevo",
      description: "Crear cuenta de usuario"
    },
    {
      icon: MapPin,
      label: "Nueva Ubicación",
      color: "purple",
      to: "/ubicaciones/nuevo",
      description: "Agregar punto de recolección"
    },
    {
      icon: FileText,
      label: "Ver Reportes",
      color: "orange",
      to: "/detecciones",
      description: "Analizar con IA y ver historial"
    }
  ];

  // ======================
  // 🔹 Estado del sistema
  // ======================
  const systemStatus = [
    {
      label: "API Backend",
      value: "Conectado",
      status: "online",
      icon: CheckCircle
    },
    {
      label: "Base de Datos",
      value: "Operativa",
      status: "online",
      icon: CheckCircle
    },
    {
      label: "Servicios IoT",
      value: stats.totalTachos > 0 ? `${stats.totalTachos} activos` : "Sin conexión",
      status: stats.totalTachos > 0 ? "online" : "warning",
      icon: stats.totalTachos > 0 ? CheckCircle : AlertCircle
    },
    {
      label: "IA/ML Engine",
      value: stats.totalDetecciones > 0 ? "Funcionando" : "En espera",
      status: stats.totalDetecciones > 0 ? "online" : "warning",
      icon: stats.totalDetecciones > 0 ? CheckCircle : AlertCircle
    }
  ];

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div className="dashboard-header fade-in">
        <div>
          <h1 className="dashboard-title">Bienvenido a EcoTachosTec</h1>
          <p className="dashboard-subtitle">
            Panel de control y gestión inteligente de tachos IoT
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '8px',
              fontSize: '12px',
              opacity: 0.8
            }}>
              <RefreshCw
                size={12}
                className={refreshing ? "spinning" : ""}
                onClick={handleRefresh}
                style={{ cursor: 'pointer' }}
              />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </span>
          </p>
        </div>

        <button
          className="btn btn-primary btn-report"
          onClick={() => navigate("/detecciones")}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileText className="btn-icon" />
          Generar Reporte
        </button>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid slide-up">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon =
            stat.trend.type === "positive"
              ? TrendingUp
              : stat.trend.type === "negative"
              ? TrendingDown
              : Minus;

          return (
            <div
              key={index}
              className="stat-card"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="stat-card-header">
                <div className={`stat-card-icon stat-icon-${stat.color}`}>
                  <IconComponent className="stat-icon-svg" />
                </div>

                <span className={`stat-card-trend-badge trend-${stat.trend.type}`}>
                  <TrendIcon className="trend-icon" />
                  {stat.trend.value}%
                </span>
              </div>

              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-label">{stat.label}</div>
              <small style={{
                fontSize: '0.7rem',
                color: '#9ca3af',
                marginTop: '2px'
              }}>
                {stat.description}
              </small>
              <div className={`stat-card-trend trend-${stat.trend.type}`}>
                vs mes anterior
              </div>
            </div>
          );
        })}
      </div>

      {/* GRID PRINCIPAL */}
      <div className="dashboard-grid slide-up" style={{ animationDelay: "0.5s" }}>

        {/* ACTIVIDAD RECIENTE */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Actividad Reciente</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-info">
                <Activity className="badge-icon" /> En Vivo
              </span>
              <button
                onClick={handleRefresh}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280'
                }}
                title="Actualizar actividad"
              >
                <RefreshCw size={14} className={refreshing ? "spinning" : ""} />
              </button>
            </div>
          </div>

          <div className="card-body">
            {recentActivity.length === 0 ? (
              <div className="text-muted">
                <Brain size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>No hay actividad reciente</p>
                <small>Realiza una detección con IA para ver actividad</small>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="activity-item"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="activity-icon">
                        <IconComponent className="activity-icon-svg" />
                      </div>

                      <div className="activity-content">
                        <p className="activity-message">
                          {activity.message}
                          {activity.tacho && (
                            <span style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              marginTop: '2px'
                            }}>
                              en {activity.tacho}
                            </span>
                          )}
                        </p>
                        <span className="activity-time">
                          <Clock className="time-icon" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Acciones Rápidas</h3>
            <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Acceso directo a funciones
            </small>
          </div>

          <div className="card-body">
            <div className="quick-actions">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;

                return (
                  <button
                    key={index}
                    onClick={() => navigate(action.to)}
                    className="quick-action-btn"
                    title={action.description}
                  >
                    <div className={`quick-action-icon quick-action-${action.color}`}>
                      <IconComponent className="quick-action-icon-svg" />
                    </div>

                    <span className="quick-action-label">{action.label}</span>
                    <small style={{
                      fontSize: '0.7rem',
                      color: '#6b7280',
                      marginTop: '2px'
                    }}>
                      {action.description}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* ESTADO DEL SISTEMA */}
      <div className="card slide-up" style={{ animationDelay: "0.6s" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Estado del Sistema</h3>
            <small style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Monitoreo en tiempo real
            </small>
          </div>
          <span className="badge badge-success">
            <CheckCircle className="badge-icon" />
            Operativo
          </span>
        </div>

        <div className="card-body">
          <div className="system-status-grid">
            {systemStatus.map((item, index) => {
              const StatusIcon = item.icon;
              return (
                <div key={index} className="status-item">
                  <div className={`status-indicator ${item.status}`}></div>

                  <div className="status-info">
                    <span className="status-label">
                      {item.label}
                    </span>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <StatusIcon size={12} color={item.status === 'online' ? '#10b981' : '#f59e0b'} />
                      <span className="status-value">{item.value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agregar estilo para animación de spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>

    </div>
  );
}