import request, { API_BASE_URL, buildApiUrl, getAuthToken } from "./apiClient.js";

export { API_BASE_URL, buildApiUrl, getAuthToken };

export async function authFetch(url, options = {}) {
  return request(url, options);
}

export default authFetch;
