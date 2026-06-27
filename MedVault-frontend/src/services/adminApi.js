import { API_BASE_URL, getAdminAuthToken, safeRequest, request } from "./apiClient.js";

export { API_BASE_URL };
export const getAdminAuthToken = () => sessionStorage.getItem("adminAuthToken");

export const authFetch = async (url, options = {}) => request(url, { ...options, admin: true });

export const safeFetch = async (url, options = {}) => safeRequest(url, { ...options, admin: true });

export const fetchAdminProfile = async (email = null) => {
  const adminEmail = email || localStorage.getItem("adminEmail") || "admin@medvault.com";
  const response = await authFetch(`/admin/profile/email/${encodeURIComponent(adminEmail)}`);

  if (response.ok) {
    const adminData = await response.json();
    localStorage.setItem("adminEmail", adminData.email);
    return {
      uid: adminData.userId || adminData.adminId || adminData.id,
      adminId: adminData.adminId,
      userId: adminData.userId,
      displayName: adminData.name || `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim(),
      name: adminData.name || `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim(),
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      phone: adminData.phone,
      department: adminData.department,
      photoURL:
        adminData.profilePictureUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.firstName || "Admin")}+${encodeURIComponent(adminData.lastName || "")}&background=6366f1&color=fff&size=200`,
      role: "admin",
    };
  }

  if (adminEmail !== "admin@medvault.com") {
    return fetchAdminProfile("admin@medvault.com");
  }

  throw new Error("Admin profile not found");
};
