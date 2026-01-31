// src/components/Layout/Layout.jsx
import { Link, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Trash2,
  Brain,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import "./layout.css";

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    {
      path: "/",
      icon: LayoutDashboard,
      label: "Dashboard",
      description: "Panel principal"
    },
    {
      path: "/usuarios",
      icon: Users,
      label: "Usuarios",
      description: "Gestión de usuarios"
    },
    {
      path: "/ubicaciones",
      icon: MapPin,
      label: "Ubicaciones",
      description: "Provincias y cantones"
    },
    {
      path: "/tachos",
      icon: Trash2,
      label: "Tachos",
      description: "Gestión de tachos"
    },
    {
      path: "/detecciones",
      icon: Brain,
      label: "Detecciones IA",
      description: "Análisis inteligente"
    }
    
  ];

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Trash2 className="logo-icon-svg" />
            </div>
            {sidebarOpen && (
              <div className="logo-text">
                <h2 className="logo-title">EcoTachos</h2>
                <span className="logo-subtitle">Smart IoT System</span>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon">
                  <IconComponent className="nav-icon-svg" />
                </span>
                {sidebarOpen && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>


        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <ChevronLeft className="toggle-icon" />
          ) : (
            <ChevronRight className="toggle-icon" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <header className={`topbar ${scrolled ? "scrolled" : ""}`}>
          <div className="topbar-left">
            <h1 className="page-title">Panel Administrativo</h1>
          </div>

          <div className="topbar-right">
            <button className="topbar-btn" aria-label="Notificaciones">
              <Bell className="topbar-icon" />
              <span className="notification-badge">3</span>
            </button>
            <button className="topbar-btn" aria-label="Configuración">
              <Settings className="topbar-icon" />
            </button>

            <Link to="/perfil" className="topbar-btn user-btn">
              <User className="topbar-icon" />
            </Link>

          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>

        <footer className="footer">
          <p>© 2025 EcoTachosTec - Sistema de Gestión Inteligente</p>
        </footer>
      </main>
    </div>
  );
}