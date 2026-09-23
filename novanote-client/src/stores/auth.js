import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
  // --- 狀態 (State) ---

  const token = ref(localStorage.getItem('token') || null);

  const savedUser = localStorage.getItem('user');

  let parsedUser = null;

  if (savedUser) {
    try {
      parsedUser = JSON.parse(savedUser);
    } catch (err) {
      console.warn('localStorage user 資料格式錯誤，已清除', err);
      localStorage.removeItem('user');
    }
  }

  const user = ref(parsedUser);

  // --- 計算屬性 (Getters) ---
  const isLoggedIn = computed(() => !!token.value);

  // --- 行動 (Actions) ---

  // 1. 登入
  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);

      token.value = res.data.token;
      user.value = res.data.user;

      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));

      api.defaults.headers.common['Authorization'] =
        `Bearer ${token.value}`;

      return res.data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.msg ||
        '登入失敗，請檢查網路';

      console.error('登入報錯詳細資訊:', errorMsg);

      throw new Error(errorMsg);
    }
  };

  // 2. 註冊
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (err) {
      console.error(
        '註冊失敗:',
        err.response?.data?.error ||
        err.response?.data?.msg ||
        err.message
      );

      throw err;
    }
  };

  // 3. 登出
  const logout = () => {
    token.value = null;
    user.value = null;

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    delete api.defaults.headers.common['Authorization'];
  };

  // 4. App 啟動時恢復登入狀態
  const initAuth = () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] =
        `Bearer ${token.value}`;
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