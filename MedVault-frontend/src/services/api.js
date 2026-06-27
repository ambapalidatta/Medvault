import request, { API_BASE_URL, getAuthToken } from "./apiClient.js";

export { API_BASE_URL, getAuthToken };

export async function apiFetch(endpoint, options = {}) {
  return request(endpoint, options);
}

export default API_BASE_URL;
