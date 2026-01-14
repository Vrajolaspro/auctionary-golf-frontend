import { api } from "./api";

export async function getMyProfile() {
  const userId = Number(localStorage.getItem("user_id"));
  if (!Number.isFinite(userId)) {
    const err = new Error("Not logged in");
    err.code = "NOT_LOGGED_IN";
    throw err;
  }
  const res = await api.get(`/users/${userId}`);
  return res.data;
}