// src/pages/Detecciones/DeteccionesIA.jsx
import { useState, useRef } from "react";
import { Camera, Upload, Brain, X, AlertCircle } from "lucide-react";
import "./deteccionesIA.css";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import AIProcessor from "../../components/AIProcessor/AIProcessor";

export default function DeteccionesIA() {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  const fileInputRef = useRef(null);
  const aiSectionRef = useRef(null);

  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setShowAIProcessor(false);
    
    setTimeout(() => {
      setShowAIProcessor(true);
      setAnalysisKey(prev => prev + 1);
    }, 50);

    setShowCameraModal(false);

    setTimeout(() => {
      aiSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      setShowAIProcessor(false);

      setTimeout(() => {
        setShowAIProcessor(true);
        setAnalysisKey(prev => prev + 1);
      }, 50);

      setTimeout(() => {
        aiSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    setCapturedImage(null);
    setShowAIProcessor(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyzeAgain = () => {
    setShowAIProcessor(false);
    setTimeout(() => {
      setShowAIProcessor(true);
      setAnalysisKey(prev => prev + 1);
    }, 50);
  };

  return (
    <div className="detecciones-ia-page">
      {/* HEADER */}
      <div className="ia-header">
        <div className="ia-header-content">
          <div className="ia-badge">
            <Brain size={20} />
            <span>Sistema de Clasificación IA</span>
          </div>
          <h1 className="ia-title">Análisis Inteligente de Residuos</h1>
          <p className="ia-subtitle">
            Captura o sube imágenes para clasificar residuos con IA
          </p>
        </div>
      </div>

      {/* CONTROLES */}
      <div className="ia-control-section">
        <div className="ia-control-card">
          <div className="ia-image-preview">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Preview"
                className="ia-preview-image"
              />
            ) : (
              <div className="ia-empty-preview">
                <Camera size={48} />
                <p>No hay imagen seleccionada</p>
              </div>
            )}
          </div>

          <div className="ia-control-buttons">
            <button onClick={handleOpenCamera} className="ia-btn ia-btn-primary">
              <Camera size={18} /> Abrir Cámara
            </button>

            <button
              onClick={() => fileInputRef.current.click()}
              className="ia-btn ia-btn-secondary"
            >
              <Upload size={18} /> Subir Imagen
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />

            {capturedImage && (
              <div className="ia-action-buttons">
                <button onClick={handleResetImage} className="ia-btn ia-btn-danger">
                  <X size={18} /> Eliminar
                </button>

                <button
                  onClick={handleAnalyzeAgain}
                  className="ia-btn ia-btn-success"
                >
                  <Brain size={18} /> Analizar con IA
                </button>
              </div>
            )}
          </div>

          <div className="ia-info-box">
            <AlertCircle size={16} />
            <p>
              {capturedImage
                ? "Imagen lista para análisis"
                : "Usa la cámara o sube una imagen"}
            </p>
          </div>
        </div>
      </div>

      {/* IA PROCESSOR */}
      {showAIProcessor && capturedImage && (
        <div ref={aiSectionRef} className="ia-processor-section">
          <AIProcessor
            key={analysisKey}
            capturedImage={capturedImage}
          />
        </div>
      )}

      {/* MODAL CÁMARA */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
}