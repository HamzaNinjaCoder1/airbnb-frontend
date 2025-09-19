const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

export const BACKEND_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  (isProduction
    ? 'https://dynamic-tranquility-production.up.railway.app'
    : 'http://localhost:5000')
);

export const API_BASE_URL = `${BACKEND_URL}`; 
export const UPLOADS_BASE_URL = `${BACKEND_URL}/uploads/`;
export const SOCKET_URL = 'https://dynamic-tranquility-production.up.railway.app';
export const FRONTEND_ORIGINS = [
  (typeof window !== 'undefined' ? window.location.origin : ''),
  'https://airbnb-frontend-sooty.vercel.app'
];

export default {
  BACKEND_URL,
  API_BASE_URL,
  UPLOADS_BASE_URL,
  SOCKET_URL,
  FRONTEND_ORIGINS,
};