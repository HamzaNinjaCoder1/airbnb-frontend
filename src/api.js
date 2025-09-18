import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dynamic-tranquility-production.up.railway.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    // Ensure Content-Type is set for POST, PUT, PATCH requests
    // But do NOT force JSON when sending FormData (e.g., image uploads)
    const method = config.method?.toLowerCase();
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    const hasCustomContentType = !!config.headers['Content-Type'];
    if (['post', 'put', 'patch'].includes(method) && !isFormData && !hasCustomContentType) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;


