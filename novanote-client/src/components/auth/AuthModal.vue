<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="auth-card">
      <div class="auth-logo">
        <h2 class="logo-text">NovaNote</h2>
      </div>

      <nav class="auth-tabs">
        <button 
          :class="['tab-btn', { active: isLoginMode }]" 
          @click="isLoginMode = true"
        >登入</button>
        <button 
          :class="['tab-btn', { active: !isLoginMode }]" 
          @click="isLoginMode = false"
        >註冊</button>
      </nav>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <Transition name="slide">
          <div v-if="!isLoginMode" class="input-field">
            <input 
              v-model="formData.username" 
              type="text" 
              placeholder="使用者名稱" 
              :required="!isLoginMode"
            />
          </div>
        </Transition>

        <div class="input-field">
          <input 
            v-model="formData.email" 
            type="email" 
            placeholder="電子郵件" 
            required 
          />
        </div>

        <div class="input-field">
          <input 
            v-model="formData.password" 
            type="password" 
            placeholder="密碼" 
            required 
          />
        </div>

        <button type="submit" class="primary-submit" :disabled="loading">
          <span v-if="loading" class="loader"></span>
          <span v-else>{{ isLoginMode ? '登入' : '立即註冊' }}</span>
        </button>
      </form>

      <footer class="auth-footer">
        <a href="#" class="forgot-link">忘記密碼？</a>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const router = useRouter();

const isLoginMode = ref(true);
const loading = ref(false);

const formData = reactive({
  username: '',
  email: '',
  password: ''
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (isLoginMode.value) {
      await authStore.login({ email: formData.email, password: formData.password });
      emit('close');
      router.push('/universe');
    } else {
      await authStore.register(formData);
      alert('註冊成功！');
      isLoginMode.value = true;
    }
  } catch (err) {
    alert(`錯誤: ${err.message}`);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.auth-card {
  background: #181818;
  padding: 48px;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
}

/* Logo 區域 */
.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}
.logo-icon { font-size: 2.5rem; margin-bottom: 8px; }
.logo-text { font-size: 1.8rem; font-weight: 800; letter-spacing: -1px; }

/* 頂部 Tabs */
.auth-tabs {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 32px;
}
.tab-btn {
  background: none; border: none;
  color: #a7a7a7;
  font-size: 1rem; font-weight: 700;
  padding: 8px 0;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
}
.tab-btn:hover { color: #fff; }
.tab-btn.active { color: #fff; }
.tab-btn.active::after {
  content: "";
  position: absolute; bottom: 0; left: 0;
  width: 100%; height: 3px;
  background: #646cff; /* 你的品牌色 */
  border-radius: 2px;
}

/* 表單欄位 */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.input-field input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 500px;
  border: 1px solid #727272;
  background: #fff;
  color: #000;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
}
.input-field input:focus {
  border: 2px solid #646cff;
  padding: 13px 19px; /* 抵消 border 增加的寬度 */
}

/* 提交按鈕 */
.primary-submit {
  background: #646cff;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 500px;
  font-size: 1rem; font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
  margin-top: 8px;
}
.primary-submit:hover {
  background: #7e85ff;
  transform: scale(1.04);
}
.primary-submit:active { transform: scale(1); }

/* 底部連結 */
.auth-footer {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.forgot-link {
  color: #a7a7a7; text-decoration: none; font-size: 0.875rem; font-weight: 700;
}
.forgot-link:hover { color: #fff; text-decoration: underline; }

/* 動畫 */
.slide-enter-active, .slide-leave-active { transition: 0.3s; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }
</style>