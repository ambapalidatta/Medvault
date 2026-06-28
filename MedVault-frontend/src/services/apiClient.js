export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://medvault-backend-ni3i.onrender.com/api"
).replace(/\/$/, "");

export const getAuthToken = () => sessionStorage.getItem("authToken");

export const getAdminAuthToken = () =>
  sessionStorage.getItem("adminAuthToken") || getAuthToken();

export function buildApiUrl(path = "") {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildHeaders(options = {}, token) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function handleUnauthorized(response) {
  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem("loggedInUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("adminAuthToken");

    if (!window.location.hash.includes("login")) {
      window.location.hash = "";
    }
  }
}

export async function request(path, options = {}) {
  const token = options.admin ? getAdminAuthToken() : getAuthToken();

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: buildHeaders(options, token),
  });

  handleUnauthorized(response);

  if (!response.ok && options.throwOnError) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response;
}

export async function jsonRequest(path, options = {}) {
  const response = await request(path, { ...options, throwOnError: true });

  if (response.status === 204) return null;

  return response.json();
}

export async function safeRequest(path, options = {}) {
  try {
    const response = await request(path, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data,
      };
    }

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Network request failed",
    };
  }
}

export default request;
