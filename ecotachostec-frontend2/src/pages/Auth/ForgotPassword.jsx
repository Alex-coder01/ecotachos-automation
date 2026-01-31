import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../api/authApi";
import "./auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await requestPasswordReset(email);
      setMessage("Si el correo existe, recibirás un enlace para restablecer tu contraseña.");
    } catch (err) {
      setError("Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Link to="/login" className="auth-back-link">← Volver al login</Link>
        <div className="auth-card">
          <h2 className="auth-title">Recuperar Contraseña</h2>
          <p className="auth-subtitle">Ingresa tu correo para buscar tu cuenta.</p>

          <form onSubmit={handleSubmit} className="auth-form" style={{ marginTop: '20px' }}>
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success" style={{ color: 'green', background: '#e6fffa', padding: '10px', borderRadius: '8px' }}>{message}</div>}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}