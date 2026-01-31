// src/pages/User/TachoDetailUser.jsx
import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  Trash2,
  ArrowLeft,
  MapPin,
  Tag,
  Calendar,
  Battery,
  Activity,
  Brain,
  Eye,
  History,
  CheckCircle,
  XCircle,
  Zap,
  Image as ImageIcon,
  BarChart3,
  Clock,
  FileText,
  TrendingUp,
  AlertTriangle,
  User,
  Building,
  Navigation,
  Target,
  Shield,
  Globe,
  Layers,
  Thermometer,
  Database,
  Hash
} from "lucide-react";
import api from "../../api/axiosConfig";
import "././TachoDetailUser.css";

const TachoDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tacho, setTacho] = useState(null);
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetecciones, setLoadingDetecciones] = useState(false);
  const [error, setError] = useState(null);
  const [distancia, setDistancia] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  }, []);

  // Calcular distancia entre usuario y tacho
  useEffect(() => {
    if (userLocation && tacho && tacho.ubicacion_lat && tacho.ubicacion_lon) {
      const distanciaKm = calcularDistancia(
        userLocation.lat,
        userLocation.lon,
        parseFloat(tacho.ubicacion_lat),
        parseFloat(tacho.ubicacion_lon)
      );
      setDistancia(distanciaKm);
    }
  }, [userLocation, tacho]);

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const loadTacho = async () => {
    try {
      const res = await api.get(`/tachos/${id}/`);
      const tachoData = res.data;
      setTacho(tachoData);

      // Verificar permisos - usuarios normales solo pueden ver sus tachos o tachos públicos
      if (user?.rol !== 'admin') {
        const esMiTacho = tachoData.propietario === user?.id;
        const esTachoPublico = tachoData.tipo === 'publico';

        if (!esMiTacho && !esTachoPublico) {
          setError("No tienes permiso para ver este tacho");
          setTacho(null);
        }
      }
    } catch (e) {
      console.error("Error cargando tacho", e);
      setError("No se pudo cargar la información del tacho");
    }
  };

  const loadDeteccionesTacho = async () => {
    setLoadingDetecciones(true);
    setError(null);
    try {
      // Usar endpoint alternativo para usuarios normales
      const res = await api.get(`/detecciones/`, {
        params: { tacho: id }
      });

      // Filtrar detecciones por tacho_id
      const deteccionesFiltradas = res.data.filter(det =>
        det.tacho == id || det.tacho_id == id
      );
      setDetecciones(deteccionesFiltradas);

    } catch (error) {
      console.error("Error cargando detecciones", error);
      setError("No se pudieron cargar las detecciones del tacho");
    } finally {
      setLoadingDetecciones(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadTacho();
      await loadDeteccionesTacho();
    };
    fetchData();
  }, [id]);

  // Helper functions
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'activo': return 'status-active';
      case 'mantenimiento': return 'status-warning';
      case 'fuera_servicio': return 'status-inactive';
      default: return 'status-active';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'mantenimiento': return 'Mantenimiento';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return estado;
    }
  };

  const getNivelColor = (nivel) => {
    const nivelValue = nivel || 0;
    if (nivelValue >= 80) return '#ef4444';
    if (nivelValue >= 50) return '#f59e0b';
    return '#10b981';
  };

  const getClasificacionIcon = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return <CheckCircle className="icon-xs" />;
      case 'inorganico': return <XCircle className="icon-xs" />;
      case 'reciclable': return <Zap className="icon-xs" />;
      default: return <Brain className="icon-xs" />;
    }
  };

  const getClasificacionText = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'Orgánico';
      case 'inorganico': return 'Inorgánico';
      case 'reciclable': return 'Reciclable';
      default: return clasificacion || 'No definido';
    }
  };

  const getClasificacionBadgeClass = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'badge-success';
      case 'inorganico': return 'badge-info';
      case 'reciclable': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const formatFecha = (fechaString, short = false) => {
    if (!fechaString) return 'No disponible';
    const fecha = new Date(fechaString);
    if (short) {
      return fecha.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfianza = (confianza) => {
    if (!confianza) return '0%';
    return `${parseFloat(confianza).toFixed(1)}%`;
  };

  const getUbicacionFromCoords = (lat, lon) => {
    if (!lat || !lon) return "Ubicación desconocida";

    const locations = [
      { provincia: "Pichincha", ciudad: "Quito", latRange: [-0.3, 0.1], lonRange: [-78.6, -78.4] },
      { provincia: "Guayas", ciudad: "Guayaquil", latRange: [-2.3, -2.1], lonRange: [-79.95, -79.85] },
      { provincia: "Azuay", ciudad: "Cuenca", latRange: [-2.92, -2.88], lonRange: [-79.02, -78.98] },
      { provincia: "Manabí", ciudad: "Manta", latRange: [-1.06, -0.98], lonRange: [-80.75, -80.65] },
      { provincia: "El Oro", ciudad: "Machala", latRange: [-3.28, -3.24], lonRange: [-79.97, -79.93] },
      { provincia: "Loja", ciudad: "Loja", latRange: [-4.02, -3.98], lonRange: [-79.22, -79.18] },
      { provincia: "Tungurahua", ciudad: "Ambato", latRange: [-1.28, -1.22], lonRange: [-78.65, -78.59] },
    ];

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    for (const location of locations) {
      if (
        latNum >= location.latRange[0] && latNum <= location.latRange[1] &&
        lonNum >= location.lonRange[0] && lonNum <= location.lonRange[1]
      ) {
        return `${location.ciudad}, ${location.provincia}`;
      }
    }

    if (latNum > 0) return "Región Norte";
    if (latNum < -2) return "Región Sur";
    if (lonNum < -80) return "Región Costa";
    return "Región Sierra";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detalle del tacho...</p>
      </div>
    );
  }

  if (error && !tacho) {
    return (
      <div className="empty-state">
        <AlertTriangle className="empty-state-icon" size={48} />
        <h3>{error}</h3>
        <Link to="/user" className="header-back">
          <ArrowLeft className="icon-sm" />
          Volver al panel
        </Link>
      </div>
    );
  }

  if (!tacho) {
    return (
      <div className="empty-state">
        <Trash2 className="empty-state-icon" size={48} />
        <h3>Tacho no encontrado</h3>
        <p>No se pudo cargar la información del tacho</p>
        <Link to="/user" className="header-back">
          <ArrowLeft className="icon-sm" />
          Volver al panel
        </Link>
      </div>
    );
  }

  const lat = Number(tacho.ubicacion_lat) || 0;
  const lon = Number(tacho.ubicacion_lon) || 0;
  const ubicacionTexto = getUbicacionFromCoords(lat, lon);

  // Estadísticas de detecciones
  const stats = {
    total: detecciones.length,
    altaConfianza: detecciones.filter(d => parseFloat(d.confianza_ia || 0) >= 80).length,
    confianzaPromedio: detecciones.length > 0
      ? (detecciones.reduce((acc, det) => acc + parseFloat(det.confianza_ia || 0), 0) / detecciones.length).toFixed(1)
      : 0,
    tiposUnicos: new Set(detecciones.map(d => d.clasificacion)).size,
    distribucion: {
      organico: detecciones.filter(d => d.clasificacion === 'organico').length,
      inorganico: detecciones.filter(d => d.clasificacion === 'inorganico').length,
      reciclable: detecciones.filter(d => d.clasificacion === 'reciclable').length,
      otros: detecciones.filter(d => !['organico', 'inorganico', 'reciclable'].includes(d.clasificacion)).length
    }
  };

  // Determinar tipo de visualización según el rol
  const esMiTacho = tacho.propietario === user?.id;
  const esTachoPublico = tacho.tipo === 'publico';
  const esTachoEmpresa = tacho.empresa_nombre && esMiTacho;

  return (
    <div className="tacho-detail-container">
      {/* Header para usuarios normales */}
      <div className="tacho-detail-header">
        <div className="header-top">
          <Link to="/user" className="header-back">
            <ArrowLeft className="icon-sm" />
            Volver al Panel
          </Link>
          <div className="header-title-section">
            <h1 className="header-title">
              <Trash2 className="icon-lg" />
              {tacho.nombre}
            </h1>
            <div className="header-subtitle">
              <span><Tag className="icon-sm" /> {tacho.codigo}</span>
              <span>•</span>
              <span className={`status-badge ${getEstadoClass(tacho.estado)}`}>
                <span className="status-indicator"></span>
                {getEstadoText(tacho.estado)}
              </span>
              {distancia !== null && (
                <>
                  <span>•</span>
                  <span className="distance-indicator">
                    <Navigation size={14} />
                    {distancia.toFixed(1)} km
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badge de tipo de tacho */}
        <div className="tacho-type-badge">
          {esMiTacho ? (
            <div className="badge-user">
              <User size={14} />
              <span>Mi Tacho Personal</span>
            </div>
          ) : esTachoEmpresa ? (
            <div className="badge-empresa">
              <Building size={14} />
              <span>Empresa: {tacho.empresa_nombre}</span>
            </div>
          ) : esTachoPublico ? (
            <div className="badge-publico">
              <Globe size={14} />
              <span>Tacho Público</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Grid principal simplificado para usuarios */}
      <div className="detail-grid">
        {/* Información del Tacho - Versión simplificada */}
        <div className="detail-card">
          <div className="card-header">
            <h3 className="card-title">
              <Layers className="card-title-icon" />
              Información General
            </h3>
          </div>
          <div className="card-body">
            <div className="info-grid-simple">
              <div className="info-item-simple">
                <div className="info-icon-simple">
                  <Hash size={20} />
                </div>
                <div className="info-content-simple">
                  <div className="info-label-simple">Código</div>
                  <div className="info-value-simple">{tacho.codigo}</div>
                </div>
              </div>

              <div className="info-item-simple">
                <div className="info-icon-simple">
                  <Activity size={20} />
                </div>
                <div className="info-content-simple">
                  <div className="info-label-simple">Estado</div>
                  <div className="info-value-simple">
                    <span className={`status-badge ${getEstadoClass(tacho.estado)}`}>
                      {getEstadoText(tacho.estado)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-item-simple">
                <div className="info-icon-simple">
                  <Battery size={20} />
                </div>
                <div className="info-content-simple">
                  <div className="info-label-simple">Nivel de Llenado</div>
                  <div className="info-value-simple">
                    <div className="progress-bar-simple">
                      <div
                        className="progress-fill-simple"
                        style={{
                          width: `${tacho.nivel_llenado || 0}%`,
                          backgroundColor: getNivelColor(tacho.nivel_llenado)
                        }}
                      >
                        <span className="progress-text-simple">{tacho.nivel_llenado || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-item-simple">
                <div className="info-icon-simple">
                  <MapPin size={20} />
                </div>
                <div className="info-content-simple">
                  <div className="info-label-simple">Ubicación</div>
                  <div className="info-value-simple">{ubicacionTexto}</div>
                  <div className="info-coords-simple">
                    {lat.toFixed(6)}, {lon.toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="info-item-simple">
                <div className="info-icon-simple">
                  <Calendar size={20} />
                </div>
                <div className="info-content-simple">
                  <div className="info-label-simple">Registro</div>
                  <div className="info-value-simple">{formatFecha(tacho.created_at, true)}</div>
                </div>
              </div>

              <div className="info-item-simple">
                <div className="info-icon-simple">
                  <Database size={20} />
                </div>
                <div className="info-content-simple">
                  <div className="info-label-simple">Detecciones</div>
                  <div className="info-value-simple">{detecciones.length}</div>
                </div>
              </div>

              {tacho.empresa_nombre && (
                <div className="info-item-simple">
                  <div className="info-icon-simple">
                    <Building size={20} />
                  </div>
                  <div className="info-content-simple">
                    <div className="info-label-simple">Empresa</div>
                    <div className="info-value-simple">{tacho.empresa_nombre}</div>
                  </div>
                </div>
              )}

              {tacho.descripcion && (
                <div className="info-item-simple full-width">
                  <div className="info-icon-simple">
                    <FileText size={20} />
                  </div>
                  <div className="info-content-simple">
                    <div className="info-label-simple">Descripción</div>
                    <div className="info-value-simple">{tacho.descripcion}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Acciones rápidas */}
            <div className="quick-actions-simple">
              <a
                href={`https://www.google.com/maps?q=${lat},${lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="action-btn"
              >
                <MapPin size={16} />
                Ver en Google Maps
              </a>

              {distancia !== null && (
                <div className="distance-info">
                  <Target size={16} />
                  <span>A {distancia.toFixed(1)} km de tu ubicación</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de Detecciones */}
        <div className="detail-card">
          <div className="card-header">
            <h3 className="card-title">
              <Brain className="card-title-icon" />
              Detecciones IA
              <span className="badge" style={{ marginLeft: "0.75rem", background: "#3b82f6" }}>
                {detecciones.length}
              </span>
            </h3>
          </div>
          <div className="card-body">
            {loadingDetecciones ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <div className="spinner spinner-sm"></div>
                <p className="loading-text">
                  Cargando detecciones...
                </p>
              </div>
            ) : detecciones.length === 0 ? (
              <div className="empty-state">
                <Brain className="empty-state-icon" size={48} />
                <h3>No hay detecciones</h3>
                <p>Este tacho no tiene detecciones de IA registradas</p>
              </div>
            ) : (
              <>
                {/* Estadísticas rápidas */}
                <div className="stats-grid-sm">
                  <div className="stat-item">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total</div>
                  </div>

                  <div className="stat-item">
                    <div className="stat-value">{stats.confianzaPromedio}%</div>
                    <div className="stat-label">Conf. Promedio</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.tiposUnicos}</div>
                    <div className="stat-label">Tipos Únicos</div>
                  </div>
                </div>

                {/* Lista de detecciones recientes */}
                <div className="detections-list">
                  <h4 className="list-title">Detecciones Recientes</h4>
                  {detecciones.slice(0, 5).map((det) => (
                    <div key={det.id} className="detection-item">
                      <div className="detection-icon">
                        {getClasificacionIcon(det.clasificacion)}
                      </div>
                      <div className="detection-content">
                        <div className="detection-header">
                          <span className="detection-classification">
                            {getClasificacionText(det.clasificacion)}
                          </span>
                          <span className="detection-confidence">
                            {formatConfianza(det.confianza_ia)}
                          </span>
                        </div>
                        <div className="detection-date">
                          <Clock size={12} />
                          {formatFecha(det.created_at, true)}
                        </div>
                      </div>
                      {det.imagen && (
                        <a
                          href={det.imagen}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="detection-image-btn"
                          title="Ver imagen"
                        >
                          <ImageIcon size={16} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                {/* Distribución */}
                <div className="distribution-simple">
                  <h4 className="list-title">Distribución de Residuos</h4>
                  <div className="distribution-bars">
                    {Object.entries(stats.distribucion)
                      .filter(([tipo, count]) => count > 0)
                      .map(([tipo, count]) => {
                        const porcentaje = detecciones.length > 0 ? ((count / detecciones.length) * 100).toFixed(1) : 0;
                        return (
                          <div key={tipo} className="distribution-bar-item">
                            <div className="bar-label">
                              {getClasificacionText(tipo)}
                              <span className="bar-count">({count})</span>
                            </div>
                            <div className="bar-container">
                              <div
                                className="bar-fill"
                                style={{
                                  width: `${porcentaje}%`,
                                  backgroundColor: tipo === 'organico' ? '#10b981' :
                                                 tipo === 'inorganico' ? '#3b82f6' :
                                                 tipo === 'reciclable' ? '#f59e0b' : '#6b7280'
                                }}
                              />
                            </div>
                            <div className="bar-percentage">{porcentaje}%</div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {detecciones.length > 5 && (
                  <div className="view-all-container">
                    <Link to={`/detecciones?tacho=${id}`} className="view-all-btn">
                      Ver todas las detecciones ({detecciones.length})
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resumen IA */}
      {detecciones.length > 0 && (
        <div className="ai-summary">
          <div className="ai-summary-header">
            <div className="ai-summary-icon">
              <Brain size={18} />
            </div>
            <h4 className="ai-summary-title">Resumen de IA</h4>
          </div>
          <div className="ai-summary-content">
            <div className="ai-summary-text">
              Este tacho ha procesado <strong>{detecciones.length}</strong> detecciones mediante IA
              con una confianza promedio de <strong>{stats.confianzaPromedio}%</strong>.
              Última detección: <strong>{formatFecha(detecciones[0]?.created_at, true)}</strong>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default TachoDetail;