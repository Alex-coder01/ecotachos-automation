// src/routes/AppRouter.jsx - VERSIÓN COMPLETA CORREGIDA
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Layouts
import Layout from "../components/Layout/Layout";
import UserLayout from "../components/Layout/UserLayout";

// Admin Pages
import Dashboard from "../pages/Dashboard/Dashboard";
import UsuarioList from "../pages/Usuarios/UsuarioList";
import UsuarioForm from "../pages/Usuarios/UsuarioForm";
import UbicacionList from "../pages/Ubicaciones/UbicacionList";
import UbicacionForm from "../pages/Ubicaciones/UbicacionForm";
import TachoList from "../pages/Tachos/TachoList";
import TachoForm from "../pages/Tachos/TachoForm";
import TachoDetail from "../pages/Tachos/TachoDetail";
import DeteccionList from "../pages/Detecciones/DeteccionList";
import DeteccionDetail from "../pages/Detecciones/DeteccionDetail";

// Auth & Profile Pages
import Profile from "../pages/Auth/Profile";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

// User Pages
import LandingPage from "../pages/User/LandingPage";
import UserPortal from "../pages/User/UserPortal";
import TachoDetailUser from "../pages/User/TachoDetailUser";

// ========================
// PROTECTED ROUTES
// ========================
function ProtectedRoute({ children, requireAdmin = false }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && user.rol !== "admin") {
    return <Navigate to="/portal" replace />;
  }

  return children;
}

// ========================
// PUBLIC ROUTES
// ========================
function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Navigate to={user.rol === "admin" ? "/" : "/portal"} replace />;
  }

  return children;
}

// ========================
// UNAUTHENTICATED ROUTES (sin redirección automática)
// ========================
function UnauthenticatedRoute({ children }) {
  // Estas rutas son accesibles tanto para usuarios autenticados como no autenticados
  // No redirigimos automáticamente
  return children;
}

// ========================
// APP ROUTER PRINCIPAL
// ========================
export default function AppRouter() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>

        {/* ======================== */}
        {/* PUBLIC ROUTES (UserLayout) */}
        {/* ======================== */}
        <Route element={<UserLayout />}>
          <Route path="/home" element={<LandingPage />} />

          {/* Login - Solo para no autenticados */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          {/* Register - Solo para no autenticados */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Forgot Password - Accesible siempre */}
          <Route
            path="/forgot-password"
            element={
              <UnauthenticatedRoute>
                <ForgotPassword />
              </UnauthenticatedRoute>
            }
          />

          {/* Reset Password - Accesible siempre */}
          <Route
            path="/reset-password/:uid/:token"
            element={
              <UnauthenticatedRoute>
                <ResetPassword />
              </UnauthenticatedRoute>
            }
          />

          {/* User Portal - Solo para usuarios autenticados no-admin */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <UserPortal />
              </ProtectedRoute>
            }
          />

          {/* Detalle de Tacho para Usuarios - Solo para usuarios autenticados no-admin */}
          <Route
            path="/tachos/:id"
            element={
              <ProtectedRoute>
                <TachoDetailUser />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* ======================== */}
        {/* ADMIN ROUTES (Layout) */}
        {/* ======================== */}
        <Route
          element={
            <ProtectedRoute requireAdmin>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Perfil */}
          <Route path="/perfil" element={<Profile />} />

          {/* Usuarios */}
          <Route path="/usuarios" element={<UsuarioList />} />
          <Route path="/usuarios/nuevo" element={<UsuarioForm />} />
          <Route path="/usuarios/editar/:id" element={<UsuarioForm />} />

          {/* Ubicaciones */}
          <Route path="/ubicaciones" element={<UbicacionList />} />
          <Route path="/ubicaciones/nuevo" element={<UbicacionForm />} />
          <Route path="/ubicaciones/editar/:id" element={<UbicacionForm />} />

          {/* Tachos */}
          <Route path="/tachos" element={<TachoList />} />
          <Route path="/tachos/nuevo" element={<TachoForm />} />
          <Route path="/tachos/editar/:id" element={<TachoForm />} />
          <Route path="/admin/tachos/:id" element={<TachoDetail />} />

          {/* Detecciones */}
          <Route path="/detecciones" element={<DeteccionList />} />
          <Route path="/detecciones/:id" element={<DeteccionDetail />} />
        </Route>

        {/* ======================== */}
        {/* FALLBACK */}
        {/* ======================== */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={user.rol === "admin" ? "/" : "/portal"} replace />
            ) : (
              <Navigate to="/home" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}