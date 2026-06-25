export const getAuthToken = () => sessionStorage.getItem("authToken");

export async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
