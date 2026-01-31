import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPasswordConfirm } from "../../api/authApi";
import "./auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { uid, token } = useParams(); // Obtiene params de la URL

  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await resetPasswordConfirm({
        password: passwords.password,
        token: token,
        uidb64: uid
      });
      setMessage("Contraseña actualizada con éxito. Redirigiendo...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("El enlace es inválido o ha expirado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Nueva Contraseña</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <div className="form-group">
              <label className="form-label">Nueva Contraseña</label>
              <input type="password" name="password" className="form-input" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <input type="password" name="confirmPassword" className="form-input" onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Guardando..." : "Cambiar Contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}