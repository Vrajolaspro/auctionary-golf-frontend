import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3333";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("session_token");
  if (token) config.headers["X-Authorization"] = token;
  return config;
});
