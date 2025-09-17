import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dynamic-tranquility-production.up.railway.app',
  withCredentials: true,
});

export default api;


