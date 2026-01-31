# 📷 Integración de Cámara IA - Guía de Implementación

## ✅ Lo que ya está implementado

### 1. **Componente CameraCapture** (`src/components/CameraCapture/CameraCapture.jsx`)
- ✓ Acceso a la cámara del dispositivo
- ✓ Captura de fotos en tiempo real
- ✓ Carga de imágenes desde archivos
- ✓ Vista previa de imagen capturada
- ✓ Interfaz modal limpia y responsive
- ✓ Manejo de permisos de cámara

### 2. **Sección en Landing Page** (`src/pages/User/LandingPage.jsx`)
- ✓ Botón "Abrir Cámara" funcional
- ✓ Vista previa de imagen capturada
- ✓ Mensaje de estado
- ✓ Estados de la cámara integrados

### 3. **Estilos** (`src/pages/User/landingPage.css` y `CameraCapture.css`)
- ✓ Diseño responsive
- ✓ Animaciones fluidas
- ✓ Interfaz moderna y atractiva

---

## 📋 Próximos pasos para integrar la IA

### Paso 1: Crear una API para análisis de imágenes
En tu backend (Django), crea un endpoint que reciba una imagen en base64 y la procese con tu modelo de IA:

```python
# En tu Django backend
from rest_framework.decorators import api_view
from rest_framework.response import Response
import base64
import cv2
import numpy as np
# Importa tu modelo de IA (TensorFlow, PyTorch, etc.)

@api_view(['POST'])
def analizar_residuo(request):
    """
    Recibe una imagen en base64 y retorna la clasificación del residuo
    """
    try:
        image_data = request.data.get('image')
        
        # Decodificar base64
        image_bytes = base64.b64decode(image_data.split(',')[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Procesar con tu modelo de IA
        prediccion = tu_modelo.predict(image)
        
        return Response({
            'exito': True,
            'tipo_residuo': prediccion['clase'],
            'confianza': prediccion['confianza'],
            'detalles': prediccion
        })
    except Exception as e:
        return Response({'exito': False, 'error': str(e)}, status=400)
```

### Paso 2: Actualizar el componente frontend
Modifica `CameraCapture.jsx` para enviar la imagen al backend:

```javascript
// En la función handleSendImage de CameraCapture.jsx
const handleSendImage = async () => {
  if (!capturedImage) return;
  setLoading(true);
  setError(null);
  setResult(null);

  try {
    const res = await fetch(capturedImage); // CapturedImage es dataURL
    const blob = await res.blob();
    const file = new File([blob], "captura.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("imagen", file);

    const response = await fetch("http://127.0.0.1:8001/api/ia/detect/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = await response.json();
    setResult(data);

  } catch (err) {
    setError(`Error analizando imagen: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

```

### Paso 3: Mostrar resultados del análisis
Actualiza el LandingPage para mostrar los resultados:

```javascript
// En LandingPage.jsx
const [analysisResult, setAnalysisResult] = useState(null);

const handleImageCapture = (captureData) => {
  setCapturedImage(captureData.image);
  setAnalysisResult(captureData.analisis);
  setShowCameraModal(false);
};

// En el JSX, dentro de camera-demo-card:
{analysisResult && (
  <div className="analysis-results">
    <h4>📊 Análisis IA</h4>
    <p><strong>Tipo de residuo:</strong> {analysisResult.tipo_residuo}</p>
    <p><strong>Confianza:</strong> {(analysisResult.confianza * 100).toFixed(2)}%</p>
  </div>
)}
```

### Paso 4: Guardar análisis en base de datos
Opcionalmente, guarda los análisis realizados en la tabla `detecciones`:

```python
# En tu backend
@api_view(['POST'])
def analizar_residuo(request):
    # ... análisis anterior ...
    
    # Guardar en BD
    deteccion = Deteccion.objects.create(
        nombre=prediccion['clase'],
        descripcion=f"Confianza: {prediccion['confianza']}",
        imagen=image_base64,
        tacho=request.data.get('tacho_id'),  # opcional
        ubicacion_lat=request.data.get('lat'),
        ubicacion_lon=request.data.get('lon')
    )
    
    return Response({...})
```

---

## 🔧 Estructura de carpetas relevantes

```
src/
├── components/
│   └── CameraCapture/          ← Componente de cámara
│       ├── CameraCapture.jsx
│       └── CameraCapture.css
├── pages/
│   └── User/
│       ├── LandingPage.jsx     ← Integración de CameraCapture
│       └── landingPage.css
└── api/
    └── deteccionApi.js         ← Endpoint para enviar imágenes
```

---

## 📱 API Endpoints recomendados

| Método | Endpoint | Función |
|--------|----------|---------|
| POST | `/detecciones/analizar/` | Analiza una imagen y retorna clasificación |
| POST | `/detecciones/` | Guarda un análisis en la BD |
| GET | `/detecciones/` | Lista todos los análisis |

---

## 🎯 Ejemplo completo de flujo

1. Usuario hace clic en "Abrir Cámara"
2. Se abre el modal `CameraCapture`
3. Usuario captura/sube imagen
4. Click en "Analizar con IA"
5. Imagen se envía al backend en base64
6. Backend procesa con modelo de IA
7. Se retorna clasificación + confianza
8. Frontend muestra resultados
9. Opcionalmente se guarda en `detecciones`

---

## 📝 Notas importantes

- **Permisos:** El navegador pedirá permiso para acceder a la cámara
- **HTTPS:** En producción, se requiere HTTPS para acceso a cámara
- **Base64:** Las imágenes se envían en base64 para API REST
- **Rendimiento:** Considera comprimir imágenes antes de enviar
- **Modelos ML:** Prepara tu modelo de IA en el backend (TensorFlow, PyTorch, etc.)

---

## 🚀 Testing

Para probar localmente:

1. Abre `http://localhost:5173`
2. Navega al landing page
3. Haz scroll hasta "Prueba Nuestra IA"
4. Click en "Abrir Cámara"
5. Captura una imagen
6. Verifica que aparezca en la preview

---

¡La interfaz está lista! Solo falta conectar el backend con tu modelo de IA. 🎉
