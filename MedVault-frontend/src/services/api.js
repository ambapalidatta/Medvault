const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const getAuthToken = () => sessionStorage.getItem("authToken");

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export default API_BASE_URL;
