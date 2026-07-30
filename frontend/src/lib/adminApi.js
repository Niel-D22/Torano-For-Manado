import axios from "axios";

// Sesi admin terpisah dari Supabase: token disimpan di localStorage, dilampirkan
// ke setiap request /admin. Login lewat username+password tetap (backend).
const TOKEN_KEY = "torano_admin_token";
const NAME_KEY = "torano_admin_name";

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

adminApi.interceptors.request.use((config) => {
  const t = localStorage.getItem(TOKEN_KEY);
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      adminLogout();
      const p = window.location.pathname;
      if (p.startsWith("/admin") && p !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  },
);

export async function adminLogin(username, password) {
  const { data } = await adminApi.post("/admin/login", { username, password });
  localStorage.setItem(TOKEN_KEY, data.data.token);
  localStorage.setItem(NAME_KEY, data.data.admin.name);
  return data.data.admin;
}

export function adminLogout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(NAME_KEY);
}

export const getAdminToken = () => localStorage.getItem(TOKEN_KEY);
export const getAdminName = () => localStorage.getItem(NAME_KEY) || "Admin Torano";
