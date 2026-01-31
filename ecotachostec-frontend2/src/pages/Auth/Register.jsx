// src/pages/Auth/Register.jsx
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { register } from "../../api/authApi";

import {
  getProvincias,
  getCiudades,
  getCantones,
} from "../../api/ubicacionApi";

import {
  validarCampo,
  sanitizarEntrada,
} from "../../utils/validations";

import "./auth.css";

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    provincia: "",
    ciudad: "",
    canton: "",
    password: "",
    confirmPassword: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cantones, setCantones] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [erroresCampos, setErroresCampos] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadProvincias();
  }, []);

  const loadProvincias = async () => {
    try {
      const res = await getProvincias();
      setProvincias(res.data);
    } catch (err) {
      console.error("Error cargando provincias", err);
    }
  };

  const handleProvinciaChange = async (e) => {
    const provinciaId = e.target.value;

    setFormData({
      ...formData,
      provincia: provinciaId,
      ciudad: "",
      canton: "",
    });

    try {
      const resCiudades = await getCiudades();
      const filtradas = resCiudades.data.filter(
        (c) => c.provincia === Number(provinciaId)
      );
      setCiudades(filtradas);
      setCantones([]);
    } catch (err) {
      console.error("Error cargando ciudades", err);
    }
  };

  const handleCiudadChange = async (e) => {
    const ciudadId = e.target.value;

    setFormData({
      ...formData,
      ciudad: ciudadId,
      canton: "",
    });

    try {
      const resCantones = await getCantones();
      const filtradas = resCantones.data.filter(
        (c) => c.ciudad === Number(ciudadId)
      );
      setCantones(filtradas);
    } catch (err) {
      console.error("Error cargando cantones", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let valorSanitizado = sanitizarEntrada(value);
    
    // Aplicar restricciones por campo
    if (name === 'nombre') {
      valorSanitizado = valorSanitizado.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'telefono') {
      valorSanitizado = valorSanitizado.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (name === 'email') {
      valorSanitizado = valorSanitizado.toLowerCase().trim();
    }

    setFormData({
      ...formData,
      [name]: valorSanitizado,
    });
    
    // Validar campo individual
    validarCampoIndividual(name, valorSanitizado);
    setError("");
  };

  const validarCampoIndividual = (nombreCampo, valor) => {
    const nuevosErrores = { ...erroresCampos };
    
    if (nombreCampo === 'nombre') {
      const resultado = validarCampo(valor, 'nombre', { requerido: true, minimo: 2, maximo: 100 });
      if (resultado.valido) {
        delete nuevosErrores.nombre;
      } else {
        nuevosErrores.nombre = resultado.error;
      }
    } else if (nombreCampo === 'email') {
      const resultado = validarCampo(valor, 'email', { requerido: true });
      if (resultado.valido) {
        delete nuevosErrores.email;
      } else {
        nuevosErrores.email = resultado.error;
      }
    } else if (nombreCampo === 'telefono') {
      const resultado = validarCampo(valor, 'telefono', { requerido: true });
      if (resultado.valido) {
        delete nuevosErrores.telefono;
      } else {
        nuevosErrores.telefono = resultado.error;
      }
    } else if (nombreCampo === 'password' && valor) {
      const resultado = validarCampo(valor, 'contrasena');
      if (resultado.valido) {
        delete nuevosErrores.password;
      } else {
        nuevosErrores.password = resultado.error;
      }
    }
    
    setErroresCampos(nuevosErrores);
  };

  // Validaciones
  const validateForm = () => {
    const nuevosErrores = {};
    let valido = true;

    // Validar nombre
    const validNombre = validarCampo(formData.nombre, 'nombre', { requerido: true, minimo: 2, maximo: 100 });
    if (!validNombre.valido) {
      nuevosErrores.nombre = validNombre.error;
      valido = false;
    }

    // Validar email
    const validEmail = validarCampo(formData.email, 'email', { requerido: true });
    if (!validEmail.valido) {
      nuevosErrores.email = validEmail.error;
      valido = false;
    }

    // Validar teléfono
    const validTelefono = validarCampo(formData.telefono, 'telefono', { requerido: true });
    if (!validTelefono.valido) {
      nuevosErrores.telefono = validTelefono.error;
      valido = false;
    }

    // Validar ubicación
    if (!formData.canton) {
      setError("Selecciona tu provincia, ciudad y cantón");
      valido = false;
    }

    // Validar contraseña
    const validPassword = validarCampo(formData.password, 'contrasena', { requerido: true });
    if (!validPassword.valido) {
      nuevosErrores.password = validPassword.error;
      valido = false;
    }

    // Validar confirmación de contraseña
    if (formData.password && formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
      valido = false;
    }

    setErroresCampos(nuevosErrores);
    return valido;
  };

  // SUBMIT (Aquí agregamos el rol = "user")
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const { confirmPassword, ...dataToSend } = formData;

      // 👇 AGREGAMOS EL ROL AUTOMÁTICAMENTE
      dataToSend.rol = "user";

      const response = await register(dataToSend);
      const { token, user } = response.data;

      loginUser(user, token);
      navigate("/portal");
    } catch (err) {
      console.error("Error registrando usuario:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          "Error al crear la cuenta. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-circle auth-circle-1"></div>
        <div className="auth-circle auth-circle-2"></div>
        <div className="auth-circle auth-circle-3"></div>
      </div>

      <div className="auth-container">
        <Link to="/home" className="auth-back-link">
          ← Volver al inicio
        </Link>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-logo">
              <div className="auth-logo-icon">🌿</div>
              <h1 className="auth-logo-title">EcoTachosTec</h1>
            </div>
            <h2 className="auth-title">Crear Cuenta</h2>
            <p className="auth-subtitle">
              Únete a la revolución de gestión inteligente de residuos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert alert-error">⚠️ {error}</div>}

            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`form-input ${erroresCampos.nombre ? 'input-error' : ''}`}
                required
              />
              {erroresCampos.nombre && (
                <span className="input-error-msg">{erroresCampos.nombre}</span>
              )}
            </div>

            {/* Teléfono */}
            <div className="form-group">
              <label className="form-label">Teléfono (10 dígitos)</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`form-input ${erroresCampos.telefono ? 'input-error' : ''}`}
                maxLength="10"
                placeholder="0912345678"
                required
              />
              {erroresCampos.telefono && (
                <span className="input-error-msg">{erroresCampos.telefono}</span>
              )}
              {formData.telefono && !erroresCampos.telefono && (
                <span style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '4px' }}>✓ Válido</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${erroresCampos.email ? 'input-error' : ''}`}
                required
              />
              {erroresCampos.email && (
                <span className="input-error-msg">{erroresCampos.email}</span>
              )}
            </div>

            {/* Provincia */}
            <div className="form-group">
              <label className="form-label">Provincia</label>
              <select
                name="provincia"
                value={formData.provincia}
                onChange={handleProvinciaChange}
                className="form-input"
                required
              >
                <option value="">Selecciona provincia</option>
                {provincias.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Ciudad */}
            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleCiudadChange}
                className="form-input"
                required
              >
                <option value="">Selecciona ciudad</option>
                {ciudades.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantón */}
            <div className="form-group">
              <label className="form-label">Cantón</label>
              <select
                name="canton"
                value={formData.canton}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">Selecciona cantón</option>
                {cantones.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${erroresCampos.password ? 'input-error' : ''}`}
                  placeholder="Min. 8 caracteres, mayúscula, minúscula y número"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {erroresCampos.password && (
                <span className="input-error-msg">{erroresCampos.password}</span>
              )}
              {formData.password && !erroresCampos.password && (
                <span style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '4px' }}>✓ Contraseña fuerte</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${erroresCampos.confirmPassword ? 'input-error' : ''}`}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {erroresCampos.confirmPassword && (
                <span className="input-error-msg">{erroresCampos.confirmPassword}</span>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && !erroresCampos.confirmPassword && (
                <span style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '4px' }}>✓ Coinciden</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <div className="auth-footer">
            <p className="auth-footer-text">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="auth-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
