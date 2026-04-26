import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// 頁面組件引入
import LandingView from '../views/LandingView.vue';
import UniverseView from '../views/UniverseView.vue';
import EditorView from '../views/EditorView.vue'; // 確保引入了編輯器

const routes = [
  { 
    path: '/', 
    name: 'Landing',
    component: LandingView 
  },
  { 
    path: '/universe', 
    name: 'Universe',
    component: UniverseView,
    meta: { requiresAuth: true }
  },
  {
    // :id 可以是 'new' 或是 數字 ID
    path: '/editor/:id',
    name: 'Editor',
    component: EditorView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全域導航守衛
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = authStore.token || localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/');
  } 
  else if (to.path === '/' && token) {
    next('/universe');
  } 
  else {
    next();
  }
});

export default router;