import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  // --- 狀態 (State) ---
  
  // 嘗試從 localStorage 恢復 token 和用戶資訊
  const token = ref(localStorage.getItem('token') || null);
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);

  // --- 計算屬性 (Getters) ---
  const isLoggedIn = computed(() => !!token.value);

  // --- 行動 (Actions) ---

  // 1. 登入邏輯
  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      
      // 儲存到變數
      token.value = res.data.token;
      user.value = res.data.user;

      // 持久化儲存到瀏覽器 (這樣重新整理才不會消失)
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));

      // 設定 API 的全域 Header，讓之後的請求都帶著 Token
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.msg || '登入失敗，請檢查網路';
      console.error("登入報錯詳細資訊:", errorMsg);
      throw new Error(errorMsg);
    }
  };

  // 2. 註冊邏輯
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (err) {
      console.error("註冊失敗:", err.response?.data?.msg || err.message);
      throw err;
    }
  };

  // 3. 登出邏輯
  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 清除 API 的 Header
    delete api.defaults.headers.common['Authorization'];
  };

  // 4. 初始化檢查 (當 App 啟動時執行)
  const initAuth = () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }
  };

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    initAuth
  };
});