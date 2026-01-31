import axios from "./axiosConfig";

export const getTachos = () => axios.get("/tachos/");
export const getTachoById = (id) => axios.get(`/tachos/${id}/`);
export const createTacho = (data) => axios.post("/tachos/", data);
export const updateTacho = (id, data) => axios.put(`/tachos/${id}/`, data);
export const deleteTacho = (id) => axios.delete(`/tachos/${id}/`);
