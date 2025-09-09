import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// attach JWT
API.interceptors.request.use((req) => {
  const t = localStorage.getItem("token");
  if (t) req.headers.Authorization = `Bearer ${t}`;
  return req;
});

export const getMyResume = () => API.get("/resume/me");
export const savePersonal = (data) => API.put("/resume/personal", data);
export const addEducation = (data) => API.post("/resume/education", data);
export const deleteEducation = (id) => API.delete(`/resume/education/${id}`);
export const setSkills = (skills) => API.put("/resume/skills", { skills });
export const addProject = (data) => API.post("/resume/projects", data);
export const deleteProject = (id) => API.delete(`/resume/projects/${id}`);
export const listTemplates = () => API.get("/resume/templates");
export const applyTemplate = (id) => API.post(`/resume/templates/${id}/apply`);
