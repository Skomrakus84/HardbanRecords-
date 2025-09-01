import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Music API endpoints
export const musicApi = {
  getAll: () => apiClient.get('/music/releases'),
  create: (data: any) => apiClient.post('/music/releases', data),
  update: (id: number, data: any) => apiClient.patch(`/music/releases/${id}`, data),
  delete: (id: number) => apiClient.delete(`/music/releases/${id}`),
  updateSplits: (id: number, splits: any) => apiClient.patch(`/music/releases/${id}/splits`, { splits }),
};

// Tasks API endpoints
export const tasksApi = {
  getAll: () => apiClient.get('/music/tasks'),
  create: (data: any) => apiClient.post('/music/tasks', data),
  update: (id: number, data: any) => apiClient.patch(`/music/tasks/${id}`, data),
  delete: (id: number) => apiClient.delete(`/music/tasks/${id}`),
};

// AI API endpoints
export const aiApi = {
  generateImage: (prompt: string) => apiClient.post('/ai/generate-images', { prompt }),
  generateContent: (prompt: string) => apiClient.post('/ai/generate-content', { prompt }),
};