# 🌍 LANDING PAGE - PÁGINA PRINCIPAL DE USUARIO

## 📋 Información General

**Archivo**: [src/pages/User/LandingPage.jsx](src/pages/User/LandingPage.jsx)
**Estilos**: [src/pages/User/landingPage.css](src/pages/User/landingPage.css)
**Líneas de Código**: 724 líneas JSX + 1819 líneas CSS
**Propósito**: Página pública de presentación del proyecto EcoTachosTec

---

## 🎯 Propósito

Página de inicio que presenta el proyecto EcoTachosTec a usuarios no autenticados y autenticados. Incluye:
- Información sobre el proyecto
- Características del sistema
- Tecnología utilizada
- Impacto ambiental
- **Demo interactiva de IA** para clasificar residuos
- CTAs para registro/login

---

## 📐 Secciones de la Página

### 1️⃣ HERO SECTION (Primera pantalla)
```
┌─────────────────────────────────────┐
│ [Fondo: Gradiente + Círculos animados]
│                                     │
│     Tecnología Verde del Futuro    │  ← Badge
│                                     │
│  Gestión Inteligente de             │
│  Residuos                            │
│                                     │
│  Revolucionando el manejo...        │
│                                     │
│  [Comenzar Ahora] [Iniciar Sesión]  │  ← CTAs
│                                     │
│      +5 tachos | +120 detecciones   │  ← Stats animadas
│                                     │
│  ↓ Descubre más ↓                   │  ← Scroll indicator
└─────────────────────────────────────┘

CARACTERÍSTICAS:
- Altura: 100vh (pantalla completa)
- Fondo: Gradiente gris claro (#f8f9fa → #e9ecef)
- Círculos flotantes animados (3 elementos)
- 20 partículas pequeñas flotantes
- Animación parallax al hacer scroll
```

### 2️⃣ SECCIÓN PROYECTO
```
┌─────────────────────────────────────┐
│ Nuestra Misión                      │
│                                     │
│ El Proyecto EcoTachosTec            │ ← Título
│                                     │
│ Solución integral basada en IoT...  │ ← Descripción
│                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │🎯    │ │💡    │ │🌍    │         │
│ │Objet │ │Inno  │ │Soste │         │
│ │ivo   │ │vación│ │nibili│         │
│ │      │ │      │ │dad   │         │
│ └──────┘ └──────┘ └──────┘         │
│                                     │
└─────────────────────────────────────┘

CARDS (3):
- Objetivo: Optimizar recolección
- Innovación: Sensores IoT + ML
- Sostenibilidad: Reducción CO₂
```

### 3️⃣ SECCIÓN TACHOS (Fondo oscuro)
```
┌─────────────────────────────────────┐
│ Tecnología IoT                      │
│                                     │
│ Nuestros Tachos Inteligentes        │
│                                     │
│ Equipados con sensores avanzados    │
│                                     │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│ │📡  │ │🌡️ │ │📍 │ │🔍 │       │
│ │Ultra│ │Ambie│ │GPS│ │IA │       │
│ │sóni │ │ntal │ │   │ │   │       │
│ └────┘ └────┘ └────┘ └────┘       │
│                                     │
│ [Crear Cuenta Gratis]               │
└─────────────────────────────────────┘

FEATURES (4):
- Sensores Ultrasónicos
- Monitoreo Ambiental
- Geolocalización GPS
- Clasificación IA
```

### 4️⃣ SECCIÓN TECNOLOGÍA
```
┌─────────────────────────────────────┐
│ Inteligencia Artificial             │
│                                     │
│ Tecnología de Vanguardia            │
│                                     │
│ ┌────────────┐ ┌────────────┐      │
│ │⚙️ Backend  │ │🎨 Frontend │      │
│ │- Django    │ │- React     │      │
│ │- PostgreSQL│ │- Vite      │      │
│ │- Redis     │ │- PWA       │      │
│ └────────────┘ └────────────┘      │
│                                     │
│ ┌────────────┐ ┌────────────┐      │
│ │🧠 ML       │ │☁️ Cloud    │      │
│ │- TensorFlow│ │- Docker    │      │
│ │- PyTorch   │ │- Kubernetes│      │
│ │- YOLO      │ │- AWS       │      │
│ └────────────┘ └────────────┘      │
└─────────────────────────────────────┘

CARDS (4):
- Backend: Django, PostgreSQL, Redis
- Frontend: React, Vite, PWA
- ML: TensorFlow, PyTorch, YOLO
- Cloud: Docker, Kubernetes, AWS
```

### 5️⃣ SECCIÓN IMPACTO (Gradiente verde)
```
┌─────────────────────────────────────┐
│ Nuestro Impacto                     │
│                                     │
│ Cambiando el Mundo                  │
│                                     │
│ ┌──────────┐ ┌──────────┐          │
│ │📉 85%    │ │🌱 60%    │          │
│ │Reducción │ │Menos     │          │
│ │costos    │ │emisiones │          │
│ └──────────┘ └──────────┘          │
│                                     │
│ ┌──────────┐ ┌──────────┐          │
│ │⚡ 95%    │ │📊 24/7   │          │
│ │Precisión │ │Monitoreo │          │
│ │IA        │ │continuo  │          │
│ └──────────┘ └──────────┘          │
└─────────────────────────────────────┘

CARDS (4):
- 85% Reducción de costos
- 60% Menos emisiones
- 95% Precisión IA
- 24/7 Monitoreo continuo
```

### 6️⃣ SECCIÓN IA - DEMO INTERACTIVA ⭐
```
┌─────────────────────────────────────┐
│ Probá Nuestra IA                    │
│                                     │
│ Clasificación Inteligente de Residuos
│                                     │
│ [Preview Imagen]  [Controles]      │
│ ┌────────────┐  [Cámara] [Archivo] │
│ │📷         │  [Eliminar]           │
│ │Captura o  │                      │
│ │sube foto  │  Información...      │
│ └────────────┘                      │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Resultado IA (si se procesó)    ││
│ │ ├── Clasificación: Orgánico      ││
│ │ ├── Confianza: 92.5%             ││
│ │ └── Top predicciones...          ││
│ └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘

ELEMENTOS:
- Preview de imagen (600x400px)
- Botones: Cámara, Subir, Eliminar
- Procesador IA con spinner
- Resultados con clasificación
```

### 7️⃣ CTA FINAL
```
┌─────────────────────────────────────┐
│ ¿Listo para ser parte del cambio?  │
│                                     │
│ Únete a EcoTachosTec y construyamos │
│ ciudades más sostenibles.           │
│                                     │
│ [Registrarse Gratis] [Iniciar Sesión]
└─────────────────────────────────────┘
```

---

## 💻 Código Completo

### LandingPage.jsx (724 líneas)

```jsx
import { useContext, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import CameraCapture from "../../components/CameraCapture/CameraCapture";
import AIProcessor from "../../components/AIProcessor/AIProcessor";
import {
  Leaf, Target, Lightbulb, Globe, Radio, Thermometer,
  MapPin, Battery, Settings, Palette, Brain, Cloud,
  TrendingDown, Zap, CheckCircle, ArrowRight,
  ArrowDown, BarChart3, Recycle, Trash2, Scan,
  Camera, Upload, CheckCircle2, AlertCircle
} from "lucide-react";

import "./landingPage.css";

export default function LandingPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    tachos: 0,
    detecciones: 0,
    ubicaciones: 0,
  });

  // Estado para modal de cámara
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const fileInputRef = useRef(null);

  // Refs para intersection observer
  const heroRef = useRef(null);
  const proyectoRef = useRef(null);
  const tachosRef = useRef(null);
  const tecnologiaRef = useRef(null);
  const impactoRef = useRef(null);
  const iaSectionRef = useRef(null);

  const [visibleSections, setVisibleSections] = useState({
    proyecto: false,
    tachos: false,
    tecnologia: false,
    impacto: false,
    ia: false,
  });

  useEffect(() => {
    loadPublicStats();
    setupIntersectionObserver();
    setupParallaxEffect();
  }, []);

  // Cargar estadísticas públicas
  const loadPublicStats = async () => {
    try {
      const [tachosRes, deteccionesRes, ubicacionesRes] = await Promise.all([
        api.get("/tachos/"),
        api.get("/detecciones/"),
        api.get("/ubicacion/cantones/"),
      ]);

      // Animar contadores
      animateCount('tachos', 0, tachosRes.data.length || 0, 2000);
      animateCount('detecciones', 0, deteccionesRes.data.length || 0, 2000);
      animateCount('ubicaciones', 0, ubicacionesRes.data.length || 0, 2000);
    } catch (error) {
      console.error("Error cargando estadísticas públicas", error);
    }
  };

  // Animar números de forma gradual
  const animateCount = (key, start, end, duration) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);

      setStats(prev => ({ ...prev, [key]: current }));

      if (progress === 1) clearInterval(timer);
    }, 16);
  };

  // Intersection Observer para reveal animations
  const setupIntersectionObserver = () => {
    const options = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setVisibleSections(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    }, options);

    [proyectoRef, tachosRef, tecnologiaRef, impactoRef, iaSectionRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  };

  // Efecto parallax al hacer scroll
  const setupParallaxEffect = () => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');

      parallaxElements.forEach((el, index) => {
        const speed = 0.5 + index * 0.1;
        const yPos = -(scrolled * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  };

  // Capturar imagen desde cámara
  const handleImageCapture = (imageData) => {
    setCapturedImage(imageData);
    setShowAIProcessor(true);
    setShowCameraModal(false);
    
    // Scroll automático a sección de IA
    setTimeout(() => {
      iaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Subir imagen desde archivo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target.result);
        setShowAIProcessor(true);
        
        setTimeout(() => {
          iaSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenCamera = () => {
    setShowCameraModal(true);
  };

  const handleOpenFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleResetImage = () => {
    setCapturedImage(null);
    setShowAIProcessor(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="landing-page">

      {/* ============= HERO SECTION ============= */}
      <section ref={heroRef} id="inicio" className="hero-section">

        <div className="hero-background">
          <div className="hero-circle hero-circle-1 parallax-element"></div>
          <div className="hero-circle hero-circle-2 parallax-element"></div>
          <div className="hero-circle hero-circle-3 parallax-element"></div>

          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}></div>
            ))}
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge fade-in">
            <Leaf size={16} />
            <span>Tecnología Verde del Futuro</span>
          </div>

          <h1 className="hero-title slide-up">
            Gestión Inteligente de
            <span className="hero-highlight"> Residuos</span>
          </h1>

          <p className="hero-description slide-up" style={{ animationDelay: "0.2s" }}>
            Revolucionando el manejo de desechos con IoT, Inteligencia Artificial
            y tecnología de punta.
          </p>

          <div className="hero-actions slide-up" style={{ animationDelay: "0.4s" }}>
            {user ? (
              <Link to="/portal" className="btn-hero btn-hero-primary">
                <BarChart3 size={20} />
                <span>Acceder al Portal</span>
                <ArrowRight size={20} className="btn-arrow" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-hero btn-hero-primary">
                  <span>Comenzar Ahora</span>
                  <ArrowRight size={20} className="btn-arrow" />
                </Link>

                <Link to="/login" className="btn-hero btn-hero-secondary">
                  <span>Iniciar Sesión</span>
                </Link>
              </>
            )}
          </div>

          <div className="hero-stats slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="hero-stat-item">
              <div className="hero-stat-value">{stats.tachos}+</div>
              <div className="hero-stat-label">Tachos Activos</div>
            </div>

            <div className="hero-stat-divider"></div>

            <div className="hero-stat-item">
              <div className="hero-stat-value">{stats.detecciones}+</div>
              <div className="hero-stat-label">Detecciones IA</div>
            </div>

            <div className="hero-stat-divider"></div>

            <div className="hero-stat-item">
              <div className="hero-stat-value">{stats.ubicaciones}+</div>
              <div className="hero-stat-label">Ubicaciones</div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span>Descubre más</span>
          <ArrowDown size={24} className="scroll-arrow" />
        </div>
      </section>

      {/* ============= SECCIÓN PROYECTO ============= */}
      <section
        ref={proyectoRef}
        id="proyecto"
        className={`section section-light ${visibleSections.proyecto ? "section-visible" : ""}`}
      >
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Leaf size={16} />
              <span>Nuestra Misión</span>
            </span>

            <h2 className="section-title">El Proyecto EcoTachosTec</h2>

            <p className="section-description">
              Solución integral basada en IoT, análisis de datos e IA para transformar la gestión de residuos.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card" data-index="0">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #95D5B2 0%, #74C69D 100%)" }}>
                <Target size={40} />
              </div>
              <h3 className="feature-title">Objetivo</h3>
              <p className="feature-description">
                Optimizar la recolección con monitoreo inteligente y rutas basadas en datos reales.
              </p>
            </div>

            <div className="feature-card" data-index="1">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #A2D2FF 0%, #BDE0FE 100%)" }}>
                <Lightbulb size={40} />
              </div>
              <h3 className="feature-title">Innovación</h3>
              <p className="feature-description">
                Sensores IoT y machine learning para clasificación y predicción avanzada.
              </p>
            </div>

            <div className="feature-card" data-index="2">
              <div className="feature-icon" style={{ background: "linear-gradient(135deg, #CAFFBF 0%, #9BF6FF 100%)" }}>
                <Globe size={40} />
              </div>
              <h3 className="feature-title">Sostenibilidad</h3>
              <p className="feature-description">
                Reducción de CO₂ y uso eficiente de recursos alineado con los ODS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============= SECCIÓN TACHOS ============= */}
      <section
        ref={tachosRef}
        id="tachos"
        className={`section section-dark ${visibleSections.tachos ? "section-visible" : ""}`}
      >
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge light">
              <Trash2 size={16} />
              <span>Tecnología IoT</span>
            </span>

            <h2 className="section-title light">Nuestros Tachos Inteligentes</h2>

            <p className="section-description light">
              Equipados con sensores avanzados que monitorean llenado, tipo de residuo y ambiente.
            </p>
          </div>

          <div className="tachos-showcase">
            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <Radio size={48} />
              </div>
              <h3 className="tacho-feature-title">Sensores Ultrasónicos</h3>
              <p className="tacho-feature-text">Medición precisa del nivel de llenado</p>
            </div>

            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <Thermometer size={48} />
              </div>
              <h3 className="tacho-feature-title">Monitoreo Ambiental</h3>
              <p className="tacho-feature-text">Control de temperatura y humedad</p>
            </div>

            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <MapPin size={48} />
              </div>
              <h3 className="tacho-feature-title">Geolocalización GPS</h3>
              <p className="tacho-feature-text">Ubicación exacta para optimizar rutas</p>
            </div>

            <div className="tacho-feature">
              <div className="tacho-feature-icon">
                <Scan size={48} />
              </div>
              <h3 className="tacho-feature-title">Clasificación IA</h3>
              <p className="tacho-feature-text">Detecta y clasifica residuos automáticamente</p>
            </div>
          </div>

          {!user && (
            <div className="cta-box">
              <h3 className="cta-title">¿Quieres ver datos en tiempo real?</h3>
              <p className="cta-description">
                Regístrate para acceder al panel completo.
              </p>

              <Link to="/register" className="btn-hero btn-hero-primary">
                <span>Crear Cuenta Gratis</span>
                <ArrowRight size={20} className="btn-arrow" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============= SECCIÓN TECNOLOGÍA ============= */}
      <section
        ref={tecnologiaRef}
        id="tecnologia"
        className={`section section-light ${visibleSections.tecnologia ? "section-visible" : ""}`}
      >
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Brain size={16} />
              <span>Inteligencia Artificial</span>
            </span>

            <h2 className="section-title">Tecnología de Vanguardia</h2>

            <p className="section-description">
              Combinamos IoT, Machine Learning y Cloud Computing en una plataforma escalable.
            </p>
          </div>

          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-card-header">
                <Settings size={32} className="tech-icon" />
                <h3 className="tech-title">Backend Robusto</h3>
              </div>
              <ul className="tech-list">
                <li><CheckCircle size={16} /> Django REST Framework</li>
                <li><CheckCircle size={16} /> PostgreSQL + PostGIS</li>
                <li><CheckCircle size={16} /> Redis</li>
                <li><CheckCircle size={16} /> Celery</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <Palette size={32} className="tech-icon" />
                <h3 className="tech-title">Frontend Moderno</h3>
              </div>
              <ul className="tech-list">
                <li><CheckCircle size={16} /> React + Vite</li>
                <li><CheckCircle size={16} /> Diseño responsive</li>
                <li><CheckCircle size={16} /> Animaciones fluidas</li>
                <li><CheckCircle size={16} /> PWA</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <Brain size={32} className="tech-icon" />
                <h3 className="tech-title">Machine Learning</h3>
              </div>
              <ul className="tech-list">
                <li><CheckCircle size={16} /> TensorFlow / PyTorch</li>
                <li><CheckCircle size={16} /> Clasificación IA</li>
                <li><CheckCircle size={16} /> Predicción de llenado</li>
                <li><CheckCircle size={16} /> Optimización de rutas</li>
              </ul>
            </div>

            <div className="tech-card">
              <div className="tech-card-header">
                <Cloud size={32} className="tech-icon" />
                <h3 className="tech-title">Infraestructura</h3>
              </div>
              <ul className="tech-list">
                <li><CheckCircle size={16} /> Azure / AWS</li>
                <li><CheckCircle size={16} /> Docker + Kubernetes</li>
                <li><CheckCircle size={16} /> CI/CD</li>
                <li><CheckCircle size={16} /> Monitoreo 24/7</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============= SECCIÓN IMPACTO ============= */}
      <section
        ref={impactoRef}
        id="impacto"
        className={`section section-gradient ${visibleSections.impacto ? "section-visible" : ""}`}
      >
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge light">
              <Recycle size={16} />
              <span>Nuestro Impacto</span>
            </span>

            <h2 className="section-title light">Cambiando el Mundo</h2>

            <p className="section-description light">
              Cada tacho inteligente aporta a un futuro más limpio.
            </p>
          </div>

          <div className="impact-grid">
            <div className="impact-card">
              <TrendingDown size={48} className="impact-icon" />
              <div className="impact-number">85%</div>
              <div className="impact-label">Reducción de costos</div>
            </div>

            <div className="impact-card">
              <Leaf size={48} className="impact-icon" />
              <div className="impact-number">60%</div>
              <div className="impact-label">Menos emisiones</div>
            </div>

            <div className="impact-card">
              <Zap size={48} className="impact-icon" />
              <div className="impact-number">95%</div>
              <div className="impact-label">Precisión IA</div>
            </div>

            <div className="impact-card">
              <BarChart3 size={48} className="impact-icon" />
              <div className="impact-number">24/7</div>
              <div className="impact-label">Monitoreo continuo</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============= SECCIÓN IA DEMOSTRATIVA ============= */}
      <section 
        ref={iaSectionRef} 
        id="ia" 
        className={`section section-light ${visibleSections.ia ? "section-visible" : ""}`}
        style={{ paddingTop: 'var(--space-xxl)', paddingBottom: 'var(--space-xxl)' }}
      >
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">
              <Brain size={16} />
              <span>Probá Nuestra IA</span>
            </span>

            <h2 className="section-title">Clasificación Inteligente de Residuos</h2>

            <p className="section-description">
              Captura o sube una foto para que nuestra IA analice y clasifique automáticamente 
              el tipo de residuo en tiempo real usando YOLO + RoboFlow.
            </p>
          </div>

          <div className="ia-camera-container">
            <div className="camera-preview-section">
              <div className="camera-preview-wrapper">
                <div className="camera-preview">
                  {capturedImage ? (
                    <>
                      <img 
                        src={capturedImage} 
                        alt="Imagen para análisis" 
                        className="camera-preview-image"
                      />
                      <div className="preview-overlay">
                        <div className="preview-badge">
                          <CheckCircle2 size={16} />
                          <span>Imagen lista para análisis</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="camera-placeholder">
                      <Camera size={64} className="camera-placeholder-icon" />
                      <p className="camera-placeholder-text">
                        Captura una foto o sube una imagen para analizar con IA
                      </p>
                      <div className="camera-placeholder-hint">
                        <Scan size={20} />
                        <span>La IA detectará y clasificará automáticamente</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="camera-controls-section">
                <div className="camera-controls-grid">
                  <button 
                    className="camera-control-btn primary"
                    onClick={handleOpenCamera}
                  >
                    <Camera size={20} />
                    <span>Abrir Cámara</span>
                  </button>

                  <button 
                    className="camera-control-btn secondary"
                    onClick={handleOpenFileSelector}
                  >
                    <Upload size={20} />
                    <span>Subir Imagen</span>
                  </button>

                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />

                  {capturedImage && (
                    <button 
                      className="camera-control-btn reset"
                      onClick={handleResetImage}
                    >
                      <span>×</span>
                      <span>Eliminar</span>
                    </button>
                  )}
                </div>

                <div className="camera-info">
                  <Scan size={16} />
                  <span>
                    {capturedImage 
                      ? "La imagen está lista. Haz clic en 'Iniciar Análisis IA' para procesarla." 
                      : "Utiliza cámara en vivo o sube una imagen existente para clasificar residuos."
                    }
                  </span>
                </div>
              </div>
            </div>

            {showAIProcessor && capturedImage && (
              <div className="ai-processor-wrapper">
                <AIProcessor capturedImage={capturedImage} />
              </div>
            )}

            {!capturedImage && (
              <div className="ia-info-section">
                <div className="ia-info-card">
                  <div className="ia-info-header">
                    <Zap size={24} />
                    <h4>¿Cómo funciona?</h4>
                  </div>
                  <div className="ia-info-steps">
                    <div className="ia-step">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <strong>Captura o sube</strong> una imagen de residuos
                      </div>
                    </div>
                    <div className="ia-step">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <strong>Inicia el análisis</strong> con nuestro modelo YOLO
                      </div>
                    </div>
                    <div className="ia-step">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <strong>Recibe resultados</strong> detallados de clasificación
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============= CTA FINAL ============= */}
      {!user && (
        <section className="final-cta">
          <div className="final-cta-content">
            <h2 className="final-cta-title">¿Listo para ser parte del cambio?</h2>
            <p className="final-cta-description">
              Únete a EcoTachosTec y construyamos ciudades más sostenibles.
            </p>

            <div className="final-cta-actions">
              <Link to="/register" className="btn-hero btn-hero-primary btn-hero-lg">
                <span>Registrarse Gratis</span>
                <ArrowRight size={24} className="btn-arrow" />
              </Link>

              <Link to="/login" className="btn-hero btn-hero-secondary btn-hero-lg">
                <span>Iniciar Sesión</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE CÁMARA */}
      {showCameraModal && (
        <CameraCapture
          onCapture={handleImageCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}

    </div>
  );
}
```

---

## 🎨 Estilos CSS Principales

### Animaciones Clave
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

### Classes Principales

#### Hero Section
```css
.hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

.hero-circle {
  position: absolute;
  border-radius: 50%;
  animation: float 20s infinite ease-in-out;
  filter: blur(40px);
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 800;
  color: #1e293b;
}

.hero-highlight {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-xl);
  border-radius: var(--radius-xl);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  border: none;
}

.btn-hero-primary {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
  color: white;
  box-shadow: 0 8px 24px rgba(45, 106, 79, 0.3);
}

.btn-hero-primary:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(45, 106, 79, 0.4);
}
```

#### Sections
```css
.section {
  padding: calc(var(--space-xxl) * 2) var(--space-xl);
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.section-visible {
  opacity: 1;
  transform: translateY(0);
}

.section-dark {
  background: linear-gradient(135deg, #1E1E2F 0%, #2A2A3E 100%);
}

.section-gradient {
  background: linear-gradient(135deg, #2d6a4f, #40916c);
}
```

#### Feature Cards
```css
.feature-card {
  padding: var(--space-xl);
  background: white;
  border-radius: var(--radius-xl);
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 12px 40px rgba(45, 106, 79, 0.15);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--space-lg);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}
```

---

## 🔄 Flujos de Interacción

### Captura de Imagen
```
Usuario presiona "Abrir Cámara"
    ↓
Modal CameraCapture abre
    ↓
Usuario presiona botón de captura
    ↓
handleImageCapture(imageData)
    ↓
setCapturedImage(imageData)
    ↓
setShowAIProcessor(true)
    ↓
Scroll automático a sección IA
    ↓
Se muestra AIProcessor con la imagen
    ↓
IA procesa y muestra resultados
```

### Subida de Archivo
```
Usuario presiona "Subir Imagen"
    ↓
fileInputRef.click()
    ↓
Usuario selecciona archivo
    ↓
handleImageUpload(event)
    ↓
Validaciones:
  ✓ Es imagen
  ✓ < 5MB
    ↓
FileReader.readAsDataURL()
    ↓
setCapturedImage(result)
    ↓
setShowAIProcessor(true)
    ↓
Scroll automático
    ↓
AIProcessor procesa
```

---

## 📊 Características Técnicas

| Característica | Descripción |
|---|---|
| **Responsive** | Adapta a desktop, tablet, mobile con clamp() |
| **Animaciones** | Parallax, reveal, shimmer, float, bounce |
| **Intersection Observer** | Reveal animations al scrollear |
| **Geolocalización** | N/A (solo en portal) |
| **API Calls** | GET /tachos/, /detecciones/, /ubicacion/ |
| **Modal Camera** | CameraCapture component |
| **AI Demo** | AIProcessor component |
| **IA Integrada** | POST /ia/detect/ |
| **Contadores Animados** | Incrementos suaves |
| **Parallax Effect** | Movimiento de elementos al scroll |

---

## 🚀 Rutas Relacionadas

```javascript
// Ruta actual
/home        → LandingPage (pública)

// Navegación desde Landing
/register    → Página de registro
/login       → Página de login
/portal      → Portal de usuario (si autenticado)
```

---

## 📱 Responsive Breakpoints

```css
/* Desktop: 1024px+ */
- Grids completos
- Animations activas
- Parallax enabled

/* Tablet: 768px - 1023px */
- Grid adapta
- Font sizes reducidos
- Espaciado ajustado

/* Mobile: < 768px */
- Stack vertical
- Padding mínimo
- Animaciones simplificadas
- Font clamp()
```

---

## 🎯 Conclusión

La Landing Page de LandingPage.jsx es una página de presentación premium con:

✅ **7 secciones principales** con reveal animations
✅ **Demo interactiva de IA** para clasificar residuos
✅ **Diseño premium** con gradientes y animaciones fluidas
✅ **Responsive completo** adaptable a todos los dispositivos
✅ **CTAs estratégicos** para conversión
✅ **Integración con componentes** (CameraCapture, AIProcessor)
✅ **Estadísticas dinámicas** desde API
✅ **Efecto parallax** y scroll animations

**Status**: ✅ Producción
**Líneas**: 724 JSX + 1819 CSS
**Version**: 1.0.0
