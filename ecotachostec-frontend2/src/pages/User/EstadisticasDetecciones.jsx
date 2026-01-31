// src/components/EstadisticasDetecciones/EstadisticasDetecciones.jsx
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Brain, TrendingUp, BarChart3 } from 'lucide-react';

const EstadisticasDetecciones = ({ misDetecciones, deteccionesEmpresa, deteccionesPublicas }) => {
  // Calcular estadísticas para mis detecciones
  const statsMis = {
    total: misDetecciones.length,
    porClasificacion: misDetecciones.reduce((acc, det) => {
      const tipo = det.clasificacion?.toLowerCase() || 'otro';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {}),
    confianzaPromedio: misDetecciones.length > 0
      ? misDetecciones.reduce((sum, det) => sum + (parseFloat(det.confianza_ia) || 0), 0) / misDetecciones.length
      : 0,
  };

  // Calcular estadísticas para detecciones de empresa
  const statsEmpresa = {
    total: deteccionesEmpresa.length,
    porClasificacion: deteccionesEmpresa.reduce((acc, det) => {
      const tipo = det.clasificacion?.toLowerCase() || 'otro';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {}),
    confianzaPromedio: deteccionesEmpresa.length > 0
      ? deteccionesEmpresa.reduce((sum, det) => sum + (parseFloat(det.confianza_ia) || 0), 0) / deteccionesEmpresa.length
      : 0,
  };

  // Calcular estadísticas para detecciones públicas
  const statsPublicas = {
    total: deteccionesPublicas.length,
    porClasificacion: deteccionesPublicas.reduce((acc, det) => {
      const tipo = det.clasificacion?.toLowerCase() || 'otro';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {}),
    confianzaPromedio: deteccionesPublicas.length > 0
      ? deteccionesPublicas.reduce((sum, det) => sum + (parseFloat(det.confianza_ia) || 0), 0) / deteccionesPublicas.length
      : 0,
  };

  // Preparar datos para gráficos
  const prepararDatosPie = (stats) => {
    return Object.entries(stats.porClasificacion).map(([tipo, count]) => ({
      name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
      value: count,
      color: getColorForTipo(tipo)
    }));
  };

  const getColorForTipo = (tipo) => {
    switch(tipo) {
      case 'organico': return '#10b981';
      case 'inorganico': return '#f59e0b';
      case 'reciclable': return '#3b82f6';
      default: return '#9ca3af';
    }
  };

  const datosComparacion = [
    { tipo: 'Mis Detecciones', total: statsMis.total, confianza: statsMis.confianzaPromedio },
    { tipo: 'Mi Empresa', total: statsEmpresa.total, confianza: statsEmpresa.confianzaPromedio },
    { tipo: 'Públicas', total: statsPublicas.total, confianza: statsPublicas.confianzaPromedio },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (misDetecciones.length === 0 && deteccionesEmpresa.length === 0 && deteccionesPublicas.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
        <Brain size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
        <h4>No hay datos de detecciones para mostrar</h4>
        <p>Crea algunas detecciones para ver estadísticas</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain size={20} color="#10b981" />
            <h4 style={{ margin: 0 }}>Mis Detecciones</h4>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            {statsMis.total}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Confianza promedio: {statsMis.confianzaPromedio.toFixed(1)}%
          </div>
        </div>

        {statsEmpresa.total > 0 && (
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={20} color="#3b82f6" />
              <h4 style={{ margin: 0 }}>Mi Empresa</h4>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
              {statsEmpresa.total}
            </div>
            <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Confianza promedio: {statsEmpresa.confianzaPromedio.toFixed(1)}%
            </div>
          </div>
        )}

        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={20} color="#f59e0b" />
            <h4 style={{ margin: 0 }}>Públicas</h4>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            {statsPublicas.total}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Confianza promedio: {statsPublicas.confianzaPromedio.toFixed(1)}%
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Gráfico de comparación */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ marginBottom: '1rem' }}>Comparación Total</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosComparacion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Cantidad" fill="#8884d8" />
              <Bar dataKey="confianza" name="Confianza %" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de distribución de mis detecciones */}
        {statsMis.total > 0 && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '1rem' }}>Distribución Mis Detecciones</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepararDatosPie(statsMis)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepararDatosPie(statsMis).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráfico de distribución de detecciones públicas */}
        {statsPublicas.total > 0 && (
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h4 style={{ marginBottom: '1rem' }}>Distribución Detecciones Públicas</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepararDatosPie(statsPublicas)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {prepararDatosPie(statsPublicas).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadisticasDetecciones;