// src/components/CameraCapture.jsx
import { useState, useRef, useEffect } from "react";
import { X, Camera, RotateCcw, Loader2, CheckCircle2, Info } from "lucide-react";
import "./CameraCapture.css";
import { 
  detectWasteWithAI,
  isValidImageFormat,
  CATEGORY_INFO,
  checkAIHealth,
} from "../../api/deteccionApi";

export default function CameraCapture({ onCapture, onClose }) {
  const [mode, setMode] = useState("preview");
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [shouldStartCamera, setShouldStartCamera] = useState(false);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (shouldStartCamera && mode === "camera" && videoRef.current) {
      const initCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            setShouldStartCamera(false);
          }
        } catch (error) {
          console.error("Error al acceder a la cámara:", error);
          setError("No se pudo acceder a la cámara. Verifica permisos o conexión.");
          setMode("preview");
          setShouldStartCamera(false);
        }
      };
      
      initCamera();
    }
  }, [shouldStartCamera, mode]);

  const checkCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      if (videoDevices.length === 0) {
        setError("No se detecta ninguna cámara conectada.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error verificando cámaras:", error);
      setError("Error al verificar dispositivos de cámara.");
      return false;
    }
  };

  const startCamera = async () => {
    if (!(await checkCameras())) return;
    
    setError(null);
    setMode("camera");
    setShouldStartCamera(true);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      const context = canvas.getContext("2d");
      
      if (video.srcObject) {
        const settings = video.srcObject.getVideoTracks()[0].getSettings();
        if (settings.facingMode === 'user') {
          context.translate(width, 0);
          context.scale(-1, 1);
        }
      }
      
      context.drawImage(video, 0, 0, width, height);
      
      const imageData = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(imageData);
      
      stopCamera();
      setMode("image");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageFormat(file)) {
      setError("Formato de archivo no válido. Usa JPG, PNG o WebP.");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen es demasiado grande (máximo 10MB)");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      setMode("image");
      setError(null);
    };
    reader.onerror = () => {
      setError("Error al leer el archivo de imagen");
    };
    reader.readAsDataURL(file);
  };

const handleSendImage = async () => {
  if (!capturedImage) {
    setError("No hay imagen para analizar");
    return;
  }

  // Pre-chequeo: si motor local sin pesos, evitar llamada
  try {
    const health = await checkAIHealth();
    if (health.success && health.data?.engine === 'local' && health.data?.weights_exists === false) {
      setError("El motor local Ultralytics no tiene pesos configurados (AI_WEIGHTS). Configura los pesos antes de analizar.");
      return;
    }
  } catch (e) {
    // Si el health falla, continuamos pero mostramos advertencia
    console.warn("Advertencia: no se pudo verificar el estado del motor IA", e);
  }

  setLoading(true);
  setError(null);
  setResult(null);

  try {
    console.log("Enviando imagen para análisis...");
    
    //  CORREGIR: detectWasteWithAI devuelve la respuesta completa
    const response = await detectWasteWithAI(capturedImage);

    console.log(" Respuesta de API:", response); // Ver estructura

    // CASO 1: Error de conexión o servidor
    if (!response.success && response.error) {
      console.error(" Error del servidor:", response.error);
      setError(response.error || "Error al analizar la imagen");
      setResult(null);
      return;
    }

    // CASO 2: No se detectaron objetos
    if (!response.success && response.no_detection) {
      console.warn(" No se detectaron objetos");
      setError(response.message || "No se detectaron objetos en la imagen");
      setResult({
        no_detection: true,
        message: response.message,
        suggestions: response.suggestions || []
      });
      return;
    }

    // CASO 3: Éxito - Formatear resultados
    if (response.success && response.clasificacion_principal) {
      const { categoria, confianza } = response.clasificacion_principal;
      const categoryInfo = response.category_info || CATEGORY_INFO[categoria] || CATEGORY_INFO.inorganico;

      console.log("✅ Análisis completado:", categoria, confianza);

      setResult({
        success: true,
        categoria: categoria,
        categoriaLabel: categoryInfo.label,
        confianza: confianza,
        color: categoryInfo.color,
        bgColor: categoryInfo.bgColor,
        icon: categoryInfo.icon,
        descripcion: categoryInfo.description || categoryInfo.descripcion,
        ejemplos: categoryInfo.examples || categoryInfo.ejemplos,
        topPredicciones: response.top_predicciones || [],
        capturedImage: capturedImage  // ← Agregar la imagen original
      });

      // No llamar a onCapture automáticamente
      setError(null);
    } else {
      // CASO 4: Respuesta inesperada
      console.error(" Respuesta inesperada:", response);
      setError("Respuesta inesperada del servidor");
      setResult(null);
    }

  } catch (err) {
    console.error(" Error crítico analizando imagen:", err);
    setError(`Error al procesar la imagen: ${err.message}`);
    setResult(null);
  } finally {
    setLoading(false);
  }
};
  const resetCamera = () => {
    stopCamera();
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setMode("preview");
    setShouldStartCamera(false);
  };

  const handleClose = () => {
    resetCamera();
    onClose?.();
  };

const handleUseResult = () => {
  if (result?.success && result.capturedImage) {
    // Crear objeto con datos necesarios para el padre
    const detectionData = {
      image: result.capturedImage,
      categoria: result.categoria,
      categoriaLabel: result.categoriaLabel,
      confianza: result.confianza,
      timestamp: new Date().toISOString()
    };
    
    onCapture?.(detectionData);
    handleClose();
  }
};

  return (
    <div className="camera-capture-modal-overlay">
      <div className="camera-capture-modal">
        <div className="camera-capture-header">
          <h3 className="camera-capture-title">
            {result?.success ? "Análisis Completado" : "Sistema de Clasificación IA"}
          </h3>
          <button
            className="camera-capture-close-btn"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="camera-capture-body">
          {error && !result?.no_detection && (
            <div className="error-message">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}
          
  

          {/* RESULTADOS DE DETECCIÓN EXITOSA */}
          {result?.success && (
            <div className="result-container">
              <div className="result-image-section">
                <h4>
                  <CheckCircle2 size={20} />
                  Imagen Analizada
                </h4>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '600px',
                  margin: '0 auto',
                  backgroundColor: '#000',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '3px solid #10b981'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '75%',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={result.capturedImage}
                      alt="Resultado análisis"
                      style={{ 
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="main-classification">
                <div 
                  className="category-badge"
                  style={{ 
                    backgroundColor: result.bgColor,
                    border: `2px solid ${result.color}`,
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: result.color,
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '20px'
                    }}>
                      {result.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '800', 
                        color: result.color,
                        marginBottom: '4px'
                      }}>
                        {result.categoriaLabel}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        color: result.color,
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        padding: '2px 10px', 
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        {Math.round(result.confianza)}% Confianza
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    width: '100%', 
                    height: '10px', 
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                    borderRadius: '5px', 
                    overflow: 'hidden', 
                    marginBottom: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ 
                      width: `${result.confianza}%`, 
                      height: '100%',
                      backgroundColor: result.color, 
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>

                <p className="category-description" style={{ marginBottom: '12px' }}>
                  {result.descripcion}
                </p>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  marginTop: '8px', 
                  fontWeight: '500',
                  lineHeight: '1.6'
                }}>
                  <strong>Ejemplos:</strong> {result.ejemplos}
                </p>

                {result.topPredicciones && result.topPredicciones.length > 0 && (
                  <div className="detected-items" style={{ marginTop: '24px' }}>
                    <h5 style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      marginBottom: '16px',
                      color: '#111827'
                    }}>
                      Predicciones Principales
                    </h5>
                    <div className="items-grid">
                      {result.topPredicciones.slice(0, 3).map((pred, index) => {
                        const catInfo = CATEGORY_INFO[pred.categoria.toLowerCase()] || CATEGORY_INFO.inorganico;
                        return (
                          <div 
                            key={index} 
                            style={{
                              padding: '12px',
                              backgroundColor: catInfo.bgColor,
                              borderRadius: '8px',
                              border: `2px solid ${catInfo.color}`,
                              marginBottom: '8px'
                            }}
                          >
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              marginBottom: '8px'
                            }}>
                              <span style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#374151',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px'
                              }}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: catInfo.color,
                                  color: '#fff',
                                  fontWeight: '700',
                                  fontSize: '12px'
                                }}>
                                  {catInfo.icon}
                                </span>
                                {catInfo.label}
                              </span>
                              <span style={{ 
                                fontSize: '14px', 
                                fontWeight: '700', 
                                color: catInfo.color,
                                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                padding: '2px 10px', 
                                borderRadius: '6px'
                              }}>
                                {Math.round(pred.confianza)}%
                              </span>
                            </div>
                            <div style={{
                              width: '100%',
                              height: '6px',
                              backgroundColor: 'rgba(0, 0, 0, 0.1)',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${pred.confianza}%`,
                                height: '100%',
                                backgroundColor: catInfo.color,
                                transition: 'width 0.5s ease'
                              }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="result-actions">
                <button
                  className="btn-action btn-action-primary"
                  onClick={handleUseResult}
                >
                  <CheckCircle2 size={18} />
                  Usar este Resultado
                </button>
                <button
                  className="btn-action btn-action-secondary"
                  onClick={resetCamera}
                >
                  <Camera size={18} />
                  Nuevo Análisis
                </button>
                <button
                  className="btn-action btn-action-secondary"
                  onClick={handleClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* MENSAJE DE NO DETECCIÓN */}
          {result?.no_detection && (
            <div className="result-container">
              <div className="result-image-section">
                <h4>
                  <Info size={20} />
                  Imagen Analizada
                </h4>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '600px',
                  margin: '0 auto',
                  backgroundColor: '#000',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '3px solid #fbbf24'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '75%',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={capturedImage}
                      alt="Sin detección"
                      style={{ 
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ 
                padding: '24px', 
                borderRadius: '12px', 
                marginBottom: '24px',
                backgroundColor: '#fef3c7', 
                border: '2px solid #fbbf24'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'start', 
                  gap: '16px', 
                  marginBottom: '16px' 
                }}>
                  <Info size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ 
                      margin: '0 0 12px 0', 
                      fontSize: '17px', 
                      fontWeight: '700', 
                      color: '#92400e'
                    }}>
                      No se detectaron objetos
                    </h4>
                    <p style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '14px', 
                      color: '#6b7280',
                      lineHeight: '1.6'
                    }}>
                      {result.message}
                    </p>
                    
                    {result.suggestions && result.suggestions.length > 0 && (
                      <div>
                        <p style={{ 
                          margin: '0 0 10px 0', 
                          fontSize: '13px', 
                          fontWeight: '700', 
                          color: '#374151'
                        }}>
                          Sugerencias:
                        </p>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px', 
                          fontSize: '13px', 
                          color: '#6b7280',
                          lineHeight: '1.8'
                        }}>
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx} style={{ marginBottom: '6px' }}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="result-actions">
                <button
                  className="btn-action btn-action-primary"
                  onClick={resetCamera}
                >
                  <RotateCcw size={18} />
                  Intentar de nuevo
                </button>
                <button
                  className="btn-action btn-action-secondary"
                  onClick={handleClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* MODO PREVIEW */}
          {!result && mode === "preview" && (
            <div className="camera-preview-options">
              <div className="preview-placeholder">
                <div className="placeholder-icon">IA</div>
                <p className="placeholder-title">Sistema de Clasificación</p>
                <p className="placeholder-text">
                  Clasificación automática de residuos mediante inteligencia artificial
                </p>
              </div>

              <div className="preview-buttons">
                <button
                  className="btn-preview btn-preview-camera"
                  onClick={startCamera}
                  disabled={loading}
                >
                  <Camera size={24} />
                  <span>Abrir Cámara</span>
                </button>

                <button
                  className="btn-preview btn-preview-upload"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <span style={{ fontSize: "24px" }}>↑</span>
                  <span>Subir Imagen</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          )}

          {/* CÁMARA ACTIVA */}
          {!result && mode === "camera" && (
            <div className="camera-active-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />

              {cameraActive && (
                <>
                  <div className="camera-controls-overlay">
                    <button
                      className="btn-capture"
                      onClick={capturePhoto}
                      title="Capturar"
                      disabled={loading}
                    >
                      <span className="capture-dot"></span>
                    </button>
                  </div>

                  <button
                    className="btn-cancel"
                    onClick={resetCamera}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}

          {/* IMAGEN CAPTURADA - LISTA PARA ANÁLISIS */}
          {!result && mode === "image" && capturedImage && (
            <div className="image-review-container">
              <div className="image-preview-wrapper">
                <div style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '600px',
                  margin: '0 auto',
                  backgroundColor: '#000',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '3px solid #10b981'
                }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    paddingBottom: '75%',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={capturedImage}
                      alt="Captura"
                      style={{ 
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="image-review-info">
                <p className="info-text">Imagen lista para análisis</p>
                <p className="info-subtext">
                  El sistema analizará la imagen mediante inteligencia artificial
                </p>
              </div>

              <div className="image-review-buttons">
                <button
                  className="btn-image-action btn-image-send"
                  onClick={handleSendImage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Analizar Imagen
                    </>
                  )}
                </button>

                <button
                  className="btn-image-action btn-image-retake"
                  onClick={resetCamera}
                  disabled={loading}
                >
                  <RotateCcw size={18} />
                  Capturar otra
                </button>
              </div>

              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Procesando imagen con IA...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}