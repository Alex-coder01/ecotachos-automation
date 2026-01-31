import CameraCapture from "../../components/CameraCapture/CameraCapture";
import "../adminPages.css";

export default function NuevaDeteccionIA() {
  return (
    <div className="admin-page">
      <h2>Detección con Inteligencia Artificial</h2>

      <CameraCapture
        onCapture={(image) => {
          console.log("Imagen analizada:", image);
        }}
        onClose={() => console.log("Cámara cerrada")}
      />
    </div>
  );
}
