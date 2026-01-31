import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Brain, ArrowLeft, MapPin, Tag, FileText, Calendar,
  Trash2, Image as ImageIcon, Percent, CheckCircle,
  XCircle, Zap, Eye, BarChart3, Clock, Target
} from "lucide-react";
import api from "../../api/axiosConfig";
import "./detecciones.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Icono personalizado para detección en mapa
const detectionIcon = new L.DivIcon({
  html: `
    <div style="
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border-radius: 50%;
      border: 3px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 20px;
      color: white;
    ">
      🧠
    </div>
  `,
  className: "",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
});

// Icono para tacho asociado
const tachoIcon = new L.DivIcon({
  html: `
    <div style="
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 18px;
      color: white;
    ">
      🗑️
    </div>
  `,
  className: "",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const DeteccionDetail = () => {
  const { id } = useParams();
  const [deteccion, setDeteccion] = useState(null);
  const [tacho, setTacho] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDeteccion = async () => {
    try {
      setLoading(true);

      if (!id || id === "ia") {
        setError("ID de detección no válido");
        setDeteccion(null);
        return;
      }

      const res = await api.get(`/detecciones/${id}/`);
      setDeteccion(res.data);

      // Si hay tacho asociado, cargarlo
      if (res.data.tacho_id) {
        try {
          const tachoRes = await api.get(`/tachos/${res.data.tacho_id}/`);
          setTacho(tachoRes.data);
        } catch (tachoError) {
          console.error("Error cargando tacho asociado", tachoError);
        }
      }

      setError(null);

    } catch (error) {
      console.error("Error cargando detección:", error);
      setError(`Error al cargar la detección: ${error.message}`);
      setDeteccion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeteccion();
  }, [id]);

  const getClasificacionIcon = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return <CheckCircle className="icon-sm" style={{ color: '#10b981' }} />;
      case 'inorganico': return <XCircle className="icon-sm" style={{ color: '#3b82f6' }} />;
      case 'reciclable': return <Zap className="icon-sm" style={{ color: '#f59e0b' }} />;
      default: return <Brain className="icon-sm" style={{ color: '#8b5cf6' }} />;
    }
  };

  const getClasificacionBadgeClass = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return 'organico';
      case 'inorganico': return 'inorganico';
      case 'reciclable': return 'reciclable';
      default: return 'organico';
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

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'No disponible';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando detalle de la detección...</p>
      </div>
    );
  }

  if (!deteccion) {
    return (
      <div className="empty-state">
        <Brain className="empty-state-icon" size={64} />
        <h3>Detección no encontrada</h3>
        <p>No se pudo cargar la información de la detección</p>
        <Link to="/detecciones" className="ia-btn ia-btn-primary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          Volver a la lista
        </Link>
      </div>
    );
  }

  const lat = Number(deteccion.ubicacion_lat) || -0.1807;
  const lon = Number(deteccion.ubicacion_lon) || -78.4678;
  const tachoLat = tacho?.ubicacion_lat ? Number(tacho.ubicacion_lat) : null;
  const tachoLon = tacho?.ubicacion_lon ? Number(tacho.ubicacion_lon) : null;
  const confidence = deteccion.confianza_ia || deteccion.confianza || 0;

  return (
    <div className="detecciones-container">
      {/* Header elegante */}
      <div className="ia-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <Link to="/detecciones" className="ia-btn ia-btn-secondary" style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
            <ArrowLeft size={16} />
            Volver
          </Link>
          <span className="ia-badge">
            <Brain size={16} />
            Detalle de Detección IA
          </span>
        </div>

        <div className="ia-header-content">
        </div>
      </div>

      {/* Grid principal */}
      <div className="detection-detail-grid">
        {/* Información de la detección */}
        <div className="ia-analysis-section">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={20} color="#8b5cf6" />
              Información de la Detección
            </h3>

            <div className="detection-stats">


              <div className="detection-stat">
                <div className="detection-stat-value">{confidence}%</div>
                <div className="detection-stat-label">Confianza IA</div>
              </div>

              <div className="detection-stat">
                <div className="detection-stat-value">
                  {getClasificacionIcon(deteccion.clasificacion)}
                </div>
                <div className="detection-stat-label">Clasificación</div>
              </div>
            </div>
          </div>

          {/* Detalles */}
          <div style={{ display: 'grid', gap: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
              <Trash2 size={18} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Tacho Asociado</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                  {tacho ? (
                    <Link to={`/tachos/${tacho.id}`} style={{ color: '#10b981', textDecoration: 'none' }}>
                      {tacho.nombre} (#{tacho.id})
                    </Link>
                  ) : (
                    deteccion.tacho_nombre || "No especificado"
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
              <Calendar size={18} color="#6b7280" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' }}>Fecha de Registro</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>{formatFecha(deteccion.fecha_registro || deteccion.created_at)}</div>
              </div>
            </div>

            {/* Barra de confianza */}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Confianza de la IA</span>
                <span style={{ fontWeight: '700', color: confidence >= 80 ? '#10b981' : confidence >= 60 ? '#f59e0b' : '#ef4444' }}>
                  {confidence}%
                </span>
              </div>
              <div className="confidence-meter">
                <div className="confidence-track">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${confidence}%`,
                      backgroundColor: confidence >= 80 ? '#10b981' :
                                    confidence >= 60 ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    <span className="confidence-text">{confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem' }}>
                Clasificación del Residuo
              </div>
              <div className={`clasification-badge ${getClasificacionBadgeClass(deteccion.clasificacion)}`} style={{ fontSize: '0.875rem', padding: '0.75rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {getClasificacionIcon(deteccion.clasificacion)}
                  <span style={{ fontWeight: '700' }}>{getClasificacionText(deteccion.clasificacion)}</span>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {deteccion.descripcion && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={14} />
                  Descripción
                </div>
                <div style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#4b5563',
                  lineHeight: '1.5'
                }}>
                  {deteccion.descripcion}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mapa y visualización */}
        <div>
          {/* Mapa de ubicación */}
          <div className="ia-analysis-section">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="#ef4444" />
              Ubicación de la Detección
            </h3>

            <div className="detection-map">
              <MapContainer
                center={[lat, lon]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Marcador de detección */}
                <Marker position={[lat, lon]} icon={detectionIcon}>
                  <Popup>
                    <strong>Detección #{deteccion.id}</strong><br />
                    {deteccion.nombre}<br />
                    <small>Confianza: {confidence}%</small>
                  </Popup>
                </Marker>

                {/* Marcador del tacho si existe */}
                {tachoLat && tachoLon && (
                  <Marker position={[tachoLat, tachoLon]} icon={tachoIcon}>
                    <Popup>
                      <strong>{tacho.nombre}</strong><br />
                      Tacho asociado<br />
                      <small>Estado: {tacho.estado || 'Desconocido'}</small>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={14} />
                  <span>Coordenadas: {lat.toFixed(6)}, {lon.toFixed(6)}</span>
                </div>
                {tacho && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <Trash2 size={14} />
                    <span>Tacho: {tacho.nombre} ({tachoLat?.toFixed(6)}, {tachoLon?.toFixed(6)})</span>
                  </div>
                )}
              </div>

              <a
                href={`https://www.google.com/maps?q=${lat},${lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ia-btn ia-btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                <MapPin size={14} />
                Ver en Maps
              </a>
            </div>
          </div>

          {/* Imagen de la detección */}
          {deteccion.imagen && (
            <div className="ia-analysis-section" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={20} color="#8b5cf6" />
                Imagen Analizada
              </h3>

              <div style={{
                background: '#000',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #e5e7eb'
              }}>
                <img
                  src={deteccion.imagen}
                  alt={`Detección ${deteccion.nombre}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain',
                    maxHeight: '400px'
                  }}
                />
              </div>

              <div className="ia-info-box" style={{ marginTop: '1rem' }}>
                <Eye size={16} />
                <span>Esta imagen fue analizada por nuestro sistema de IA para clasificar el residuo</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info footer */}
      <div className="ia-info-box" style={{ marginTop: '1.5rem' }}>
        <Brain size={20} />
        <div style={{ flex: 1 }}>
          <strong>Procesamiento con IA</strong>
          <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Esta detección fue procesada automáticamente por nuestro sistema de inteligencia artificial
            que analiza imágenes en tiempo real para clasificar residuos y optimizar la gestión de recolección.
          </div>
        </div>
        <Link to="/detecciones" className="ia-btn ia-btn-primary" style={{ fontSize: '0.875rem' }}>
          <BarChart3 size={14} />
          Ver todas
        </Link>
      </div>
    </div>
  );
};

export default DeteccionDetail;