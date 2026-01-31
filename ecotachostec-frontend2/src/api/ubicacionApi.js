// src/api/ubicacionApi.js
import axios from "./axiosConfig";

export const getProvincias = () => axios.get("/ubicacion/provincias/");
export const getCiudades = () => axios.get("/ubicacion/ciudades/");
export const getCantones = () => axios.get("/ubicacion/cantones/");
