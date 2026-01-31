// src/pages/Auth/Profile.jsx
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getProvincias,
  getCiudades,
  getCantones
} from "../../api/ubicacionApi";
import "./profile.css";

export default function Profile() {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [ubicacionCompleta, setUbicacionCompleta] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.canton) {
      cargarUbicacion();
    }
  }, [user]);

  const cargarUbicacion = async () => {
    try {
      // Obtener todos los datos
      const [resProvincias, resCiudades, resCantones] = await Promise.all([
        getProvincias(),
        getCiudades(),
        getCantones()
      ]);

      // Encontrar el cantón del usuario
      const canton = resCantones.data.find(c => c.id === user.canton);

      if (canton) {
        // Encontrar la ciudad
        const ciudad = resCiudades.data.find(c => c.id === canton.ciudad);

        if (ciudad) {
          // Encontrar la provincia
          const provincia = resProvincias.data.find(p => p.id === ciudad.provincia);

          if (provincia) {
            setUbicacionCompleta(
              `${canton.nombre}, ${ciudad.nombre}, ${provincia.nombre}`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error cargando ubicación:", error);
      setUbicacionCompleta("No disponible");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/home");
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-card">
            <h2 className="profile-title">Cargando perfil...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-background">
        <div className="profile-circle profile-circle-1"></div>
        <div className="profile-circle profile-circle-2"></div>
        <div className="profile-circle profile-circle-3"></div>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          {/* HEADER */}
          <div className="profile-header">
            <div className="profile-logo">
              <div className="profile-logo-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h1 className="profile-logo-title">Mi Perfil</h1>
            </div>
            <h2 className="profile-name">{user.nombre}</h2>
            <p className="profile-role">{user.rol === "admin" ? "Administrador" : "Usuario"}</p>
          </div>

          {/* INFORMACIÓN */}
          <div className="profile-content">
            {/* Columna 1 */}
            <div className="profile-section">
              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="field-content">
                  <label className="field-label">Nombre Completo</label>
                  <p className="field-value">{user.nombre}</p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="field-content">
                  <label className="field-label">Correo Electrónico</label>
                  <p className="field-value">{user.email}</p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="field-content">
                  <label className="field-label">Teléfono</label>
                  <p className="field-value">{user.telefono}</p>
                </div>
              </div>
            </div>

            {/* Columna 2 */}
            <div className="profile-section">
              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="field-content">
                  <label className="field-label">Ubicación</label>
                  {loading ? (
                    <p className="field-value">Cargando...</p>
                  ) : (
                    <p className="field-value">{ubicacionCompleta}</p>
                  )}
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div className="field-content">
                  <label className="field-label">Fecha de Registro</label>
                  <p className="field-value">
                    {new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="profile-field">
                <div className="field-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="field-content">
                  <label className="field-label">Rol</label>
                  <p className="field-value">
                    {user.rol === "admin" ? "Administrador" : "Usuario"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="profile-actions">
            <button
              onClick={() => navigate(user.rol === "admin" ? "/" : "/portal")}
              className="btn btn-secondary btn-with-icon"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Volver al {user.rol === "admin" ? "Dashboard" : "Portal"}
            </button>

            <button
              onClick={handleLogout}
              className="btn btn-logout btn-with-icon"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </button>
          </div>

          <div className="profile-footer">
            <p className="profile-footer-text">
              Si deseas actualizar tus datos, comunícate con soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}