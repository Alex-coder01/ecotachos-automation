// src/pages/Ubicaciones/UbicacionForm.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapPin, Save, X, Map, Building } from "lucide-react";
import api from "../../api/axiosConfig";
import "../adminPages.css";

const UbicacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ubicacion, setUbicacion] = useState({
    provincia: "",
    ciudad: "",
    canton: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [cantones, setCantones] = useState([]);
  
  // Estados para autocompletado
  const [provinciaInput, setProvinciaInput] = useState("");
  const [ciudadInput, setCiudadInput] = useState("");
  const [showProvinciaSuggestions, setShowProvinciaSuggestions] = useState(false);
  const [showCiudadSuggestions, setShowCiudadSuggestions] = useState(false);
  const [provinciasFiltradas, setProvinciasFiltradas] = useState([]);
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
  
  // Referencias para detectar clics fuera
  const provinciaRef = useRef(null);
  const ciudadRef = useRef(null);

  // Función para capitalizar (primera mayúscula, resto minúscula)
  const capitalizar = (texto) => {
    if (!texto) return "";
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  const loadUbicacion = async () => {
    try {
      const res = await api.get(`/ubicacion/cantones/${id}/`);
      const provinciaData = provincias.find(p => p.id === res.data.provincia);
      const ciudadData = ciudades.find(c => c.id === res.data.ciudad);
      
      setProvinciaInput(provinciaData?.nombre || "");
      setCiudadInput(ciudadData?.nombre || "");
      setUbicacion({
        provincia: res.data.provincia || "",
        ciudad: res.data.ciudad || "",
        canton: res.data.nombre || "",
      });
    } catch (e) {
      console.error("Error cargando ubicación", e);
      setError("No se pudo cargar la ubicación");
    }
  };

  const loadProvinciasCantones = async () => {
    try {
      const resProv = await api.get("/ubicacion/provincias/");
      const resCiud = await api.get("/ubicacion/ciudades/");
      const resCant = await api.get("/ubicacion/cantones/");
      
      setProvincias(resProv.data);
      setCiudades(resCiud.data);
      setCantones(resCant.data);
    } catch (e) {
      console.error("Error cargando datos", e);
    }
  };

  useEffect(() => {
    loadProvinciasCantones();
  }, []);

  useEffect(() => {
    if (id && provincias.length > 0 && ciudades.length > 0) {
      loadUbicacion();
    }
  }, [id, provincias, ciudades]);

  // Filtrar provincias según input
  useEffect(() => {
    if (provinciaInput) {
      const filtered = provincias.filter(p =>
        p.nombre.toLowerCase().includes(provinciaInput.toLowerCase())
      );
      setProvinciasFiltradas(filtered);
    } else {
      setProvinciasFiltradas([]);
    }
  }, [provinciaInput, provincias]);

  // Filtrar ciudades según input y provincia seleccionada
  useEffect(() => {
    if (ciudadInput) {
      let filtered = ciudades;
      
      // Si hay una provincia seleccionada en la base de datos, filtrar por ella
      const provinciaExistente = provincias.find(p => 
        p.nombre.toLowerCase() === provinciaInput.toLowerCase()
      );
      
      if (provinciaExistente) {
        filtered = ciudades.filter(c => c.provincia === provinciaExistente.id);
      }
      
      // Filtrar por texto ingresado
      filtered = filtered.filter(c =>
        c.nombre.toLowerCase().includes(ciudadInput.toLowerCase())
      );
      
      setCiudadesFiltradas(filtered);
    } else {
      setCiudadesFiltradas([]);
    }
  }, [ciudadInput, provinciaInput, ciudades, provincias]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (provinciaRef.current && !provinciaRef.current.contains(event.target)) {
        setShowProvinciaSuggestions(false);
      }
      if (ciudadRef.current && !ciudadRef.current.contains(event.target)) {
        setShowCiudadSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProvinciaChange = (e) => {
    const value = capitalizar(e.target.value);
    setProvinciaInput(value);
    setShowProvinciaSuggestions(true);
    
    // Limpiar ciudad cuando cambie provincia
    setCiudadInput("");
    setUbicacion({ ...ubicacion, ciudad: "" });
    setError("");
  };

  const handleCiudadChange = (e) => {
    const value = capitalizar(e.target.value);
    setCiudadInput(value);
    setShowCiudadSuggestions(true);
    setError("");
  };

  const selectProvincia = (provincia) => {
    setProvinciaInput(provincia.nombre);
    setUbicacion({ ...ubicacion, provincia: provincia.id, ciudad: "" });
    setShowProvinciaSuggestions(false);
    setCiudadInput("");
  };

  const selectCiudad = (ciudad) => {
    setCiudadInput(ciudad.nombre);
    setUbicacion({ ...ubicacion, ciudad: ciudad.id });
    setShowCiudadSuggestions(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUbicacion({ ...ubicacion, [name]: value });
    setError("");
  };

  const validateForm = () => {
    if (!provinciaInput || !ciudadInput || !ubicacion.canton) {
      setError("Todos los campos son obligatorios");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      // Verificar si la provincia existe en la base de datos
      const provinciaExistente = provincias.find(p => 
        p.nombre.toLowerCase() === provinciaInput.toLowerCase()
      );

      // Verificar si la ciudad existe en la base de datos
      const ciudadExistente = ciudades.find(c => 
        c.nombre.toLowerCase() === ciudadInput.toLowerCase()
      );

      let provinciaId = provinciaExistente?.id;
      let ciudadId = ciudadExistente?.id;

      // CASO 1: Si provincia no existe, crear provincia, ciudad y cantón
      if (!provinciaExistente) {
        // Crear provincia nueva
        const resProv = await api.post("/ubicacion/provincias/", {
          nombre: provinciaInput
        });
        provinciaId = resProv.data.id;

        // Crear ciudad nueva con la provincia recién creada
        const resCiud = await api.post("/ubicacion/ciudades/", {
          nombre: ciudadInput,
          provincia: provinciaId
        });
        ciudadId = resCiud.data.id;
      }
      // CASO 2: Si provincia existe pero ciudad no, crear ciudad y cantón
      else if (provinciaExistente && !ciudadExistente) {
        const resCiud = await api.post("/ubicacion/ciudades/", {
          nombre: ciudadInput,
          provincia: provinciaId
        });
        ciudadId = resCiud.data.id;
      }
      // CASO 3: Si ambos existen, solo crear/actualizar cantón
      // (ciudadId ya está asignado)

      // Crear o actualizar el cantón
      const dataToSend = {
        nombre: ubicacion.canton,
        ciudad: ciudadId,
      };

      if (id) {
        await api.put(`/ubicacion/cantones/${id}/`, dataToSend);
      } else {
        await api.post("/ubicacion/cantones/", dataToSend);
      }

      navigate("/ubicaciones");
    } catch (err) {
      console.error("Error guardando ubicación", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.nombre?.[0] ||
        err.response?.data?.error ||
        "No se pudo guardar la ubicación"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h2>
            <MapPin className="icon-lg" style={{ display: "inline", marginRight: "12px" }} />
            {id ? "Editar Ubicación" : "Nueva Ubicación"}
          </h2>
          <p className="page-header-subtitle">
            {id
              ? "Actualice la información geográfica"
              : "Complete el formulario para registrar una nueva ubicación"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <X className="icon-md" />
              {error}
            </div>
          )}

          <div className="form-grid">
            {/* Provincia con Autocompletado */}
            <div className="form-group form-grid-full" ref={provinciaRef}>
              <label htmlFor="provincia" className="form-label">
                <Map className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Provincia
              </label>
              <input
                type="text"
                id="provincia"
                name="provincia"
                value={provinciaInput}
                onChange={handleProvinciaChange}
                onFocus={() => setShowProvinciaSuggestions(true)}
                className="form-input"
                placeholder="Escriba el nombre de la provincia"
                required
                autoComplete="off"
              />
              
              {/* Sugerencias de Provincias */}
              {showProvinciaSuggestions && provinciasFiltradas.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000
                }}>
                  {provinciasFiltradas.map((prov) => (
                    <div
                      key={prov.id}
                      onClick={() => selectProvincia(prov)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>
                        {prov.nombre}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <small style={{ color: "var(--color-gray)", marginTop: "8px", display: "block" }}>
                {provinciasFiltradas.length > 0 && showProvinciaSuggestions 
                  ? "Seleccione de la lista o escriba una nueva provincia"
                  : "Primera letra mayúscula, resto minúscula"}
              </small>
            </div>

            {/* Ciudad con Autocompletado */}
            <div className="form-group form-grid-full" ref={ciudadRef}>
              <label htmlFor="ciudad" className="form-label">
                <Building className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Ciudad
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={ciudadInput}
                onChange={handleCiudadChange}
                onFocus={() => setShowCiudadSuggestions(true)}
                className="form-input"
                placeholder="Escriba el nombre de la ciudad"
                required
                autoComplete="off"
                disabled={!provinciaInput}
              />
              
              {/* Sugerencias de Ciudades */}
              {showCiudadSuggestions && ciudadesFiltradas.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 1000
                }}>
                  {ciudadesFiltradas.map((ciud) => (
                    <div
                      key={ciud.id}
                      onClick={() => selectCiudad(ciud)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <div style={{ fontWeight: '500', color: '#1f2937' }}>
                        {ciud.nombre}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <small style={{ color: "var(--color-gray)", marginTop: "8px", display: "block" }}>
                {!provinciaInput 
                  ? "Primero escriba una provincia"
                  : ciudadesFiltradas.length > 0 && showCiudadSuggestions
                    ? "Seleccione de la lista o escriba una nueva ciudad"
                    : "Primera letra mayúscula, resto minúscula"}
              </small>
            </div>

            {/* Cantón */}
            <div className="form-group form-grid-full">
              <label htmlFor="canton" className="form-label">
                <MapPin className="icon-sm" style={{ display: "inline", marginRight: "8px" }} />
                Cantón
              </label>
              <input
                type="text"
                id="canton"
                name="canton"
                value={ubicacion.canton}
                onChange={handleChange}
                className="form-input"
                placeholder="Ingrese el nombre del cantón"
                required
              />
              <small style={{ color: "var(--color-gray)", marginTop: "8px", display: "block" }}>
                Nombre completo del cantón o parroquia
              </small>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link to="/ubicaciones" className="btn btn-secondary">
              <X className="icon-md" />
              Cancelar
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="icon-md" />
                  {id ? "Actualizar Ubicación" : "Crear Ubicación"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="info-card">
        <div className="info-card-icon">
          <MapPin className="icon-lg" />
        </div>
        <div className="info-card-content">
          <h4>Jerarquía Administrativa</h4>
          <p>
            El sistema utiliza la división política administrativa del Ecuador:
            Provincias → Ciudades → Cantones. Asegúrese de seleccionar la
            provincia correcta antes de elegir la ciudad.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UbicacionForm;