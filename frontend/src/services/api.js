import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smart_campus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't clear on login attempt itself
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('smart_campus_token');
        localStorage.removeItem('smart_campus_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const servicesApi = {
  getAll: () => api.get('/services'),
};

export const requestsApi = {
  create: (requestData) => api.post('/requests', requestData),
  getMy: (params) => api.get('/requests/my', { params }),
  getById: (id) => api.get(`/requests/${id}`),
};

export const adminApi = {
  getAllRequests: (params) => api.get('/admin/requests', { params }),
  getStatistics: () => api.get('/admin/statistics'),
  assign: (id, data) => api.put(`/admin/requests/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/admin/requests/${id}/status`, data),
  updateDetails: (id, data) => api.put(`/admin/requests/${id}`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getUsers: () => api.get('/admin/users'),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export default api;
