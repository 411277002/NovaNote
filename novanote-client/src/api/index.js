import api from '../services/api'; // 引入剛才寫好的 axios 實例

// --- 1. 身分驗證相關 (Auth) ---
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// --- 2. 星球相關 (Planets) ---
export const planetAPI = {
  getAll: () => api.get('/planets'),
  create: (data) => api.post('/planets', data),
  update: (id, data) => api.put(`/planets/${id}`, data),
  updatePosition: (id, data) => api.put(`/planets/${id}/position`, data),
  delete: (id) => api.delete(`/planets/${id}`),
};

// --- 3. 筆記相關 (Notes) ---
export const noteAPI = {
  getAll: () => api.get('/notes'),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  move: (id, planetId) => api.put(`/notes/${id}/move`, { planet_id: planetId }),
  updatePosition: (id, x, y) => api.put(`/notes/${id}/position`, { x_pos: x, y_pos: y }),
  delete: (id) => api.delete(`/notes/${id}`),
};

// 預設匯出所有 API 模組
export default {
  auth: authAPI,
  planets: planetAPI,
  notes: noteAPI
};