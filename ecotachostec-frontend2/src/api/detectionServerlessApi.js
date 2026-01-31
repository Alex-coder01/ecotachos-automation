// src/api/detectionServerlessApi.js
// Cliente para conectar con la función Serverless de detecciones

import axios from "axios";

// Obtener URL del servidor serverless desde variables de entorno
const SERVERLESS_BASE_URL = import.meta.env.VITE_SERVERLESS_URL || "http://localhost:9000";

// Crear instancia de axios para el serverless
const serverlessInstance = axios.create({
  baseURL: SERVERLESS_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejo de errores
serverlessInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Error en Serverless:", error.message);
    if (error.response?.status === 0) {
      console.error("⚠️ No se puede conectar al servidor serverless en", SERVERLESS_BASE_URL);
    }
    return Promise.reject(error);
  }
);

/**
 * Enviar una detección al servidor serverless
 * @param {Object} detection - Objeto con datos de detección
 * @param {string} detection.tacho_id - ID del tacho
 * @param {string} detection.classification - Clasificación (organico/inorganico/reciclable)
 * @param {number} detection.confidence - Confianza de la predicción (0-1)
 * @param {string} detection.image_url - URL de la imagen o base64
 * @param {string} [detection.user_id] - ID del usuario
 * @param {number} [detection.location_lat] - Latitud
 * @param {number} [detection.location_lon] - Longitud
 * @returns {Promise}
 */
export const sendDetection = async (detection) => {
  try {
    console.log("📤 Enviando detección al serverless...", detection);
    const response = await serverlessInstance.post("/detect", {
      tacho_id: detection.tacho_id || "unknown",
      classification: detection.classification,
      confidence: detection.confidence || 0.95,
      image_url: detection.image_url,
      timestamp: detection.timestamp || new Date().toISOString(),
      user_id: detection.user_id,
      location_lat: detection.location_lat,
      location_lon: detection.location_lon,
    });

    console.log("✅ Detección procesada:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error enviando detección:", error);
    throw error;
  }
};

/**
 * Enviar múltiples detecciones en batch
 * @param {Array} detections - Array de detecciones
 * @returns {Promise}
 */
export const sendBatchDetections = async (detections) => {
  try {
    console.log(`📤 Enviando ${detections.length} detecciones en batch...`);
    const results = [];

    for (const detection of detections) {
      try {
        const result = await sendDetection(detection);
        results.push({ success: true, data: result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error("❌ Error en batch:", error);
    throw error;
  }
};

/**
 * Verificar salud del servidor serverless
 * @returns {Promise}
 */
export const checkServerlessHealth = async () => {
  try {
    const response = await serverlessInstance.get("/health");
    console.log("✅ Serverless health:", response.data);
    return response.data;
  } catch (error) {
    console.warn("⚠️ Serverless no disponible:", error.message);
    return null;
  }
};

/**
 * Obtener estadísticas del servidor serverless
 * @returns {Promise}
 */
export const getServerlessStats = async () => {
  try {
    const response = await serverlessInstance.get("/stats");
    console.log("📊 Serverless stats:", response.data);
    return response.data;
  } catch (error) {
    console.warn("⚠️ No se pueden obtener estadísticas:", error.message);
    return null;
  }
};

/**
 * Obtener información del servidor serverless
 * @returns {Promise}
 */
export const getServerlessInfo = async () => {
  try {
    const response = await serverlessInstance.get("/info");
    console.log("ℹ️ Serverless info:", response.data);
    return response.data;
  } catch (error) {
    console.warn("⚠️ No se puede obtener información:", error.message);
    return null;
  }
};

/**
 * Hook de utilidad para enviar detección con retintentos
 * @param {Object} detection - Datos de detección
 * @param {number} maxRetries - Máximo número de intentos
 * @returns {Promise}
 */
export const sendDetectionWithRetry = async (detection, maxRetries = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Intento ${attempt}/${maxRetries}...`);
      const result = await sendDetection(detection);
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Intento ${attempt} fallido:`, error.message);

      if (attempt < maxRetries) {
        // Esperar antes de reintentar (2 segundos por intento)
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  throw lastError;
};

export default {
  sendDetection,
  sendBatchDetections,
  checkServerlessHealth,
  getServerlessStats,
  getServerlessInfo,
  sendDetectionWithRetry,
  SERVERLESS_BASE_URL,
};
