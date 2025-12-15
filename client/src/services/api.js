import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Recipe API methods
export const recipeApi = {
    getAll: () => api.get('/recipes'),
    getOne: (id) => api.get(`/recipes/${id}`),
    create: (data) => api.post('/recipes', data),
    update: (id, data) => api.put(`/recipes/${id}`, data),
    delete: (id) => api.delete(`/recipes/${id}`),
    saveVersion: (id, message) => api.post(`/recipes/${id}/version`, { message }),
    getVersions: (id) => api.get(`/recipes/${id}/versions`),
    restoreVersion: (id, versionId) => api.post(`/recipes/${id}/restore/${versionId}`),
    invite: (id, email, role) => api.post(`/recipes/${id}/invite`, { email, role }),
    removeCollaborator: (id, userId) => api.delete(`/recipes/${id}/collaborator/${userId}`)
};

export default api;
