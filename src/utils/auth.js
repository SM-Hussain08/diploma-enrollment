// src/utils/auth.js
import { ADMIN_USERS } from "../admin/adminUsers";

export const ADMIN_TOKEN_KEY = "oep_admin_token";

export function loginAdmin(username, password) {
  if (ADMIN_USERS[username] && ADMIN_USERS[username] === password) {
    const token = btoa(`${username}:${Date.now()}`);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem("oep_admin_user", username);
    return true;
  }
  return false;
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem("oep_admin_user");
}

export function isAdminLoggedIn() {
  return !!localStorage.getItem(ADMIN_TOKEN_KEY);
}
