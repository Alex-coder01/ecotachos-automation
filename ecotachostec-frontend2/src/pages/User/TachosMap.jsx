// src/pages/User/TachosMap.jsx
import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Trash2, User, MapPin, Building, Battery, Navigation, Eye, Tag } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Función para centrar el mapa cuando cambia la ubicación
function ResetView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
      map.invalidateSize();
    }
  }, [center, map]);
  return null;
}

const TachosMap = ({ tachos, userLocation, onTachoClick }) => {
  const [tachosConCoords, setTachosConCoords] = useState([]);
  const [selectedTacho, setSelectedTacho] = useState(null);

  // Icono personalizado para usuario
  const userIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-icon-user',
      html: renderToStaticMarkup(
        <div style={{
          backgroundColor: '#3b82f6',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid white',
          boxShadow: '0 3px 8px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
          <User size={20} color="white" />
          <div style={{
             position: 'absolute',
             bottom: '-6px',
             left: '50%',
             transform: 'translateX(-50%)',
             width: '0',
             height: '0',
             borderLeft: '6px solid transparent',
             borderRight: '6px solid transparent',
             borderTop: '6px solid #3b82f6'
          }}></div>
        </div>
      ),
      iconSize: [40, 40],
      iconAnchor: [20, 46],
      popupAnchor: [0, -40]
    });
  }, []);

  // Icono personalizado para tachos
  const tachoIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-icon-tacho',
      html: renderToStaticMarkup(
        <div style={{
          backgroundColor: '#10b981',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
        }}>
          <Trash2 size={16} color="white" />
        </div>
      ),
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }, []);

  // Icono para tacho seleccionado
  const selectedTachoIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-icon-tacho-selected',
      html: renderToStaticMarkup(
        <div style={{
          backgroundColor: '#f59e0b',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.6)',
          animation: 'pulse 2s infinite'
        }}>
          <Trash2 size={20} color="white" />
        </div>
      ),
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }, []);

  useEffect(() => {
    const tachosValidos = tachos.filter(tacho => {
      const lat = parseFloat(tacho.ubicacion_lat);
      const lon = parseFloat(tacho.ubicacion_lon);
      return !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
    });
    setTachosConCoords(tachosValidos);
  }, [tachos]);

  // Calcular distancia entre dos puntos
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleTachoClick = (tacho) => {
    setSelectedTacho(tacho);
  };

  // CORRECCIÓN: Función simplificada sin eventos
  const handleVerDetalles = (tacho) => {
    console.log("Ver detalles del tacho:", tacho.id);

    // Llamar al callback pasado desde UserPortal
    if (onTachoClick) {
      onTachoClick(tacho);
    }
  };

  if (!userLocation) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <MapPin className="animate-bounce" size={40} color="#9ca3af" />
        <p style={{ marginTop: '10px', color: '#4b5563', textAlign: 'center' }}>
          Localizando tu posición...
        </p>
      </div>
    );
  }

  const center = [userLocation.lat, userLocation.lon];

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .leaflet-popup-content-wrapper {
            border-radius: 12px !important;
            padding: 8px !important;
          }
          .leaflet-popup-content {
            margin: 8px 12px !important;
            min-width: 200px !important;
          }
        `}
      </style>

      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        onClick={() => setSelectedTacho(null)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <ResetView center={center} />

        {/* Marcador de usuario */}
        <Marker position={center} icon={userIcon} zIndexOffset={1000}>
          <Popup>
            <div style={{ textAlign: 'center', padding: '4px' }}>
              <strong style={{ color: '#1e40af' }}>¡Estás aquí!</strong>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                Ubicación actual
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Marcadores de tachos */}
        {tachosConCoords.map(tacho => {
          const tachoPosition = [parseFloat(tacho.ubicacion_lat), parseFloat(tacho.ubicacion_lon)];
          const distancia = userLocation ? calcularDistancia(
            userLocation.lat, userLocation.lon,
            tachoPosition[0], tachoPosition[1]
          ) : null;

          const isSelected = selectedTacho && selectedTacho.id === tacho.id;
          const icon = isSelected ? selectedTachoIcon : tachoIcon;

          return (
            <Marker
              key={tacho.id}
              position={tachoPosition}
              icon={icon}
              eventHandlers={{
                click: () => handleTachoClick(tacho)
              }}
            >
              <Popup>
                <div style={{ minWidth: '220px' }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      background: '#ecfdf5',
                      padding: '8px',
                      borderRadius: '50%'
                    }}>
                      <Trash2 size={20} color="#10b981"/>
                    </div>
                    <div>
                      <h3 style={{
                        margin: '0 0 4px 0',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#1f2937'
                      }}>
                        {tacho.nombre}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#6b7280'
                      }}>
                        <Tag size={12} />
                        <span>{tacho.codigo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información del tacho */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building size={14} color="#6b7280" />
                        <span style={{ fontSize: '13px', color: '#4b5563' }}>
                          {tacho.empresa_nombre || 'Tacho Público'}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: tacho.estado === 'activo' ? '#d1fae5' :
                                   tacho.estado === 'mantenimiento' ? '#fef3c7' : '#f3f4f6',
                        color: tacho.estado === 'activo' ? '#065f46' :
                               tacho.estado === 'mantenimiento' ? '#92400e' : '#6b7280',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {tacho.estado === 'activo' ? 'Activo' :
                         tacho.estado === 'mantenimiento' ? 'Mantenimiento' : 'Inactivo'}
                      </span>
                    </div>

                    {/* Nivel de llenado */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Battery size={12} color="#6b7280" />
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>Llenado:</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
                          {tacho.nivel_llenado || 0}%
                        </span>
                      </div>
                      <div style={{
                        height: '6px',
                        background: '#e5e7eb',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${tacho.nivel_llenado || 0}%`,
                          background: tacho.nivel_llenado >= 80 ? '#ef4444' :
                                     tacho.nivel_llenado >= 50 ? '#f59e0b' : '#10b981',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Distancia */}
                    {distancia !== null && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '12px',
                        padding: '6px 8px',
                        background: '#eff6ff',
                        borderRadius: '6px'
                      }}>
                        <Navigation size={12} color="#1d4ed8" />
                        <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '500' }}>
                          A {distancia.toFixed(1)} km de tu ubicación
                        </span>
                      </div>
                    )}

                    {/* Coordenadas */}
                    <div style={{
                      fontSize: '10px',
                      color: '#9ca3af',
                      fontFamily: 'monospace',
                      marginBottom: '12px'
                    }}>
                      {tachoPosition[0].toFixed(6)}, {tachoPosition[1].toFixed(6)}
                    </div>
                  </div>

                  {/* Botón de acción - SIN eventos, solo onClick directo */}
                  <button
                    onClick={() => handleVerDetalles(tacho)}
                    style={{
                      width: '100%',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Eye size={14} />
                    Ver Detalles Completos
                  </button>

                  {/* Información adicional en tooltip */}
                  <div style={{
                    fontSize: '10px',
                    color: '#9ca3af',
                    textAlign: 'center',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    Haz clic fuera para cerrar
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Información del tacho seleccionado (sidebar) */}
      {selectedTacho && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '300px',
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: '0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              {selectedTacho.nombre}
            </h3>
            <button
              onClick={() => setSelectedTacho(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <Tag size={14} color="#6b7280" />
              <span style={{ fontSize: '14px', color: '#4b5563' }}>
                Código: {selectedTacho.codigo}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <Building size={14} color="#6b7280" />
              <span style={{ fontSize: '14px', color: '#4b5563' }}>
                {selectedTacho.empresa_nombre || 'Tacho Público'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <MapPin size={14} color="#6b7280" />
              <span style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                {parseFloat(selectedTacho.ubicacion_lat).toFixed(6)}, {parseFloat(selectedTacho.ubicacion_lon).toFixed(6)}
              </span>
            </div>
          </div>

          {/* Botón sidebar - SIN eventos, solo onClick directo */}
          <button
            onClick={() => handleVerDetalles(selectedTacho)}
            style={{
              width: '100%',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Ver Detalle Completo
          </button>
        </div>
      )}
    </div>
  );
};

export default TachosMap;