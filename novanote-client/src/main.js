import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

/**
 * 啟動 NovaNote 宇宙的引擎
 */
async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  // 1. 優先掛載 Pinia 狀態管理
  // 這樣後面的 authStore 才能正常運作
  app.use(pinia);

  // 2. 初始化身分驗證
  // 從 LocalStorage 抓取 Token 並設定到 Axios 的全域 Header
  const authStore = useAuthStore();
  authStore.initAuth();

  // 3. 掛載路由系統
  // 路由守衛會依賴 authStore 的狀態來決定是否允許進入 /universe
  app.use(router);

  // 4. 掛載到畫面
  app.mount('#app');
  
  console.log('🚀 NovaNote 引擎啟動完成');
}

// 執行啟動
bootstrap();