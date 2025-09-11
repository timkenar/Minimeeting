// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Authentication endpoints
    ADMIN_LOGIN: `${API_BASE_URL}/meetings/admin/login/`,
    ADMIN_LOGOUT: `${API_BASE_URL}/meetings/admin/logout/`,
    
    // Meeting endpoints
    MEETINGS_LIST: `${API_BASE_URL}/meetings/list/`,
    MEETINGS_CREATE: `${API_BASE_URL}/meetings/admin/create/`,
    MEETINGS_SUBMIT: `${API_BASE_URL}/meetings/`,
    MEETINGS_DETAIL: (id: number) => `${API_BASE_URL}/meetings/${id}/`,
    MEETINGS_UPDATE: (id: number) => `${API_BASE_URL}/meetings/${id}/`,
    MEETINGS_DELETE: (id: number) => `${API_BASE_URL}/meetings/${id}/`,
  }
};

// Helper function to create authenticated headers
export const createAuthHeaders = (token: string) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Helper function for basic headers
export const createBasicHeaders = () => ({
  'Content-Type': 'application/json',
});

export default API_CONFIG;