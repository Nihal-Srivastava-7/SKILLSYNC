import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((req) => {
  const t = localStorage.getItem("token");
  if (t) req.headers.Authorization = `Bearer ${t}`;
  return req;
});

export const getJobs = (params = {}) => API.get("/jobs", { params });

export const getJobSuggestions = (skills = [], page = 1) => {
  const payload = Array.isArray(skills) ? { skills } : { skills: [] };

  return API.post(`/jobs/suggest?page=${page}`, payload);
};

export const getJobDetail = (id) => API.get(`/jobs/${id}`);
