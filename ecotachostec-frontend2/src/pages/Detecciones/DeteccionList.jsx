import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Brain, Camera, Upload, Calendar, MapPin, Trash2, Scan, X, Image as ImageIcon, Clock, TrendingUp } from "lucide-react";
import api from "../../api/axiosConfig";
import AIProcessor from "../../components/AIProcessor/AIProcessor";
import "./detecciones.css";
import Webcam from "react-webcam";

// Función para convertir coordenadas a ubicación geográfica aproximada
const getUbicacionFromCoords = (lat, lon) => {
  if (!lat || !lon) return "Ubicación desconocida";

  // Coordenadas aproximadas para provincias de Ecuador
  const locations = [
    { provincia: "Pichincha", ciudad: "Quito", latRange: [-0.3, 0.1], lonRange: [-78.6, -78.4] },
    { provincia: "Guayas", ciudad: "Guayaquil", latRange: [-2.3, -2.1], lonRange: [-79.95, -79.85] },
    { provincia: "Azuay", ciudad: "Cuenca", latRange: [-2.92, -2.88], lonRange: [-79.02, -78.98] },
    { provincia: "Manabí", ciudad: "Manta", latRange: [-1.06, -0.98], lonRange: [-80.75, -80.65] },
    { provincia: "El Oro", ciudad: "Machala", latRange: [-3.28, -3.24], lonRange: [-79.97, -79.93] },
    { provincia: "Loja", ciudad: "Loja", latRange: [-4.02, -3.98], lonRange: [-79.22, -79.18] },
    { provincia: "Tungurahua", ciudad: "Ambato", latRange: [-1.28, -1.22], lonRange: [-78.65, -78.59] },
    { provincia: "Imbabura", ciudad: "Ibarra", latRange: [0.35, 0.39], lonRange: [-78.15, -78.11] },
    { provincia: "Cotopaxi", ciudad: "Latacunga", latRange: [-0.95, -0.91], lonRange: [-78.62, -78.58] },
    { provincia: "Chimborazo", ciudad: "Riobamba", latRange: [-1.68, -1.64], lonRange: [-78.67, -78.63] },
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

  // Si no encuentra coincidencia exacta, determinar por aproximación
  if (latNum > 0) return "Región Norte";
  if (latNum < -2) return "Región Sur";
  if (lonNum < -80) return "Región Costa";
  return "Región Sierra";
};

// Función para formatear fecha de manera legible
const formatFechaLegible = (fechaString) => {
  if (!fechaString) return 'Fecha no disponible';

  const fecha = new Date(fechaString);
  const ahora = new Date();
  const diferenciaMs = ahora - fecha;
  const diferenciaDias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));

  // Si es hoy
  if (diferenciaDias === 0) {
    const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
    if (diferenciaHoras < 1) {
      const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
      if (diferenciaMinutos < 1) return 'Hace unos momentos';
      return `Hace ${diferenciaMinutos} min${diferenciaMinutos !== 1 ? 's' : ''}`;
    }
    return `Hace ${diferenciaHoras} hora${diferenciaHoras !== 1 ? 's' : ''}`;
  }

  // Si es ayer
  if (diferenciaDias === 1) {
    return `Ayer ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Si es esta semana
  if (diferenciaDias < 7) {
    return `${fecha.toLocaleDateString('es-EC', { weekday: 'long' })} ${fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Formato normal
  return fecha.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function DeteccionList() {
  const [detecciones, setDetecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const [usingCamera, setUsingCamera] = useState(false);
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  const aiSectionRef = useRef(null);

  useEffect(() => {
    loadDetecciones();
  }, []);

  const loadDetecciones = () => {
    setLoading(true);
    api.get("/detecciones/")
      .then(res => setDetecciones(res.data))
      .catch(err => console.error("Error cargando detecciones:", err))
      .finally(() => setLoading(false));
  };

  const handleOpenCamera = () => {
    setUsingCamera(true);
    setCapturedImage(null);
  };

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setUsingCamera(false);
      setShowAIProcessor(true);

      setTimeout(() => {
        aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleCloseCamera = () => {
    setUsingCamera(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        setShowAIProcessor(true);
        setUsingCamera(false);

        setTimeout(() => {
          aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleResetImage = () => {
    setCapturedImage(null);
    setShowAIProcessor(false);
    setUsingCamera(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      default: return clasificacion || 'No clasificado';
    }
  };

  const getClasificacionIcon = (clasificacion) => {
    switch (clasificacion?.toLowerCase()) {
      case 'organico': return '🌱';
      case 'inorganico': return '🏭';
      case 'reciclable': return '♻️';
      default: return '📦';
    }
  };

  // Calcular estadísticas
  const stats = {
    total: detecciones.length,
    organico: detecciones.filter(d => d.clasificacion?.toLowerCase() === 'organico').length,
    inorganico: detecciones.filter(d => d.clasificacion?.toLowerCase() === 'inorganico').length,
    reciclable: detecciones.filter(d => d.clasificacion?.toLowerCase() === 'reciclable').length,
    altaConfianza: detecciones.filter(d => parseFloat(d.confianza_ia || 0) >= 80).length,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando detecciones...</p>
      </div>
    );
  }

  return (
    <div className="detecciones-container">
      {/* Header IA */}
      <div className="ia-header">
        <div className="ia-header-content">
          <div className="ia-badge">
            <Brain size={20} />
            <span>Sistema de Clasificación IA</span>
          </div>
          <h1 className="ia-title">Análisis Inteligente de Residuos</h1>

        </div>
      </div>

      {/* Sección de Análisis con IA */}
      <div className="ia-analysis-section">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Scan size={24} color="#10b981" />
          Análisis con IA
        </h3>

        {/* Área de Preview */}
        <div className="ia-preview-container">
          {usingCamera ? (
            <div className="ia-webcam-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="ia-webcam-controls">
                <button className="ia-capture-btn" onClick={handleCapture}>
                  <Camera size={24} color="#10b981" />
                </button>
                <button className="ia-btn ia-btn-danger" onClick={handleCloseCamera}>
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <>
              <img src={capturedImage} alt="Preview" className="ia-preview-image" />
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: 'rgba(16, 185, 129, 0.95)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}>
                <Scan size={16} />
                <span>Imagen lista para análisis</span>
              </div>
            </>
          ) : (
            <div className="ia-preview-empty">
              <div className="ia-preview-icon">
                <Camera size={40} color="rgba(16, 185, 129, 0.7)" />
              </div>
              <h3 className="ia-preview-text">
                Captura una foto o sube una imagen para analizar con IA
              </h3>
              <div className="ia-preview-hint">
                <Scan size={16} />
                <span>La IA detectará y clasificará automáticamente</span>
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="ia-controls">
          {!usingCamera && (
            <>
              <button onClick={handleOpenCamera} className="ia-btn ia-btn-primary">
                <Camera size={18} />
                {capturedImage ? 'Tomar Otra Foto' : 'Abrir Cámara'}
              </button>

              <button onClick={handleOpenFileSelector} className="ia-btn ia-btn-secondary">
                <Upload size={18} />
                {capturedImage ? 'Subir Otra Imagen' : 'Subir Imagen'}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              {capturedImage && (
                <button onClick={handleResetImage} className="ia-btn ia-btn-danger">
                  <X size={18} />
                  Eliminar Imagen
                </button>
              )}
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="ia-info-box">
          <Scan size={20} />
          <span>
            {capturedImage
              ? "Imagen cargada correctamente. Desplázate hacia abajo para ver el análisis."
              : usingCamera
              ? "Enfoca el residuo en el centro de la pantalla y haz clic en el botón para capturar"
              : "Utiliza cámara en vivo o sube una imagen existente para clasificar residuos automáticamente."
            }
          </span>
        </div>

        {/* Procesador IA */}
        {showAIProcessor && capturedImage && (
          <div ref={aiSectionRef} style={{ marginTop: '2rem' }}>
            <AIProcessor capturedImage={capturedImage} onNewDetection={loadDetecciones} />
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="stats-grid-sm" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-item">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Detecciones</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.altaConfianza}</div>
          <div className="stat-label">Alta Confianza</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.organico}</div>
          <div className="stat-label">Orgánico</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.inorganico}</div>
          <div className="stat-label">Inorgánico</div>
        </div>
      </div>

      {/* Historial de Detecciones */}
      <div className="detecciones-history">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={20} />
            Historial de Detecciones

          </h3>
        </div>

        {detecciones.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
            <Brain size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#4b5563' }}>No hay detecciones registradas</h4>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              Comienza creando una nueva detección con IA en la sección superior
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Clasificación</th>
                  <th>Tacho</th>
                  <th>Ubicación</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {detecciones.slice().reverse().map((det) => {
                  const ubicacion = getUbicacionFromCoords(det.ubicacion_lat, det.ubicacion_lon);
                  const fechaRegistro = formatFechaLegible(det.fecha_registro || det.created_at);

                  return (
                    <tr key={det.id}>
                      <td style={{ fontWeight: '500', color: '#1f2937' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Brain size={14} color="#0ea5e9" />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{det.nombre}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                              Conf: <span style={{
                                fontWeight: '600',
                                color: parseFloat(det.confianza_ia || 0) >= 80 ? '#10b981' :
                                      parseFloat(det.confianza_ia || 0) >= 60 ? '#f59e0b' : '#ef4444'
                              }}>
                                {det.confianza_ia || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1rem' }}>
                            {getClasificacionIcon(det.clasificacion)}
                          </span>
                          <span className={`clasification-badge ${getClasificacionBadgeClass(det.clasificacion)}`}>
                            {getClasificacionText(det.clasificacion)}
                          </span>
                        </div>
                      </td>
                      <td>
                        {det.tacho_nombre ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                            <Trash2 size={14} color="#10b981" />
                            <span style={{ fontWeight: '500' }}>{det.tacho_nombre}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
                            Sin tacho asignado
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <MapPin size={12} color="#ef4444" />
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{ubicacion}</div>
                            <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace', marginTop: '2px' }}>
                              {det.ubicacion_lat ? Number(det.ubicacion_lat).toFixed(4) : '—'}, {det.ubicacion_lon ? Number(det.ubicacion_lon).toFixed(4) : '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Clock size={12} color="#6b7280" />
                          <div style={{ fontSize: '0.875rem', color: '#4b5563', fontWeight: '500' }}>
                            {fechaRegistro}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Link
                            to={`/detecciones/${det.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#e0f2fe',
                              color: '#0369a1',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textDecoration: 'none',
                              transition: 'all 0.2s',
                              border: '1px solid #bae6fd'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#bae6fd';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#e0f2fe';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <ImageIcon size={12} />
                            Detalle
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}