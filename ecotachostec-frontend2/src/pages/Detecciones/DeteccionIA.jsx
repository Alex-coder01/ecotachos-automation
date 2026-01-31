import { useState } from "react";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import AIProcessor from "../../components/AIProcessor/AIProcessor";

export default function DeteccionIA() {
  const [capturedImage, setCapturedImage] = useState(null);

  return (
    <div className="admin-page">
      <h2 style={{ marginBottom: "16px" }}>
        Detección con Inteligencia Artificial
      </h2>

      {/* CAMARA */}
      <div className="ia-camera-container">
        <CameraCapture
          onCapture={(img) => setCapturedImage(img)}
          onClose={() => setCapturedImage(null)}
        />
      </div>

      {/* ANALISIS IA */}
      <div style={{ marginTop: "24px" }}>
        <AIProcessor capturedImage={capturedImage} />
      </div>
    </div>
  );
}
