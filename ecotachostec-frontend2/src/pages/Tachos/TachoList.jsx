import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2, Plus, Search, Edit, Eye, MapPin, Layers,
  Battery, Activity, AlertCircle, Clock, Check, XCircle
} from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const TachoList = () => {
  const [tachos, setTachos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTachoId, setSelectedTachoId] = useState(null);
  const [selectedTachoData, setSelectedTachoData] = useState(null);

  // Función para obtener ubicación aproximada desde coordenadas
  const getUbicacionFromCoords = (lat, lon) => {
    if (!lat || !lon) return "Ubicación desconocida";

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

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

    for (const location of locations) {
      if (
        latNum >= location.latRange[0] && latNum <= location.latRange[1] &&
        lonNum >= location.lonRange[0] && lonNum <= location.lonRange[1]
      ) {
        return `${location.ciudad}`;
      }
    }

    // Si no encuentra coincidencia exacta
    if (latNum > 0) return "Norte";
    if (latNum < -2) return "Sur";
    if (lonNum < -80) return "Costa";
    return "Sierra";
  };

  const loadTachos = async () => {
    try {
      const res = await api.get("/tachos/");
      // Filtrar solo tachos activos (activo = true)
      const tachosActivos = res.data.filter(tacho => tacho.activo === true);
      setTachos(tachosActivos);
    } catch (e) {
      console.error("Error cargando tachos", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar este tacho?")) return;

    try {
      // Enviar solicitud para marcar como inactivo
      await api.patch(`/tachos/${id}/`, { activo: false });

      // Actualizar lista local
      setTachos(prev => prev.filter((t) => t.id !== id));

      // Mostrar mensaje de éxito
      alert("Tacho eliminado correctamente");
    } catch (e) {
      console.error("Error eliminando tacho", e);
      alert("No se pudo eliminar el tacho. Intente nuevamente.");
    }
  };

  useEffect(() => {
    loadTachos();
  }, []);

  // Función para obtener el color del nivel de llenado
  const getNivelColor = (nivel) => {
    const nivelValue = nivel || 0;
    if (nivelValue >= 80) return '#ef4444';
    if (nivelValue >= 50) return '#f59e0b';
    return '#10b981';
  };

  // Función para formatear fecha corta
  const formatFechaCorta = (fechaString) => {
    if (!fechaString) return 'N/D';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const filteredTachos = tachos.filter((tacho) =>
    tacho.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.empresa_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tacho.estado?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas mejoradas
  const stats = {
    total: tachos.length,
    activos: tachos.filter(t => t.estado === 'activo').length,
    mantenimiento: tachos.filter(t => t.estado === 'mantenimiento').length,
    altaCarga: tachos.filter(t => (t.nivel_llenado || 0) >= 80).length,
    publicos: tachos.filter(t => t.tipo === 'publico').length,
    personales: tachos.filter(t => t.tipo === 'personal').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando tachos...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Trash2 className="icon-lg" />
            Gestión de Tachos Inteligentes
          </h2>
          <p className="page-header-subtitle">
            Administre los contenedores IoT y monitoree su estado
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/tachos/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Nuevo Tacho
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon icon-md" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por código, nombre o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ fontSize: "0.875rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Check className="icon-sm" style={{ color: "#10b981" }} />
          Mostrando {tachos.length} tachos activos
        </div>
      </div>

      {/* Stats Summary - COMPACTO */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Activos</p>
          </div>
          <div className="stat-icon">
            <Trash2 className="icon-lg" />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.activos}</h3>
            <p>En Operación</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <Check className="icon-lg" style={{ color: '#10b981' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.mantenimiento}</h3>
            <p>Mantenimiento</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <AlertCircle className="icon-lg" style={{ color: '#f59e0b' }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.altaCarga}</h3>
            <p>Alta Carga</p>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <Battery className="icon-lg" style={{ color: '#ef4444' }} />
          </div>
        </div>
      </div>

      {/* Tipo de Tachos */}
      <div style={{
        display: "flex",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          borderRadius: "8px",
          fontSize: "0.875rem"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#10b981"
          }}></div>
          <span style={{ fontWeight: "500", color: "#065f46" }}>
            Públicos: {stats.publicos}
          </span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "8px",
          fontSize: "0.875rem"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#3b82f6"
          }}></div>
          <span style={{ fontWeight: "500", color: "#1e40af" }}>
            Personales: {stats.personales}
          </span>
        </div>
      </div>

      {/* Data Table - TABLA MÁS COMPACTA */}
      {filteredTachos.length === 0 ? (
        <div className="empty-state">
          <Trash2 className="empty-state-icon" size={64} />
          <h3>No se encontraron tachos activos</h3>
          <p>{searchTerm ? "Intente ajustar la búsqueda" : "Agregue un nuevo tacho inteligente"}</p>
          <Link to="/tachos/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Crear Nuevo Tacho
          </Link>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table" style={{ minWidth: "800px" }}>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>Código</th>
                <th style={{ minWidth: "180px" }}>Nombre / Empresa</th>
                <th style={{ width: "100px" }}>Estado</th>
                <th style={{ width: "120px" }}>Nivel</th>
                <th style={{ width: "140px" }}>Ubicación</th>
                <th style={{ width: "100px" }}>Tipo</th>
                <th style={{ width: "100px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTachos.map((t) => {
                // Obtener ubicación aproximada
                const ubicacionAprox = getUbicacionFromCoords(t.ubicacion_lat, t.ubicacion_lon);

                // Obtener clase de estado
                const estadoClass = t.estado === 'activo' ? 'status-active' :
                                  t.estado === 'mantenimiento' ? 'status-warning' :
                                  'status-inactive';

                // Texto de estado
                const estadoText = t.estado === 'activo' ? 'Activo' :
                                 t.estado === 'mantenimiento' ? 'Mantenimiento' :
                                 'Fuera Servicio';

                return (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Layers className="icon-sm" style={{ color: "#10b981" }} />
                        <span style={{
                          fontWeight: "700",
                          fontSize: "0.875rem",
                          color: "#1f2937"
                        }}>
                          {t.codigo || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="table-primary" style={{ fontWeight: "600", marginBottom: "4px" }}>
                          {t.nombre || 'Sin nombre'}
                        </div>
                        {t.empresa_nombre && (
                          <div style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <BuildingIcon />
                            {t.empresa_nombre}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${estadoClass}`}>
                        <span className="status-indicator"></span>
                        {estadoText}
                      </span>
                    </td>
                    <td>
                      <div className="nivel-container-small">
                        <div className="nivel-bar-small">
                          <div
                            className="nivel-fill-small"
                            style={{
                              width: `${t.nivel_llenado || 0}%`,
                              backgroundColor: getNivelColor(t.nivel_llenado)
                            }}
                          >
                            <span className="nivel-text-small">
                              {t.nivel_llenado || 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin className="icon-sm" style={{ color: "#ef4444", flexShrink: 0 }} />
                        <div>
                          <div style={{
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#1f2937"
                          }}>
                            {ubicacionAprox}
                          </div>
                          <div style={{
                            fontSize: "0.7rem",
                            color: "#9ca3af",
                            fontFamily: "monospace",
                            marginTop: "2px"
                          }}>
                            {t.ubicacion_lat ? Number(t.ubicacion_lat).toFixed(4) : '0.0000'},
                            {t.ubicacion_lon ? Number(t.ubicacion_lon).toFixed(4) : '0.0000'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        backgroundColor: t.tipo === "personal" ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
                        color: t.tipo === "personal" ? "#1e40af" : "#065f46",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        textTransform: "uppercase"
                      }}>
                        {t.tipo === "personal" ? "Personal" : "Público"}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => {
                            setSelectedTachoId(t.id);
                            setSelectedTachoData(t);
                          }}
                          className="btn-icon btn-view"
                          title="Ver detalles"
                        >
                          <Eye className="icon-md" />
                        </button>
                        <Link
                          to={`/tachos/editar/${t.id}`}
                          className="btn-icon btn-edit"
                          title="Editar tacho"
                        >
                          <Edit className="icon-md" />
                        </Link>
                        <button
                          onClick={() => handleSoftDelete(t.id)}
                          className="btn-icon btn-delete"
                          title="Eliminar tacho (borrado lógico)"
                        >
                          <Trash2 className="icon-md" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card sobre eliminación lógica */}
      <div className="info-card" style={{ marginTop: "1.5rem" }}>
        <div className="info-card-icon">
          <Trash2 className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Eliminación Lógica</h4>
          <p>
            Los tachos eliminados se marcan como inactivos pero no se borran permanentemente.
            Esto permite mantener el historial y reactivarlos si es necesario.
          </p>
        </div>
      </div>

      {/* MODAL DE DETALLES */}
      {selectedTachoId && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
          }}>
            {/* Header del Modal */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "24px",
              borderBottom: "1px solid #e5e7eb",
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              zIndex: 1001
            }}>
              <div>
                <h2 style={{ margin: 0, color: "#1f2937", display: "flex", alignItems: "center", gap: "12px" }}>
                  <Trash2 style={{ color: "#10b981" }} size={28} />
                  Detalles del Tacho
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedTachoId(null);
                  setSelectedTachoData(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "0",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div style={{ padding: "24px" }}>
              {selectedTachoData && (
                <div>
                  {/* Información Principal */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                    marginBottom: "24px"
                  }}>
                    <div style={{
                      padding: "16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      borderLeft: "4px solid #10b981"
                    }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#6b7280" }}>Código</p>
                      <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>
                        {selectedTachoData.codigo || "N/A"}
                      </p>
                    </div>
                    <div style={{
                      padding: "16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      borderLeft: "4px solid #3b82f6"
                    }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#6b7280" }}>Nombre</p>
                      <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>
                        {selectedTachoData.nombre || "Sin nombre"}
                      </p>
                    </div>
                    <div style={{
                      padding: "16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      borderLeft: "4px solid #f59e0b"
                    }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#6b7280" }}>Estado</p>
                      <p style={{
                        margin: 0,
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: selectedTachoData.estado === "activo" ? "#10b981" : "#f59e0b"
                      }}>
                        {selectedTachoData.estado === "activo" ? "Activo" : 
                         selectedTachoData.estado === "mantenimiento" ? "Mantenimiento" : "Fuera de Servicio"}
                      </p>
                    </div>
                    <div style={{
                      padding: "16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      borderLeft: "4px solid #ef4444"
                    }}>
                      <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#6b7280" }}>Nivel de Llenado</p>
                      <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600", color: "#1f2937" }}>
                        {selectedTachoData.nivel_llenado || 0}%
                      </p>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div style={{
                    padding: "16px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "24px"
                  }}>
                    <h4 style={{ margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin size={20} style={{ color: "#ef4444" }} />
                      Ubicación
                    </h4>
                    <p style={{ margin: "0 0 8px 0", fontSize: "0.875rem", color: "#6b7280" }}>
                      Coordenadas:
                    </p>
                    <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.9rem", color: "#1f2937" }}>
                      {selectedTachoData.ubicacion_lat}, {selectedTachoData.ubicacion_lon}
                    </p>
                  </div>

                  {/* Descripción */}
                  {selectedTachoData.descripcion && (
                    <div style={{
                      padding: "16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      marginBottom: "24px"
                    }}>
                      <h4 style={{ margin: "0 0 12px 0" }}>Descripción</h4>
                      <p style={{ margin: 0, color: "#374151", lineHeight: "1.6" }}>
                        {selectedTachoData.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "flex-end",
                    marginTop: "24px"
                  }}>
                    <button
                      onClick={() => {
                        setSelectedTachoId(null);
                        setSelectedTachoData(null);
                      }}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#f3f4f6",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "500",
                        color: "#374151"
                      }}
                    >
                      Cerrar
                    </button>
                    <Link
                      to={`/tachos/editar/${selectedTachoData.id}`}
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "500",
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >
                      <Edit size={16} />
                      Editar
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para icono de edificio
const BuildingIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
  </svg>
);

export default TachoList;