// src/pages/Ubicaciones/UbicacionList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Plus, Search, Edit, Building, Map } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const UbicacionList = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadUbicaciones = async () => {
    try {
      const provinciasRes = await api.get("/ubicacion/provincias/");
      const ciudadesRes = await api.get("/ubicacion/ciudades/");
      const cantonesRes = await api.get("/ubicacion/cantones/");

      const provincias = provinciasRes.data;
      const ciudades = ciudadesRes.data;
      const cantones = cantonesRes.data;

      const comb = cantones.map((c) => {
        const ciudad = ciudades.find((ci) => ci.id === c.ciudad);
        const provincia = provincias.find((p) => p.id === ciudad?.provincia);

        return {
          id: c.id,
          provincia_nombre: provincia?.nombre || "—",
          ciudad_nombre: ciudad?.nombre || "—",
          canton_nombre: c.nombre,
        };
      });

      comb.sort((a, b) => {
        if (a.provincia_nombre !== b.provincia_nombre) {
          return a.provincia_nombre.localeCompare(b.provincia_nombre);
        }
        if (a.ciudad_nombre !== b.ciudad_nombre) {
          return a.ciudad_nombre.localeCompare(b.ciudad_nombre);
        }
        return a.canton_nombre.localeCompare(b.canton_nombre);
      });

      setUbicaciones(comb);
    } catch (e) {
      console.error("Error cargando ubicaciones", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUbicaciones();
  }, []);

  const filteredUbicaciones = ubicaciones.filter((ub) =>
    ub.provincia_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ub.ciudad_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ub.canton_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando ubicaciones...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <MapPin className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Gestión de Ubicaciones
          </h2>
          <p className="page-header-subtitle">
            Administre provincias, ciudades y cantones del sistema
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/ubicaciones/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Nueva Ubicación
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
            placeholder="Buscar por provincia, ciudad o cantón..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      {filteredUbicaciones.length === 0 ? (
        <div className="empty-state">
          <MapPin className="empty-state-icon" size={64} />
          <h3>No se encontraron ubicaciones</h3>
          <p>Intente ajustar la búsqueda o agregue una nueva ubicación</p>
          <Link to="/ubicaciones/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Crear Primera Ubicación
          </Link>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Provincia</th>
                <th>Ciudad</th>
                <th>Cantón</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUbicaciones.map((u) => (
                <tr key={u.id}>
                  <td className="table-id">#{u.id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Map className="icon-sm" style={{ color: "var(--color-primary)" }} />
                      <span className="table-primary">{u.provincia_nombre}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Building className="icon-sm" style={{ color: "var(--color-info)" }} />
                      <span className="table-secondary">{u.ciudad_nombre}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MapPin className="icon-sm" style={{ color: "var(--color-success)" }} />
                      <span className="table-secondary">{u.canton_nombre}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/ubicaciones/editar/${u.id}`}
                        className="btn-icon btn-edit"
                        title="Editar ubicación"
                      >
                        <Edit className="icon-md" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Card */}
      <div className="info-card">
        <div className="info-card-icon">
          <MapPin className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Organización Geográfica</h4>
          <p>
            Las ubicaciones están organizadas jerárquicamente: Provincia →
            Ciudad → Cantón. Esta estructura permite una gestión precisa de los
            tachos distribuidos en todo el territorio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UbicacionList;