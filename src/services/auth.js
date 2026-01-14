import { api } from "./api";

export function getSession() {
  const token = localStorage.getItem("session_token");
  const userId = Number(localStorage.getItem("user_id"));
  return {
    token: token || "",
    userId: Number.isFinite(userId) ? userId : null,
    isLoggedIn: !!token,
  };
}

export function setSession({ user_id, session_token }) {
  localStorage.setItem("user_id", String(user_id));
  localStorage.setItem("session_token", session_token);
}

export function clearSession() {
  localStorage.removeItem("user_id");
  localStorage.removeItem("session_token");
}

export async function login(email, password) {
  const res = await api.post("/login", { email, password });
  setSession(res.data);
  return res.data;
}

export async function register(first_name, last_name, email, password) {
  const res = await api.post("/users", { first_name, last_name, email, password });
  return res.data;
}

// ✅ Always clear local session, even if server logout fails
export async function logout() {
  try {
    await api.post("/logout");
  } catch (e) {
    // ignore API failure (server down / token invalid etc.)
  } finally {
    clearSession();
  }
}