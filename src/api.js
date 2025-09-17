import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dynamic-tranquility-production.up.railway.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to ensure all requests have proper headers
api.interceptors.request.use(
  (config) => {
    // Ensure Content-Type is set for POST, PUT, PATCH requests
    if (['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;


