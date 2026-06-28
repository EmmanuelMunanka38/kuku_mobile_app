import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Always use production backend. For local development,
// change USE_LOCAL to true and run a local backend on port 3000.
const PROD_API_URL = 'https://kuku-backend-b8x4.onrender.com/api';
const USE_LOCAL = false;
const LOCAL_API_URL = 'http://localhost:3000/api';

const API_BASE = USE_LOCAL ? LOCAL_API_URL : PROD_API_URL;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
    }
    return Promise.reject(error);
  }
);

export default api;
export { PROD_API_URL, LOCAL_API_URL };
