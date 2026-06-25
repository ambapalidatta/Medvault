const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://medvault-backend-ni3i.onrender.com/api";

export const getAuthToken = () => sessionStorage.getItem("authToken");

export function buildApiUrl(url) {
  if (!url) return API_BASE_URL;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export async function authFetch(url, options = {}) {
  const token = getAuthToken();

  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(buildApiUrl(url), {
    ...options,
    headers,
  });
}

export default authFetch;
