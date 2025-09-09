import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// auth
export const loginUser = (payload) => API.post("/login", payload);
export const registerUser = (payload) => API.post("/register", payload);
export const createUser = (payload) => registerUser(payload);

// admin
export const getUsers = () => API.get("/admin/users");
export const getAdminResumes = () => API.get("/admin/resumes");

export default {
  loginUser,
  registerUser,
  createUser,
  getUsers,
  getAdminResumes,
};
