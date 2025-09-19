export const BACKEND_URL = 'https://dynamic-tranquility-production.up.railway.app';

export const API_BASE_URL = `${BACKEND_URL}`; 
export const UPLOADS_BASE_URL = `${BACKEND_URL}/uploads/`;
export const SOCKET_URL = 'https://dynamic-tranquility-production.up.railway.app';
export const FRONTEND_ORIGINS = [
  'https://airbnb-frontend-sooty.vercel.app'
];

// Push notifications
export const VAPID_PUBLIC_KEY = 'BP0OJzfIv3gutn2bu2VbP3Y062ZYRhtLNiYxxDe_OM1aueh7bJKcx5S72UzsRs40kFsukwOxfV13oTUJo-3vOFU';
export const API_BASE = BACKEND_URL;

export default {
  BACKEND_URL,
  API_BASE_URL,
  UPLOADS_BASE_URL,
  SOCKET_URL,
  FRONTEND_ORIGINS,
  VAPID_PUBLIC_KEY,
  API_BASE,
};