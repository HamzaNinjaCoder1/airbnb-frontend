// Centralized frontend configuration for backend integration
// Uses Vite's import.meta.env when provided; falls back to sensible defaults

const isProduction = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

// Backend origins
export const BACKEND_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) ||
  (isProduction
    ? 'https://dynamic-tranquility-production.up.railway.app'
    : 'http://localhost:5000')
);

// API base path
export const API_BASE_URL = `${BACKEND_URL}`; // keep full origin; consumers use '/api/data/...'

// Static uploads (served from backend)
export const UPLOADS_BASE_URL = `${BACKEND_URL}/uploads/`;

// Socket.IO endpoint (explicit per request)
export const SOCKET_URL = 'https://dynamic-tranquility-production.up.railway.app';

// Allowed frontend origins (useful for diagnostics/UI, not programmatic CORS)
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


