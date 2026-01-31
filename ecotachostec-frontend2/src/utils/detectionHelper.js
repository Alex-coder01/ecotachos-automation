// src/utils/detectionHelper.js
// Utilidades para procesar y enviar detecciones

import detectionServerlessApi from "../api/detectionServerlessApi.js";

/**
 * Procesar imagen con modelo local o IA
 * y enviarla al serverless
 */
export const processAndSendDetection = async (
  imagePath,
  tachoId,
  userId,
  location = null
) => {
  try {
    console.log("🔍 Procesando imagen:", imagePath);

    // Aquí iría el procesamiento local con YOLO/modelo
    // Por ahora simulamos una detección
    const prediction = await simulateAIPrediction(imagePath);

    console.log("🤖 Predicción IA:", prediction);

    // Preparar payload para el serverless
    const detectionPayload = {
      tacho_id: tachoId,
      classification: prediction.class,
      confidence: prediction.confidence,
      image_url: imagePath,
      user_id: userId,
      timestamp: new Date().toISOString(),
      location_lat: location?.lat,
      location_lon: location?.lon,
    };

    // Enviar al serverless con reintentos
    const result = await detectionServerlessApi.sendDetectionWithRetry(
      detectionPayload,
      3
    );

    console.log("✅ Detección registrada:", result);
    return result;
  } catch (error) {
    console.error("❌ Error procesando detección:", error);
    throw error;
  }
};

/**
 * Simular predicción IA (reemplazar con modelo real)
 */
const simulateAIPrediction = async (imagePath) => {
  // TODO: Integrar con modelo YOLO/modelo local
  return {
    class: "organico",
    confidence: 0.95,
    timestamp: new Date(),
  };
};

/**
 * Convertir imagen a base64
 */
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Capturar foto desde cámara y procesarla
 */
export const captureFromCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();

    return new Promise((resolve) => {
      setTimeout(() => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);

        stream.getTracks().forEach((track) => track.stop());
        resolve(canvas.toDataURL("image/jpeg"));
      }, 1000);
    });
  } catch (error) {
    console.error("❌ Error capturando cámara:", error);
    throw error;
  }
};

/**
 * Validar que la detección sea válida
 */
export const isValidDetection = (detection) => {
  return (
    detection.tacho_id &&
    detection.classification &&
    detection.confidence > 0 &&
    detection.confidence <= 1
  );
};

/**
 * Formatear resultado para mostrar en UI
 */
export const formatDetectionResult = (result) => {
  const categoryMap = {
    organico: {
      label: "ORGÁNICO ♻️",
      color: "#10b981",
      icon: "🌿",
    },
    inorganico: {
      label: "INORGÁNICO 🔧",
      color: "#f59e0b",
      icon: "⚙️",
    },
    reciclable: {
      label: "RECICLABLE 📦",
      color: "#3b82f6",
      icon: "📦",
    },
  };

  const category = categoryMap[result.classification] || {
    label: result.classification,
    color: "#6b7280",
    icon: "❓",
  };

  return {
    ...result,
    categoryLabel: category.label,
    categoryColor: category.color,
    categoryIcon: category.icon,
    confidencePercent: Math.round(result.confidence * 100),
  };
};

export default {
  processAndSendDetection,
  captureFromCamera,
  imageToBase64,
  isValidDetection,
  formatDetectionResult,
};
