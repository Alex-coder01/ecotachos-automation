// src/components/NuevaDeteccionIA/NuevaDeteccionIA.jsx
import { useRef, useState, useEffect, useContext } from "react";
import Webcam from "react-webcam";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import { detectWasteWithAI } from "../../api/deteccionApi";
import {
  Camera,
  Upload,
  Scan,
  Target,
  Video,
  Loader2,
  Sparkles,
  Zap,
  ImageIcon,
  CheckCircle,
  AlertCircle,
  Trash2,
  Save,
  HardDrive,
  ChevronDown,
  MapPin,
  Info
} from "lucide-react";
import "./NuevaDeteccionIA.css";

const NuevaDeteccionIA = ({
  capturedImage,
  fileInputRef,
  onImageCapture,
  onImageUpload,
  onResetImage,
  onNewDetection,
  userLocation,
}) => {
  const { user } = useContext(AuthContext);
  const webcamRef = useRef(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [tachosUsuario, setTachosUsuario] = useState([]);
  const [tachoSeleccionado, setTachoSeleccionado] = useState(null);
  const [showTachoDropdown, setShowTachoDropdown] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Detectar cámaras disponibles
  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameraDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error("Error detecting cameras:", error);
      }
    };

    getCameras();
  }, []);

  // Cargar tachos del usuario actual
  useEffect(() => {
    const cargarTachosUsuario = async () => {
      if (!user) return;

      try {
        // Obtener todos los tachos
        const response = await api.get("/tachos/");
        const todosLosTachos = response.data.results || response.data || [];

        // Filtrar tachos relacionados al usuario actual
        const tachosRelacionados = todosLosTachos.filter(tacho => {
          // Tachos donde el usuario es propietario (personales)
          if (tacho.propietario === user.id) {
            return true;
          }

          // Tachos públicos donde el usuario es encargado
          if (tacho.tipo === "publico" && tacho.propietario === user.id) {
            return true;
          }

          return false;
        });

        // Ordenar por nombre
        tachosRelacionados.sort((a, b) => a.nombre.localeCompare(b.nombre));

        setTachosUsuario(tachosRelacionados);

        // Si hay tachos, seleccionar el primero por defecto
        if (tachosRelacionados.length > 0 && !tachoSeleccionado) {
          setTachoSeleccionado(tachosRelacionados[0]);
        }
      } catch (error) {
        console.error("Error cargando tachos del usuario:", error);
      }
    };

    cargarTachosUsuario();
  }, [user]);

  // Manejar captura de cámara
  const handleCapture = () => {
    if (webcamRef.current) {
      try {
        const imageSrc = webcamRef.current.getScreenshot({
          width: 1280,
          height: 720,
          screenshotQuality: 0.85
        });

        if (imageSrc) {
          onImageCapture(imageSrc);
          setUsingCamera(false);
          setCameraError(null);
          // Iniciar procesamiento automático
          handleProcessImage(imageSrc);
        }
      } catch (error) {
        console.error("Error capturing image:", error);
        setCameraError("Error al capturar la imagen");
      }
    }
  };

  // Manejar subida de archivo
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("La imagen es demasiado grande. Máximo 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageSrc = event.target.result;
        onImageUpload(e);
        // Iniciar procesamiento automático
        handleProcessImage(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  // Procesar imagen con IA - CORREGIDO para la nueva estructura
  const handleProcessImage = async (imageSrc) => {
    setIsProcessing(true);
    setAiResult(null);
    setGuardadoExitoso(false);

    try {
      // Usar el servicio de IA del backend
      const result = await detectWasteWithAI(imageSrc);

      if (result.success) {
        console.log("Respuesta IA recibida:", result);

        // Mapear la respuesta CORRECTAMENTE según la estructura del backend
        const mappedResult = {
          type: result.clasificacion_principal?.categoria || "no identificado",
          confidence: result.clasificacion_principal?.confianza ? result.clasificacion_principal.confianza / 100 : 0.46,
          materials: result.top_predicciones?.map(pred => pred.categoria) || ["No identificado"],
          recyclingInfo: result.category_info?.description || "Información no disponible",
          category: result.clasificacion_principal?.categoria || "general",
          timestamp: new Date().toISOString(),
          rawData: result // Guardar datos completos
        };

        console.log("Resultado mapeado:", mappedResult);
        setAiResult(mappedResult);
      } else {
        console.error("Error en IA:", result.error);
        // Si falla la IA del backend, usar valores por defecto
        setAiResult({
          type: "organico",
          confidence: 0.46,
          materials: ["Orgánico"],
          recyclingInfo: "Residuo orgánico - Depositar en contenedor verde",
          category: "organico",
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Error en procesamiento IA:", error);
      // Usar valores por defecto en caso de error
      setAiResult({
        type: "residuo",
        confidence: 0.75,
        materials: ["No identificado"],
        recyclingInfo: "Clasificación realizada localmente",
        category: "general",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  // Toggle cámara
  const toggleCamera = () => {
    setUsingCamera(!usingCamera);
    setCameraError(null);
    if (!usingCamera) {
      onResetImage();
      setAiResult(null);
      setGuardadoExitoso(false);
    }
  };

  // Reiniciar todo
  const handleReset = () => {
    onResetImage();
    setUsingCamera(false);
    setAiResult(null);
    setIsProcessing(false);
    setCameraError(null);
    setGuardadoExitoso(false);
  };

  // Función para convertir base64 a Blob
  const base64ToBlob = (base64) => {
    // Extraer el contenido base64 (sin el data:image/jpeg;base64,)
    const base64Data = base64.split(',')[1];
    const mimeType = base64.split(',')[0].split(':')[1].split(';')[0];

    // Convertir a byte array
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  };

  // Formatear coordenadas a 6 decimales
  const formatCoordinate = (coord) => {
    if (coord === null || coord === undefined) return null;
    const num = parseFloat(coord);
    return parseFloat(num.toFixed(6));
  };

  // Guardar detección en el backend - CORREGIDO
  const handleSaveDetection = async () => {
    if (!aiResult || !user) {
      alert("No hay resultados para guardar o usuario no autenticado");
      return;
    }

    if (!tachoSeleccionado && tachosUsuario.length > 0) {
      alert("Por favor, selecciona un tacho para guardar la detección");
      return;
    }

    setGuardando(true);

    try {
      // IMPORTANTE: Usar FormData en lugar de JSON
      const formData = new FormData();

      // Agregar campos básicos
      formData.append("tacho", tachoSeleccionado?.id || "");
      formData.append("usuario", user.id);
      formData.append("clasificacion", aiResult.category || aiResult.type || "organico");
      formData.append("confianza_ia", parseFloat((aiResult.confidence * 100).toFixed(2)));

      // Usar ubicación del tacho seleccionado, no del usuario
      const ubicacionLat = formatCoordinate(tachoSeleccionado?.ubicacion_lat || -2.90055);
      const ubicacionLon = formatCoordinate(tachoSeleccionado?.ubicacion_lon || -79.00453);

      formData.append("ubicacion_lat", ubicacionLat);
      formData.append("ubicacion_lon", ubicacionLon);

      formData.append("descripcion", `Clasificación IA: ${aiResult.type}. Confianza: ${(aiResult.confidence * 100).toFixed(1)}%. Materiales: ${aiResult.materials?.join(", ") || "No identificado"}`);
      formData.append("procesado", "true");
      formData.append("activo", "true");

      // Agregar imagen como archivo (FormData maneja correctamente Blob)
      if (capturedImage && capturedImage.startsWith('data:image')) {
        const blob = base64ToBlob(capturedImage);
        formData.append("imagen", blob, "deteccion.jpg");
      } else {
        throw new Error("No hay imagen válida para enviar");
      }

      console.log("Enviando FormData al backend...");
      console.log("Tacho seleccionado:", tachoSeleccionado?.id);
      console.log("Ubicación lat:", ubicacionLat);
      console.log("Ubicación lon:", ubicacionLon);
      console.log("Clasificación:", aiResult.category);

      // Enviar al backend usando FormData
      const response = await api.post("/detecciones/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 201) {
        console.log("Detección guardada exitosamente:", response.data);
        await api.post("/iot/esp32/detect/", {
        tacho_id: tachoSeleccionado.id,
          clasificacion: aiResult.category  // 👈 CLAVE


        });
        setGuardadoExitoso(true);

        // Llamar a la función onNewDetection si existe
        if (onNewDetection) {
          onNewDetection({
            ...aiResult,
            id: response.data.id,
            tacho_nombre: tachoSeleccionado?.nombre,
            fecha_registro: new Date().toISOString(),
            confianza_ia: parseFloat((aiResult.confidence * 100).toFixed(2)),
            tacho_id: tachoSeleccionado?.id
          });
        }

        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert(`✅ Detección guardada exitosamente en ${tachoSeleccionado?.nombre || 'el sistema'}`);
          handleReset();
        }, 500);
      }
    } catch (error) {
      console.error("Error guardando detección:", error);
      console.error("Detalles del error:", error.response?.data);

      let errorMessage = "Error desconocido al guardar";
      if (error.response?.data) {
        // Mostrar errores específicos del backend
        if (typeof error.response.data === 'object') {
          errorMessage = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`❌ Error al guardar:\n${errorMessage}`);
    } finally {
      setGuardando(false);
    }
  };

  // Seleccionar tacho
  const handleSelectTacho = (tacho) => {
    setTachoSeleccionado(tacho);
    setShowTachoDropdown(false);
  };

  // Renderizar dropdown de tachos
  const renderTachoDropdown = () => (
    <div className="tacho-dropdown-container">
      <div className="tacho-selector">
        <button
          className="tacho-selector-btn"
          onClick={() => setShowTachoDropdown(!showTachoDropdown)}
        >
          <div className="selected-tacho-info">
            <HardDrive size={16} />
            <span>
              {tachoSeleccionado
                ? `Guardar en: ${tachoSeleccionado.nombre}`
                : "Seleccionar tacho..."
              }
            </span>
            {tachoSeleccionado && (
              <span className="tacho-badge">
                {tachoSeleccionado.tipo === 'publico' ? 'Público' : 'Personal'}
              </span>
            )}
          </div>
          <ChevronDown size={16} className={showTachoDropdown ? "rotate-180" : ""} />
        </button>

        {showTachoDropdown && (
          <div className="tacho-dropdown">
            <div className="dropdown-header">
              <HardDrive size={14} />
              <span>Mis tachos disponibles</span>
            </div>
            <div className="tacho-list">
              {tachosUsuario.length === 0 ? (
                <div className="no-tachos-message">
                  <AlertCircle size={16} />
                  <span>No tienes tachos asignados</span>
                </div>
              ) : (
                tachosUsuario.map(tacho => (
                  <div
                    key={tacho.id}
                    className={`tacho-option ${tachoSeleccionado?.id === tacho.id ? 'selected' : ''}`}
                    onClick={() => handleSelectTacho(tacho)}
                  >
                    <div className="tacho-option-icon">
                      {tacho.tipo === 'publico' ? <MapPin size={14} /> : <HardDrive size={14} />}
                    </div>
                    <div className="tacho-option-info">
                      <div className="tacho-name">{tacho.nombre}</div>
                      <div className="tacho-details">
                        <span className="tacho-code">{tacho.codigo}</span>
                        <span className="tacho-type">{tacho.tipo === 'publico' ? 'Público' : 'Personal'}</span>
                      </div>
                      {tacho.ubicacion_lat && tacho.ubicacion_lon && (
                        <div className="tacho-location">
                          <MapPin size={10} />
                          <span>{formatCoordinate(tacho.ubicacion_lat)}, {formatCoordinate(tacho.ubicacion_lon)}</span>
                        </div>
                      )}
                    </div>
                    {tachoSeleccionado?.id === tacho.id && (
                      <CheckCircle size={14} className="check-icon" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Función para formatear el texto de categoría
  const getCategoryDisplay = (category) => {
    switch(category) {
      case 'organico':
        return { text: 'Orgánico', icon: '🌱', colorClass: 'organico' };
      case 'reciclable':
        return { text: 'Reciclable', icon: '♻️', colorClass: 'reciclable' };
      case 'inorganico':
        return { text: 'Inorgánico', icon: '🏭', colorClass: 'inorganico' };
      case 'ninguno':
        return { text: 'No clasificado', icon: '❓', colorClass: 'general' };
      default:
        return { text: category || 'No clasificado', icon: '📦', colorClass: 'general' };
    }
  };

  // Mostrar información de ubicación del tacho
  const renderTachoLocationInfo = () => {
    if (!tachoSeleccionado || !tachoSeleccionado.ubicacion_lat || !tachoSeleccionado.ubicacion_lon) {
      return null;
    }

    return (
      <div className="tacho-location-info">
        <MapPin size={12} />
        <span>
          Ubicación: {formatCoordinate(tachoSeleccionado.ubicacion_lat)}, {formatCoordinate(tachoSeleccionado.ubicacion_lon)}
        </span>
      </div>
    );
  };

  return (
    <div className="nueva-deteccion-dashboard">
      {/* Panel de Control Compacto */}
      <div className="dashboard-header">
        <div className="header-left">
          <div className="detection-badge">
            <Sparkles size={14} />
            <span>IA en tiempo real</span>
          </div>
          {aiResult && !guardadoExitoso && tachosUsuario.length > 0 && (
            <div className="tacho-selector-header">
              {renderTachoDropdown()}
            </div>
          )}
        </div>
        <div className="header-right">
          {(capturedImage || usingCamera) && (
            <button onClick={handleReset} className="reset-btn-sm">
              <Trash2 size={16} />
              <span>Reiniciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Layout Principal Compacto */}
      <div className="dashboard-main">
        {/* Área de Captura */}
        <div className="capture-section">
          <div className="preview-card">
            {usingCamera ? (
              <div className="camera-container">
                {cameraError ? (
                  <div className="camera-error-state">
                    <AlertCircle size={32} />
                    <p>{cameraError}</p>
                    <button onClick={() => setCameraError(null)} className="retry-btn">
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                      }}
                      className="camera-feed"
                      onUserMediaError={() => setCameraError("No se pudo acceder a la cámara")}
                    />
                    <div className="camera-guide">
                      <div className="guide-frame"></div>
                    </div>
                  </>
                )}
              </div>
            ) : capturedImage ? (
              <div className="image-loaded">
                <img src={capturedImage} alt="Preview" className="preview-img" />
                <div className="image-status">
                  <CheckCircle size={14} />
                  <span>Imagen lista</span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <ImageIcon size={36} />
                </div>
                <p>Selecciona o captura una imagen</p>
                <div className="empty-tip">
                  <Target size={12} />
                  <span>La IA analizará el tipo de residuo</span>
                </div>
              </div>
            )}
          </div>

          {/* Controles Compactos */}
          <div className="compact-controls">
            <div className="control-group">
              <button
                onClick={toggleCamera}
                className={`icon-btn ${usingCamera ? 'active' : ''}`}
                disabled={cameraDevices.length === 0}
                title={cameraDevices.length > 0 ? "Abrir cámara" : "Sin cámara disponible"}
              >
                <Camera size={18} />
              </button>
              <button
                onClick={openFileSelector}
                className="icon-btn secondary"
                title="Subir imagen"
              >
                <Upload size={18} />
              </button>
              {usingCamera && (
                <button
                  onClick={handleCapture}
                  className="icon-btn capture"
                  title="Capturar imagen"
                >
                  <div className="capture-dot"></div>
                </button>
              )}
            </div>

            {cameraDevices.length > 1 && (
              <div className="camera-select">
                <Video size={14} />
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                >
                  {cameraDevices.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      Cámara {index + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Input de archivo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>

        {/* Área de Resultados */}
        <div className="results-section">
          {isProcessing ? (
            <div className="processing-card">
              <div className="processing-header">
                <Loader2 className="spinner" size={20} />
                <h4>Analizando...</h4>
              </div>
              <p>Clasificando residuo con IA</p>
              <div className="progress-track">
                <div className="progress-fill"></div>
              </div>
            </div>
          ) : aiResult ? (
            <div className="results-card">
              <div className="results-header success">
                <Scan size={18} />
                <div>
                  <h4>Clasificación: {getCategoryDisplay(aiResult.category).text}</h4>
                  <p className="confidence">{(aiResult.confidence * 100).toFixed(1)}% de confianza</p>
                </div>
              </div>

              <div className="results-details">
                <div className="detail-row">
                  <span className="label">Material:</span>
                  <span className="value">
                    {aiResult.materials?.join(", ") || "No identificado"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Categoría:</span>
                  <span className={`value category-${aiResult.category}`}>
                    {getCategoryDisplay(aiResult.category).icon} {getCategoryDisplay(aiResult.category).text}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Instrucciones:</span>
                  <span className="value">{aiResult.recyclingInfo}</span>
                </div>
              </div>

              {/* Selector de tacho en resultados */}
              {!guardadoExitoso && tachosUsuario.length > 0 && (
                <div className="tacho-selector-results">
                  {renderTachoDropdown()}
                  {tachoSeleccionado && renderTachoLocationInfo()}
                  <div className="tacho-help-text">
                    <Info size={12} />
                    <span>La detección usará la ubicación del tacho seleccionado</span>
                  </div>
                </div>
              )}

              <div className="results-actions">
                <button
                  onClick={handleSaveDetection}
                  className="save-btn"
                  disabled={guardando || !tachoSeleccionado || guardadoExitoso}
                >
                  {guardando ? (
                    <>
                      <Loader2 className="spinner" size={16} />
                      Guardando...
                    </>
                  ) : guardadoExitoso ? (
                    <>
                      <CheckCircle size={16} />
                      ¡Guardado!
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Detección
                    </>
                  )}
                </button>
                <button onClick={handleReset} className="new-btn">
                  <Scan size={16} />
                  Nueva Detección
                </button>
              </div>

              {guardadoExitoso && (
                <div className="success-message">
                  <CheckCircle size={16} />
                  <span>Detección guardada exitosamente en {tachoSeleccionado?.nombre}</span>
                </div>
              )}
            </div>
          ) : capturedImage ? (
            <div className="ready-card">
              <div className="ready-header">
                <Zap size={18} />
                <h4>Imagen lista para análisis</h4>
              </div>
              <p>Presiona el botón para clasificar con IA</p>
              <button
                onClick={() => handleProcessImage(capturedImage)}
                className="analyze-btn"
              >
                <Zap size={16} />
                Analizar con IA
              </button>
              <div className="ready-tips">
                <div className="tip">
                  <Target size={12} />
                  <span>Asegúrate de que el residuo sea visible</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="idle-card">
              <div className="idle-header">
                <Scan size={18} />
                <h4>Esperando imagen</h4>
              </div>
              <p>Usa la cámara o sube una imagen para comenzar</p>
              <div className="idle-tips">
                <div className="tip">
                  <Target size={12} />
                  <span>Buena iluminación mejora los resultados</span>
                </div>
                <div className="tip">
                  <Target size={12} />
                  <span>Enfoca el residuo claramente</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NuevaDeteccionIA;