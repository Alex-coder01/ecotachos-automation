// src/components/Layout/UserLayout.jsx
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./userLayout.css";

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/home") {
      navigate("/home");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/home");
  };

  const navItems = [
    { id: "inicio", label: "Inicio", icon: "" },
    { id: "proyecto", label: "Proyecto", icon: "" },
    { id: "tachos", label: "Nuestros Tachos", icon: "" },
    { id: "tecnologia", label: "Tecnología", icon: "" },
    { id: "impacto", label: "Impacto", icon: "" },
     {id: "ia", label: "IA", icon: "" },
  ];

  return (
    <div className="user-layout">
      {/* Navbar Horizontal */}
      <nav className={`user-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="user-navbar-container">
          {/* Logo */}
          <Link to="/home" className="user-logo">
            <div className="user-logo-icon">🌿</div>
            <div className="user-logo-text">
              <span className="user-logo-title">EcoTachosTec</span>
              <span className="user-logo-subtitle">Smart & Green</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="user-nav-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="user-nav-link"
              >
                <span className="nav-link-icon">{item.icon}</span>
                <span className="nav-link-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="user-nav-actions">
            {user ? (
              <>
                <Link to="/portal" className="btn-user btn-user-primary">
                  Mi Portal
                </Link>
                <button onClick={handleLogout} className="btn-user btn-user-secondary">
                   Salir
                </button>
                <div className="user-avatar-nav">
                  <span className="user-avatar-icon">👤</span>
                  <span className="user-name-nav">{user.nombre || "Usuario"}</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-user btn-user-ghost">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn-user btn-user-primary">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-nav-links">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="mobile-nav-link"
                >
                  <span className="nav-link-icon">{item.icon}</span>
                  <span className="nav-link-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mobile-nav-actions">
              {user ? (
                <>
                  <Link
                    to="/portal"
                    className="btn-user btn-user-primary btn-user-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Mi Portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-user btn-user-secondary btn-user-block"
                  >
                     Salir
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-user btn-user-ghost btn-user-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="btn-user btn-user-primary btn-user-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="user-main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="user-footer">
        <div className="user-footer-container">
          <div className="footer-section">
            <h3 className="footer-title">EcoTachosTec</h3>
            <p className="footer-description">
              Innovación en gestión inteligente de residuos con IoT e
              Inteligencia Artificial para un futuro más sostenible.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Enlaces Rápidos</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => scrollToSection("proyecto")}>
                  Proyecto
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("tecnologia")}>
                  Tecnología
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("impacto")}>
                  Impacto
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Contacto</h4>
            <ul className="footer-contacts">
              <li>📧 info@ecotachostec.com</li>
              <li>📱 +593 983 740 999</li>
              <li>📍 Cuenca, Ecuador</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Síguenos</h4>
            <div className="footer-social">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📷</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">💼</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 EcoTachosTec. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}