import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const savedTheme = localStorage.getItem('nova-theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  // 1. 優先掛載 Pinia 狀態管理
  app.use(pinia);

  // 2. 初始化身分驗證
  const authStore = useAuthStore();
  authStore.initAuth();

  // 3. 掛載路由系統z
  app.use(router);

  // 4. 掛載到畫面
  app.mount('#app');
  
  console.log('🚀 NovaNote 引擎啟動完成');
}

bootstrap();