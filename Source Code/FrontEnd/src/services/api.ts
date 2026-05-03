import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');

  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }

  config.headers['Content-Type'] = 'application/json';

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;