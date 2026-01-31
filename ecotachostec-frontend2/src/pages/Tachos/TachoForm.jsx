import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Trash2, Save, X, MapPin, Layers, FileText, Tag,
  Battery, Activity, Calendar, AlertCircle, User, Building,
  Users, ChevronDown, EyeOff, Globe, CheckCircle, XCircle
} from "lucide-react";
import api from "../../api/axiosConfig";
import {
  validarCampo,
  validarCodigoTacho,
  sanitizarEntrada,
} from "../../utils/validations";
import "../adminPages.css";

// Leaflet
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const TachoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [codigoDisponible, setCodigoDisponible] = useState(null);
  const [verificandoCodigo, setVerificandoCodigo] = useState(false);
  const [tachosExistentes, setTachosExistentes] = useState([]);

  // Estado para errores de validación por campo
  const [erroresCampos, setErroresCampos] = useState({});

  // ------------------ FORM DATA -------------------------
  const [tacho, setTacho] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    ubicacion_lat: "",
    ubicacion_lon: "",
    canton: "",
    estado: "activo",
    nivel_llenado: 0, // Siempre 0
    tipo: "publico", // publico o personal
    propietario: null, // ID del usuario encargado (para ambos tipos)
    empresa_nombre: "", // Nombre de la empresa (si es tipo público)
  });

  const [cantones, setCantones] = useState([]);

  // ------------------ CARGAR USUARIOS ---------------------
  const loadUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const res = await api.get("/usuarios/");
      const usuariosData = res.data.results || res.data || [];
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // ------------------ CARGAR TACHOS EXISTENTES PARA VALIDAR CÓDIGO ---------------------
  const loadTachosExistentes = async () => {
    try {
      const res = await api.get("/tachos/");
      const tachosData = res.data.results || res.data || [];
      setTachosExistentes(tachosData);
    } catch (error) {
      console.error("Error cargando tachos existentes", error);
    }
  };

  // ------------------ VALIDAR CÓDIGO ÚNICO ---------------------
  const validarCodigoUnico = (codigo) => {
    if (!codigo.trim()) {
      setCodigoDisponible(null);
      return;
    }

    setVerificandoCodigo(true);

    // Si estamos editando, excluimos el tacho actual de la validación
    const tachosParaValidar = id
      ? tachosExistentes.filter(t => t.id !== parseInt(id))
      : tachosExistentes;

    const codigoExistente = tachosParaValidar.some(t =>
      t.codigo.toLowerCase() === codigo.toLowerCase()
    );

    setCodigoDisponible(!codigoExistente);
    setVerificandoCodigo(false);
  };

  // ------------------ ICONO ESTILIZADO ----------------
  const markerIcon = new L.DivIcon({
    html: `
      <div style="
        width: 48px;
        height: 48px;
        background: #34c759;
        border-radius: 50%;
        border: 3px solid #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.35);
        font-size: 24px;
        color: white;
      ">
        🗑️
      </div>
    `,
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 48],
  });

  // ------------------ CAPTURAR CLIC EN EL MAPA ----------
  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setTacho((prev) => ({
          ...prev,
          ubicacion_lat: e.latlng.lat.toFixed(6),
          ubicacion_lon: e.latlng.lng.toFixed(6),
        }));
      },
    });
    return null;
  };

  // ------------------ RE-CENTRAR MAPA CUANDO LAS COORDS CAMBIEN ----------
  const RecenterMap = ({ lat, lon }) => {
    const map = useMap();

    useEffect(() => {
      if (lat && lon) {
        map.setView([lat, lon], 16);
      }
    }, [lat, lon]);

    return null;
  };

  // ------------------ USAR UBICACIÓN ACTUAL SOLO EN "CREAR" ----------
  useEffect(() => {
    if (id) return; // Editando → usar coords existentes

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTacho((prev) => ({
          ...prev,
          ubicacion_lat: pos.coords.latitude.toFixed(6),
          ubicacion_lon: pos.coords.longitude.toFixed(6),
        }));
      },
      () => {
        // Fallback: Cuenca
        setTacho((prev) => ({
          ...prev,
          ubicacion_lat: "-2.90055",
          ubicacion_lon: "-79.00453",
        }));
      }
    );
  }, []);

  // ------------------ LOAD DATA EDIT --------------------------
  const loadTacho = async () => {
    try {
      const res = await api.get(`/tachos/${id}/`);
      const tachoData = res.data;

      setTacho({
        codigo: tachoData.codigo || "",
        nombre: tachoData.nombre || "",
        descripcion: tachoData.descripcion || "",
        ubicacion_lat: tachoData.ubicacion_lat || "",
        ubicacion_lon: tachoData.ubicacion_lon || "",
        canton: tachoData.canton || "",
        estado: tachoData.estado || "activo",
        nivel_llenado: 0,
        tipo: tachoData.tipo || "publico",
        propietario: tachoData.propietario || null,
        empresa_nombre: tachoData.empresa_nombre || "",
      });

      // Validar código único después de cargar
      if (tachoData.codigo) {
        validarCodigoUnico(tachoData.codigo);
      }
    } catch (e) {
      setError("No se pudo cargar el tacho");
    }
  };

  const loadCantones = async () => {
    try {
      const res = await api.get("/ubicacion/cantones/");
      setCantones(res.data);
    } catch {}
  };

  useEffect(() => {
    loadUsuarios();
    loadCantones();
    loadTachosExistentes();
    if (id) loadTacho();
  }, [id]);

  // ------------------ MANEJO DE CAMBIOS EN EL FORMULARIO ----------
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let valorSanitizado = sanitizarEntrada(value);

    // Aplicar restricciones por campo
    if (name === 'codigo') {
      // Código: letras, números, guiones, guiones bajos
      valorSanitizado = valorSanitizado.replace(/[^a-zA-Z0-9_-]/g, '');
    } else if (name === 'nombre') {
      // Nombre: solo letras y espacios
      valorSanitizado = valorSanitizado.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (name === 'descripcion') {
      // Descripción: letras, números, espacios, puntos, comas
      valorSanitizado = valorSanitizado.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,()]/g, '');
    }

    setTacho(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(valorSanitizado) : valorSanitizado
    }));

    // Validar código único en tiempo real
    if (name === "codigo") {
      validarCodigoUnico(valorSanitizado);
      validarCampoIndividual('codigo', valorSanitizado);
    } else if (name === 'nombre') {
      validarCampoIndividual('nombre', valorSanitizado);
    }

    setError("");
  };

  const validarCampoIndividual = (nombreCampo, valor) => {
    const nuevosErrores = { ...erroresCampos };
    
    if (nombreCampo === 'codigo') {
      const resultado = validarCampo(valor, 'codigo_tacho', { requerido: true, minimo: 2, maximo: 50 });
      if (resultado.valido) {
        delete nuevosErrores.codigo;
      } else {
        nuevosErrores.codigo = resultado.error;
      }
    } else if (nombreCampo === 'nombre') {
      const resultado = validarCampo(valor, 'nombre', { requerido: true, minimo: 2, maximo: 100 });
      if (resultado.valido) {
        delete nuevosErrores.nombre;
      } else {
        nuevosErrores.nombre = resultado.error;
      }
    }
    
    setErroresCampos(nuevosErrores);
  };

  const handleTipoChange = (e) => {
    const tipo = e.target.value;
    setTacho(prev => ({
      ...prev,
      tipo,
      // Limpiar empresa_nombre solo si cambia a personal
      empresa_nombre: tipo === "personal" ? "" : prev.empresa_nombre,
      // Mantener propietario para ambos tipos
      propietario: prev.propietario
    }));
  };

  const handlePropietarioChange = (e) => {
    const value = e.target.value;
    const propietarioId = value === "" ? null : parseInt(value);

    setTacho(prev => ({
      ...prev,
      propietario: propietarioId
    }));
  };

  const validateForm = () => {
    const nuevosErrores = {};
    let valido = true;

    // Validar código
    const validCodigo = validarCampo(tacho.codigo, 'codigo_tacho', { requerido: true, minimo: 2, maximo: 50 });
    if (!validCodigo.valido) {
      nuevosErrores.codigo = validCodigo.error;
      valido = false;
    }

    // Validar código único
    if (codigoDisponible === false) {
      nuevosErrores.codigo = "El código ya está en uso. Use uno diferente.";
      valido = false;
    }

    // Validar nombre
    const validNombre = validarCampo(tacho.nombre, 'nombre', { requerido: true, minimo: 2, maximo: 100 });
    if (!validNombre.valido) {
      nuevosErrores.nombre = validNombre.error;
      valido = false;
    }

    // Validar empresa_nombre si es público
    if (tacho.tipo === "publico" && !tacho.empresa_nombre.trim()) {
      nuevosErrores.empresa = "Para tachos públicos, ingrese el nombre de la empresa/institución";
      valido = false;
    }

    // Validar coordenadas
    if (!tacho.ubicacion_lat || !tacho.ubicacion_lon) {
      setError("Debe seleccionar una ubicación en el mapa");
      valido = false;
    }

    setErroresCampos(nuevosErrores);
    return valido;
  };

  // ------------------ GUARDAR ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const dataToSend = {
        codigo: tacho.codigo.trim(),
        nombre: tacho.nombre.trim(),
        descripcion: tacho.descripcion || "",
        ubicacion_lat: tacho.ubicacion_lat ? parseFloat(tacho.ubicacion_lat) : null,
        ubicacion_lon: tacho.ubicacion_lon ? parseFloat(tacho.ubicacion_lon) : null,
        canton: tacho.canton || null,
        estado: tacho.estado,
        nivel_llenado: 0,
        tipo: tacho.tipo,
        // Enviar propietario para ambos tipos (puede ser null)
        propietario: tacho.propietario,
        // Enviar empresa_nombre solo si es tipo público
        empresa_nombre: tacho.tipo === "publico" ? (tacho.empresa_nombre || "") : ""
      };

      console.log("Enviando datos:", dataToSend);

      if (id) {
        await api.put(`/tachos/${id}/`, dataToSend);
      } else {
        await api.post("/tachos/", dataToSend);
      }

      navigate("/tachos");
    } catch (err) {
      console.error("Error guardando tacho:", err);

      // Manejar error de código duplicado específicamente
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.codigo && errorData.codigo.includes("ya existe")) {
          setError("El código ya está en uso. Por favor, use un código diferente.");
        } else {
          setError(errorData.message || "Error en los datos enviados. Verifique la información.");
        }
      } else {
        setError("No se pudo guardar el tacho. Verifique su conexión.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------ POSICIÓN INICIAL ----------------------
  const defaultCuenca = [-2.90055, -79.00453];

  const lat = tacho.ubicacion_lat ? parseFloat(tacho.ubicacion_lat) : null;
  const lon = tacho.ubicacion_lon ? parseFloat(tacho.ubicacion_lon) : null;

  const initialPosition = lat && lon ? [lat, lon] : defaultCuenca;

  // ------------------ OPCIONES DE ESTADO --------------------
  const estados = [
    { value: "activo", label: "Activo", color: "#34c759" },
    { value: "mantenimiento", label: "Mantenimiento", color: "#ff9500" },
    { value: "fuera_servicio", label: "Fuera de servicio", color: "#ff3b30" }
  ];

  // ------------------ RENDER --------------------------------
  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <Trash2 className="icon-lg" style={{ marginRight: "12px" }} />
            {id ? "Editar Tacho" : "Nuevo Tacho"}
          </h2>
          <p className="page-header-subtitle">
            {id ? "Modifique los datos del tacho" : "Registre un nuevo tacho en el sistema"}
          </p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="icon-md" />
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Código con validación de unicidad */}
            <div className="form-group">
              <label className="form-label">
                <Tag className="icon-sm" /> Código
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="codigo"
                  value={tacho.codigo}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej: TAC-001"
                  required
                  style={{
                    paddingRight: "40px",
                    borderColor: codigoDisponible === true ? "#10b981" :
                                codigoDisponible === false ? "#ef4444" : undefined
                  }}
                />
                {verificandoCodigo && (
                  <div style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}>
                    <div className="spinner" style={{
                      width: "16px",
                      height: "16px",
                      borderWidth: "2px"
                    }}></div>
                  </div>
                )}
                {codigoDisponible === true && !verificandoCodigo && (
                  <CheckCircle
                    className="icon-sm"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#10b981"
                    }}
                  />
                )}
                {codigoDisponible === false && !verificandoCodigo && (
                  <XCircle
                    className="icon-sm"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#ef4444"
                    }}
                  />
                )}
              </div>
              {codigoDisponible !== null && !verificandoCodigo && (
                <p style={{
                  marginTop: "4px",
                  fontSize: "0.75rem",
                  color: codigoDisponible ? "#10b981" : "#ef4444",
                  fontWeight: "500"
                }}>
                  {codigoDisponible
                    ? "✓ Código disponible"
                    : "✗ Este código ya está en uso"}
                </p>
              )}
              <p style={{
                marginTop: "4px",
                fontSize: "0.75rem",
                color: "#6b7280"
              }}>
                El código debe ser único en el sistema
              </p>
            </div>

            {/* Nombre */}
            <div className="form-group">
              <label className="form-label">
                <Layers className="icon-sm" /> Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={tacho.nombre}
                onChange={handleChange}
                className="form-input"
                placeholder="Ej: Tacho Principal"
                required
              />
            </div>

            {/* Tipo de Tacho */}
            <div className="form-group">
              <label className="form-label">
                <Globe className="icon-sm" /> Tipo
              </label>
              <select
                name="tipo"
                value={tacho.tipo}
                onChange={handleTipoChange}
                className="form-input"
              >
                <option value="publico">Público / Empresa</option>
                <option value="personal">Personal</option>
              </select>
            </div>

            {/* Estado */}
            <div className="form-group">
              <label className="form-label">
                <Activity className="icon-sm" /> Estado
              </label>
              <select
                name="estado"
                value={tacho.estado}
                onChange={handleChange}
                className="form-input"
              >
                {estados.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nivel de Llenado (SOLO LECTURA) */}
            <div className="form-group">
              <label className="form-label">
                <Battery className="icon-sm" /> Nivel de Llenado
              </label>
              <div className="info-card" style={{ marginTop: "8px", padding: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Battery className="icon-sm" style={{ color: "#10b981" }} />
                    <span style={{ fontWeight: "600" }}>0%</span>
                  </div>
                  <span style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                    backgroundColor: "#f3f4f6",
                    padding: "4px 8px",
                    borderRadius: "4px"
                  }}>
                    Fijado por sistema
                  </span>
                </div>
                <p style={{
                  marginTop: "8px",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  fontStyle: "italic"
                }}>
                  El nivel de llenado se actualiza automáticamente mediante las detecciones de IA
                </p>
              </div>
            </div>

            {/* Nombre de Empresa/Institución (solo para tachos públicos) */}
            {tacho.tipo === "publico" && (
              <div className="form-group">
                <label className="form-label">
                  <Building className="icon-sm" /> Empresa / Institución
                </label>
                <input
                  type="text"
                  name="empresa_nombre"
                  value={tacho.empresa_nombre}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Ej: Municipio de Cuenca, Universidad XYZ..."
                  required
                />
                <p style={{
                  marginTop: "4px",
                  fontSize: "0.75rem",
                  color: "#6b7280"
                }}>
                  Ingrese el nombre de la empresa o institución responsable
                </p>
              </div>
            )}

            {/* Usuario Encargado (para ambos tipos) */}
            <div className="form-group">
              <label className="form-label">
                <User className="icon-sm" /> Usuario Encargado
              </label>
              <div className="select-wrapper" style={{ position: "relative" }}>
                <select
                  name="propietario"
                  value={tacho.propietario || ""}
                  onChange={handlePropietarioChange}
                  className="form-input"
                >
                  <option value="">-- Sin usuario encargado --</option>
                  {loadingUsuarios ? (
                    <option value="" disabled>Cargando usuarios...</option>
                  ) : (
                    usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} ({usuario.email})
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown
                  className="icon-sm"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#6b7280"
                  }}
                />
              </div>
              <p style={{
                marginTop: "4px",
                fontSize: "0.75rem",
                color: "#6b7280"
              }}>
                {tacho.tipo === "publico"
                  ? "Opcional: usuario responsable de gestionar este tacho"
                  : "Usuario al que pertenece este tacho personal"}
              </p>
            </div>

            {/* Información de Propiedad */}
            <div className="form-group form-grid-full">
              <div className="info-card" style={{
                backgroundColor: tacho.tipo === "personal" ? "rgba(59, 130, 246, 0.05)" : "rgba(16, 185, 129, 0.05)",
                borderLeft: `4px solid ${tacho.tipo === "personal" ? "#3b82f6" : "#10b981"}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: tacho.tipo === "personal" ? "#3b82f6" : "#10b981",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    {tacho.tipo === "personal" ?
                      <User className="icon-sm" style={{ color: "white" }} /> :
                      <Building className="icon-sm" style={{ color: "white" }} />
                    }
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "0.875rem", fontWeight: "600" }}>
                      {tacho.tipo === "personal" ? "Tacho Personal" : "Tacho Público / Empresa"}
                    </h4>
                    <p style={{ margin: "0", fontSize: "0.8125rem", color: "#6b7280" }}>
                      {tacho.tipo === "personal"
                        ? (tacho.propietario
                            ? `Usuario: ID ${tacho.propietario}`
                            : "Tacho personal sin usuario asignado")
                        : (tacho.empresa_nombre
                            ? `Empresa: ${tacho.empresa_nombre} ${tacho.propietario ? `(Usuario encargado: ID ${tacho.propietario})` : ""}`
                            : "Empresa no definida")
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="form-group form-grid-full">
              <label className="form-label">
                <FileText className="icon-sm" /> Descripción
              </label>
              <textarea
                name="descripcion"
                value={tacho.descripcion || ""}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Descripción o referencia del lugar..."
                rows="3"
              />
            </div>

            {/* Cantón */}
            {cantones.length > 0 && (
              <div className="form-group">
                <label className="form-label">
                  <MapPin className="icon-sm" /> Cantón
                </label>
                <select
                  name="canton"
                  value={tacho.canton}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">-- Seleccionar cantón --</option>
                  {cantones.map(canton => (
                    <option key={canton.id} value={canton.nombre}>
                      {canton.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lat/Lon */}
            <div className="form-group">
              <label className="form-label">
                <MapPin className="icon-sm" /> Latitud
              </label>
              <input
                type="text"
                value={tacho.ubicacion_lat || "No seleccionada"}
                readOnly
                className="form-input"
                style={{ backgroundColor: "#f9fafb", cursor: "not-allowed" }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin className="icon-sm" /> Longitud
              </label>
              <input
                type="text"
                value={tacho.ubicacion_lon || "No seleccionada"}
                readOnly
                className="form-input"
                style={{ backgroundColor: "#f9fafb", cursor: "not-allowed" }}
              />
            </div>
          </div>

          {/* MAPA */}
          <div className="form-group form-grid-full" style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin className="icon-sm" style={{ color: "#10b981" }} />
              <span style={{ fontWeight: "600", fontSize: "0.875rem" }}>Ubicación del Tacho</span>
            </div>
            <div style={{
              backgroundColor: "#f9fafb",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "12px"
            }}>
              <p style={{
                margin: "0 0 8px 0",
                fontSize: "0.8125rem",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                <AlertCircle className="icon-xs" />
                Haga clic en el mapa para establecer la ubicación del tacho
              </p>
              <p style={{ margin: "0", fontSize: "0.75rem", color: "#9ca3af" }}>
                Coordenadas seleccionadas: {tacho.ubicacion_lat || "-"}, {tacho.ubicacion_lon || "-"}
              </p>
            </div>
            <div style={{ height: "380px", borderRadius: "12px", overflow: "hidden" }}>
              <MapContainer
                center={initialPosition}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <LocationSelector />
                <RecenterMap lat={lat} lon={lon} />

                {lat && lon && (
                  <Marker position={[lat, lon]} icon={markerIcon}>
                    <Popup>
                      <strong>{tacho.nombre || "Nuevo Tacho"}</strong>
                      <br />
                      {tacho.codigo && `Código: ${tacho.codigo}`}
                      <br />
                      <small>{lat.toFixed(6)}, {lon.toFixed(6)}</small>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>

          {/* Resumen del Tacho */}
          <div className="form-group form-grid-full" style={{ marginTop: "24px" }}>
            <div className="info-card">
              <div className="info-card-icon">
                <Trash2 className="icon-lg" />
              </div>
              <div className="info-card-content">
                <h4>Resumen del Tacho</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Tipo:</span>
                    <span style={{ fontWeight: "600", color: tacho.tipo === "personal" ? "#3b82f6" : "#10b981" }}>
                      {tacho.tipo === "personal" ? "Personal" : "Público"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Empresa:</span>
                    <span style={{ fontWeight: "600" }}>
                      {tacho.tipo === "publico"
                        ? (tacho.empresa_nombre || "No definida")
                        : "No aplica"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Usuario encargado:</span>
                    <span style={{ fontWeight: "600" }}>
                      {tacho.propietario
                        ? `ID: ${tacho.propietario}`
                        : "No asignado"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Nivel:</span>
                    <span style={{ fontWeight: "600", color: "#10b981" }}>0% (automático)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#6b7280" }}>Código:</span>
                    <span style={{
                      fontWeight: "600",
                      color: codigoDisponible === false ? "#ef4444" : "#10b981"
                    }}>
                      {codigoDisponible === false ? "✗ Duplicado" : tacho.codigo || "No definido"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="form-actions" style={{ marginTop: "24px" }}>
            <Link to="/tachos" className="btn btn-secondary">
              <X className="icon-md" /> Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || codigoDisponible === false}
              style={{
                minWidth: "120px",
                opacity: codigoDisponible === false ? 0.6 : 1
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{
                    width: "16px",
                    height: "16px",
                    borderWidth: "2px",
                    marginRight: "8px"
                  }}></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="icon-md" /> {id ? "Actualizar" : "Crear"} Tacho
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TachoForm;