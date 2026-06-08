import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

// 建立 Axios 實例
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- 請求攔截器 (Request Interceptor) ---
// 每次發出請求前，都會先跑這裡
api.interceptors.request.use(
  (config) => {
    // 從 localStorage 抓取 token
    const token = localStorage.getItem('token');
    
    // 如果有 token，就把它塞進 Header 裡的 Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 回應攔截器 (Response Interceptor) ---
// 當後端回傳資料後，先經過這裡再交給各個組件
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 如果後端回傳 401 (代表 Token 過期或無效)
    if (error.response && error.response.status === 401) {
      console.warn('身分驗證失效，準備導向登入頁面');
      // 可以在這裡強制執行登出邏輯，例如：
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // window.location.href = '/'; // 視需求決定是否強制跳轉
    }
    return Promise.reject(error);
  }
);

export default api;