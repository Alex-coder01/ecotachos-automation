// src/pages/Usuarios/UsuarioList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Search, Edit, Trash2, Mail, Shield, CheckCircle } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState("");
  const [filterEstado, setFilterEstado] = useState("activos"); // Nuevo filtro

  const loadUsuarios = async () => {
    try {
      const res = await api.get("/usuarios/");
      setUsuarios(res.data.results || res.data);
    } catch (e) {
      console.error("Error cargando usuarios", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea desactivar este usuario?")) return;

    try {
      // Borrado lógico: actualiza el estado a inactivo
      await api.patch(`/usuarios/${id}/`, { is_active: false });
      // Actualiza el estado local
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: false } : u))
      );
    } catch (e) {
      alert("No se pudo desactivar el usuario");
      console.error(e);
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm("¿Está seguro que desea reactivar este usuario?")) return;

    try {
      // Reactiva el usuario
      await api.patch(`/usuarios/${id}/`, { is_active: true });
      // Actualiza el estado local
      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_active: true } : u))
      );
    } catch (e) {
      alert("No se pudo reactivar el usuario");
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRol = filterRol === "" || usuario.rol === filterRol;
    const matchesEstado = 
      filterEstado === "todos" ||
      (filterEstado === "activos" && usuario.is_active !== false) ||
      (filterEstado === "inactivos" && usuario.is_active === false);
    return matchesSearch && matchesRol && matchesEstado;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Users className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            Gestión de Usuarios
          </h2>
          <p className="page-header-subtitle">
            Administre los usuarios del sistema y sus permisos
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/usuarios/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Nuevo Usuario
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
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-select filter-select"
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
        </select>
        <select
          className="form-select filter-select"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
        >
          <option value="activos">Solo Activos</option>
          <option value="inactivos">Solo Inactivos</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {/* Data Table */}
      {filteredUsuarios.length === 0 ? (
        <div className="empty-state">
          <Users className="empty-state-icon" size={64} />
          <h3>No se encontraron usuarios</h3>
          <p>Intente ajustar los filtros de búsqueda o agregue un nuevo usuario</p>
          <Link to="/usuarios/nuevo" className="btn btn-primary">
            <Plus className="icon-md" />
            Crear Primer Usuario
          </Link>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((u) => (
                <tr key={u.id}>
                  <td className="table-id">#{u.id}</td>
                  <td className="table-primary">{u.nombre}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Mail className="icon-sm" style={{ color: "var(--color-gray)" }} />
                      <span className="table-secondary">{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-badge-cell">
                      {u.rol === "admin" ? (
                        <span className="badge badge-primary">
                          <Shield className="icon-sm" />
                          Administrador
                        </span>
                      ) : (
                        <span className="badge badge-info">
                          <Users className="icon-sm" />
                          Usuario
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {u.is_active !== false ? (
                      <span className="status-badge status-active">
                        <span className="status-indicator"></span>
                        Activo
                      </span>
                    ) : (
                      <span className="status-badge status-inactive">
                        <span className="status-indicator"></span>
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/usuarios/editar/${u.id}`}
                        className="btn-icon btn-edit"
                        title="Editar usuario"
                      >
                        <Edit className="icon-md" />
                      </Link>
                      {u.is_active !== false ? (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="btn-icon btn-delete"
                          title="Desactivar usuario"
                        >
                          <Trash2 className="icon-md" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(u.id)}
                          className="btn-icon btn-success"
                          title="Reactivar usuario"
                          style={{ backgroundColor: "#10b981", color: "white" }}
                        >
                          <CheckCircle className="icon-md" />
                        </button>
                      )}
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
          <Shield className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Gestión de Permisos</h4>
          <p>
            Los administradores tienen acceso completo al sistema. Los usuarios
            regulares solo pueden visualizar datos sin capacidad de edición.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsuarioList;