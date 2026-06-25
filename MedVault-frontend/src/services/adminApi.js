// API Configuration
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

// JWT token helper for admin protected routes
export const getAdminAuthToken = () => sessionStorage.getItem('adminAuthToken');

export const authFetch = async (url, options = {}) => {
    const token = getAdminAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers
    });
};

// Helper function for safe API calls
export const safeFetch = async (url, options = {}) => {
    try {
        const response = await authFetch(url, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error [${response.status}] ${url}:`, errorText);
            return { success: false, status: response.status, error: errorText };
        }
        
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error(`❌ Network Error ${url}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const fetchAdminProfile = async (email = null) => {
    try {
        // Use provided email or try to get from localStorage or use your admin email
        const adminEmail = email || localStorage.getItem('adminEmail') || 'admin@medvault.com';
        console.log('🔍 Fetching admin profile for:', adminEmail);
        
        const response = await authFetch(`${API_BASE_URL}/admin/profile/email/${encodeURIComponent(adminEmail)}`);
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const adminData = await response.json();
            console.log('✅ Admin profile loaded:', adminData);
            
            // Store email for future use
            localStorage.setItem('adminEmail', adminData.email);
            
            return {
                uid: adminData.userId || adminData.adminId || adminData.id, // Use userId for notifications
                adminId: adminData.adminId,
                userId: adminData.userId, // Store userId separately
                displayName: adminData.name || `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim(),
                name: adminData.name || `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim(),
                firstName: adminData.firstName,
                lastName: adminData.lastName,
                email: adminData.email,
                phone: adminData.phone,
                department: adminData.department,
                photoURL: adminData.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.firstName || 'Admin')}+${encodeURIComponent(adminData.lastName || '')}&background=6366f1&color=fff&size=200`,
                role: 'admin'
            };
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Admin profile not found:', errorData);
            console.log('💡 Trying fallback admin email...');
            
            // Try fallback email
            if (adminEmail !== 'admin@medvault.com') {
                return await fetchAdminProfile('admin@medvault.com');
            }
            
            throw new Error('Admin profile not found');
        }
    } catch (error) {
        console.error('❌ Error fetching admin profile:', error);
        throw error;
    }
};
