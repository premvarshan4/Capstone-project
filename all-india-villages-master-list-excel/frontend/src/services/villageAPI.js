import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';
const API_KEY = 'key_5dm3lq4y7eo';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY,
  },
});

export const villageAPI = {
  getStats: async () => {
    const response = await apiClient.get('/api/v1/stats');
    return response.data;
  },
  getStates: async () => {
    const response = await apiClient.get('/api/v1/states');
    return response.data;
  },
  getDistricts: async (state) => {
    const response = await apiClient.get(`/api/v1/districts/${state}`);
    return response.data;
  },
  getSubdistricts: async (state, district) => {
    const response = await apiClient.get(`/api/v1/subdistricts/${state}/${district}`);
    return response.data;
  },
  getVillages: async (state, district, subdistrict) => {
    const response = await apiClient.get(`/api/v1/villages/${state}/${district}/${subdistrict}`);
    return response.data;
  },
  searchVillages: async (query) => {
    const response = await apiClient.get('/api/v1/search', {
      params: { q: query },
    });
    return response.data;
  },
};

export default apiClient;