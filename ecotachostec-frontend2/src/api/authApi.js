// src/api/authApi.js
import axios from "./axiosConfig";

export const login = (credentials) => axios.post("/usuarios/auth/login/", credentials);
export const register = (userData) => axios.post("/usuarios/auth/register/", userData);
export const getProfile = () => axios.get("/usuarios/auth/profile/");
export const updateProfile = (data) => axios.put("/usuarios/auth/profile/", data); // Ojo con la ruta base
export const logout = () => axios.post("/usuarios/auth/logout/");

// --- NUEVAS FUNCIONES ---

// Enviar el token de Google al backend (id_token y opcionalmente access_token)
export const googleLogin = (data) => axios.post("/usuarios/auth/google/", data);

// Solicitar el correo de recuperación
export const requestPasswordReset = (email) => axios.post("/usuarios/auth/request-reset-email/", { email });

// Enviar la nueva contraseña con el token
export const resetPasswordConfirm = (data) => axios.patch("/usuarios/auth/password-reset-complete/", data);