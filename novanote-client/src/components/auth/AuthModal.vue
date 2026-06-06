<template>
  <div class="auth-overlay" @click.self="emit('close')">
    <section class="auth-panel">
      <div class="panel-edge"></div>
      <div class="panel-grid"></div>
      <div class="panel-scan"></div>

      <span class="corner corner-tl"></span>
      <span class="corner corner-tr"></span>
      <span class="corner corner-bl"></span>
      <span class="corner corner-br"></span>

      <button class="auth-close-btn" type="button" @click="emit('close')">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <header class="auth-header">
        <p class="auth-kicker">GALAXY ACCESS</p>
        <h2>NovaNote</h2>
        <span class="auth-subtitle">IDENTITY VERIFICATION SYSTEM</span>
      </header>

      <div class="auth-tabs">
        <button
          type="button"
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          登入
        </button>

        <button
          type="button"
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          註冊
        </button>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="mode === 'register'" class="auth-field">
          <label>USERNAME</label>
          <div class="input-shell">
            <i class="fa-solid fa-user-astronaut"></i>
            <input
              v-model="form.username"
              type="text"
              placeholder="使用者名稱"
              autocomplete="username"
            />
          </div>
        </div>

        <div class="auth-field">
          <label>E-MAIL</label>
          <div class="input-shell">
            <i class="fa-solid fa-envelope"></i>
            <input
              v-model="form.email"
              type="email"
              placeholder="電子郵件"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="auth-field">
          <label>PASSWORD</label>
          <div class="input-shell">
            <i class="fa-solid fa-key"></i>
            <input
              v-model="form.password"
              type="password"
              placeholder="密碼"
              autocomplete="current-password"
            />
          </div>
        </div>

        <div v-if="mode === 'register'" class="auth-field">
          <label>CONFIRM CODE</label>
          <div class="input-shell">
            <i class="fa-solid fa-shield-halved"></i>
            <input
              v-model="form.confirmPassword"
              type="password"
              placeholder="確認密碼"
              autocomplete="new-password"
            />
          </div>
        </div>

        <p v-if="errorMessage" class="auth-error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          {{ errorMessage }}
        </p>

        <button class="auth-submit-btn" type="submit" :disabled="isLoading">
          <span class="btn-scan"></span>
          <span>
            {{ isLoading ? '驗證中...' : mode === 'login' ? '登入系統' : '建立身份' }}
          </span>
        </button>

        <button
          v-if="mode === 'login'"
          class="forgot-btn"
          type="button"
        >
          忘記密碼？
        </button>
      </form>

      <footer class="auth-footer">
        <span>SECURE ACCESS</span>
        <span>ENCRYPTION AES-256</span>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()

const mode = ref('login')
const isLoading = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  if (!form.email.trim()) return '請輸入電子郵件'
  if (!form.password.trim()) return '請輸入密碼'

  if (mode.value === 'register') {
    if (!form.username.trim()) return '請輸入使用者名稱'
    if (form.password !== form.confirmPassword) return '兩次密碼不一致'
  }

  return ''
}

const handleSubmit = async () => {
  errorMessage.value = validateForm()
  if (errorMessage.value) return

  isLoading.value = true

  try {
    if (mode.value === 'login') {
      await authStore.login({
        email: form.email,
        password: form.password
      })
    } else {
      await authStore.register({
        username: form.username,
        email: form.email,
        password: form.password
      })
    }

    emit('close')
    router.push('/universe')
  } catch (err) {
    console.error(err)
    errorMessage.value =
      err?.response?.data?.message ||
      err?.message ||
      '驗證失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    radial-gradient(circle at 50% 42%, rgba(80, 115, 255, 0.16), transparent 30%),
    rgba(0, 0, 0, 0.52);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

/* =========================
   Auth Panel
========================= */

.auth-panel {
  position: relative;

  width: min(520px, 90vw);
  max-height: 86vh;
  min-height: auto;

  padding: 28px 38px 20px;

  overflow-y: auto;
  overflow-x: hidden;

  color: #eef5ff;

  background:
    radial-gradient(circle at 50% 0%, rgba(130, 160, 255, 0.12), transparent 34%),
    radial-gradient(circle at 88% 80%, rgba(105, 202, 255, 0.08), transparent 28%),
    linear-gradient(145deg, rgba(12, 18, 36, 0.94), rgba(5, 8, 18, 0.96));

  border: 1px solid rgba(150, 205, 255, 0.28);
  border-radius: 8px;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 42px rgba(105, 150, 255, 0.16),
    0 34px 90px rgba(0, 0, 0, 0.65);
}

.auth-panel::-webkit-scrollbar {
  width: 6px;
}

.auth-panel::-webkit-scrollbar-track {
  background: transparent;
}

.auth-panel::-webkit-scrollbar-thumb {
  background: rgba(140, 190, 255, 0.24);
  border-radius: 999px;
}

.auth-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(160, 210, 255, 0.38);
}

/* =========================
   Background Effects
========================= */

.panel-edge,
.panel-grid,
.panel-scan {
  position: absolute;
  pointer-events: none;
}

.panel-edge {
  inset: 0;
  z-index: 1;

  box-shadow:
    inset 5px 0 16px rgba(210, 235, 255, 0.06),
    inset -5px 0 16px rgba(210, 235, 255, 0.06),
    inset 0 5px 16px rgba(120, 180, 255, 0.05),
    inset 0 -5px 16px rgba(120, 180, 255, 0.05);
}

.panel-grid {
  inset: 0;
  z-index: 0;

  background-image:
    linear-gradient(rgba(130, 190, 255, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(130, 190, 255, 0.028) 1px, transparent 1px);

  background-size: 36px 36px;
}

.panel-scan {
  inset: 0;
  z-index: 2;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 42%,
      rgba(210, 235, 255, 0.13) 50%,
      transparent 58%,
      transparent 100%
    );

  transform: translateX(-120%);
  animation: authScan 7s linear infinite;
}

@keyframes authScan {
  0% {
    transform: translateX(-120%);
    opacity: 0;
  }

  18% {
    opacity: 0.8;
  }

  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}

/* =========================
   Corner Lines
========================= */

.corner {
  position: absolute;
  z-index: 5;

  width: 56px;
  height: 56px;

  pointer-events: none;
}

.corner::before,
.corner::after {
  content: '';
  position: absolute;

  background:
    linear-gradient(
      90deg,
      rgba(230, 244, 255, 0.9),
      rgba(105, 202, 255, 0.92)
    );

  box-shadow: 0 0 12px rgba(105, 202, 255, 0.34);
}

/* 左上 */
.corner-tl {
  top: 16px;
  left: 16px;
}

.corner-tl::before {
  top: 0;
  left: 0;

  width: 30px;
  height: 2px;
}

.corner-tl::after {
  top: 0;
  left: 0;

  width: 2px;
  height: 30px;
}

/* 右上 */
.corner-tr {
  top: 16px;
  right: 16px;
}

.corner-tr::before {
  top: 0;
  right: 0;

  width: 30px;
  height: 2px;
}

.corner-tr::after {
  top: 0;
  right: 0;

  width: 2px;
  height: 30px;
}

/* 左下 */
.corner-bl {
  bottom: 16px;
  left: 16px;
}

.corner-bl::before {
  bottom: 0;
  left: 0;

  width: 30px;
  height: 2px;
}

.corner-bl::after {
  bottom: 0;
  left: 0;

  width: 2px;
  height: 30px;
}

/* 右下 */
.corner-br {
  right: 16px;
  bottom: 16px;
}

.corner-br::before {
  bottom: 0;
  right: 0;

  width: 30px;
  height: 2px;
}

.corner-br::after {
  bottom: 0;
  right: 0;

  width: 2px;
  height: 30px;
}

/* =========================
   Close Button
========================= */

.auth-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 20;

  width: 38px;
  height: 38px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: #dfeaff;
  background: rgba(255, 255, 255, 0.055);

  border: 1px solid rgba(170, 205, 255, 0.18);
  border-radius: 6px;

  cursor: pointer;

  transition:
    transform 0.22s ease,
    background 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease;
}

.auth-close-btn:hover {
  color: #ffffff;
  background: rgba(255, 75, 115, 0.13);
  border-color: rgba(255, 120, 150, 0.42);
  transform: rotate(90deg);
}

/* =========================
   Header
========================= */

.auth-header {
  position: relative;
  z-index: 10;

  text-align: center;
}

.auth-kicker {
  margin: 0 0 6px;

  color: #69caff;

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.auth-header h2 {
  margin: 0;

  color: #ffffff;

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.38),
    0 0 32px rgba(130, 150, 255, 0.26);
}

.auth-subtitle {
  display: block;
  margin-top: 6px;

  color: rgba(220, 230, 255, 0.38);

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.16em;
}

/* =========================
   Tabs
========================= */

.auth-tabs {
  position: relative;
  z-index: 10;

  margin: 20px auto 16px;

  display: flex;
  justify-content: center;
  gap: 24px;
}

.auth-tabs button {
  position: relative;

  padding: 0 0 8px;

  color: rgba(225, 232, 255, 0.48);
  background: transparent;
  border: none;

  font-family: 'Noto Sans TC', 'Rajdhani', sans-serif;
  font-size: 1rem;
  font-weight: 800;

  cursor: pointer;

  transition:
    color 0.2s ease,
    text-shadow 0.2s ease;
}

.auth-tabs button::after {
  content: '';

  position: absolute;
  left: 50%;
  bottom: 0;

  width: 0;
  height: 3px;

  transform: translateX(-50%);

  background: linear-gradient(90deg, #69caff, #9f8cff);
  border-radius: 999px;

  box-shadow: 0 0 12px rgba(130, 150, 255, 0.44);

  transition: width 0.22s ease;
}

.auth-tabs button.active {
  color: #ffffff;
  text-shadow: 0 0 14px rgba(255, 255, 255, 0.26);
}

.auth-tabs button.active::after {
  width: 54px;
}

/* =========================
   Form
========================= */

.auth-form {
  position: relative;
  z-index: 10;

  display: flex;
  flex-direction: column;
  gap: 10px;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-field label {
  color: #82caff;

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.input-shell {
  height: 42px;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 0 14px;

  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.045),
      rgba(255, 255, 255, 0.015)
    ),
    rgba(5, 10, 24, 0.72);

  border: 1px solid rgba(145, 205, 255, 0.22);
  border-radius: 6px;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    inset 0 0 24px rgba(105, 202, 255, 0.035);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.input-shell:focus-within {
  border-color: rgba(195, 225, 255, 0.68);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 0 18px rgba(105, 202, 255, 0.16);
}

.input-shell i {
  color: #69caff;
  font-size: 0.86rem;
}

.input-shell input {
  width: 100%;

  color: #ffffff;
  background: transparent;
  border: none;
  outline: none;

  font-family: 'Noto Sans TC', 'Rajdhani', sans-serif;
  font-size: 0.88rem;
  font-weight: 800;
}

.input-shell input::placeholder {
  color: rgba(225, 232, 255, 0.38);
}

/* =========================
   Error
========================= */

.auth-error {
  margin: 2px 0 0;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  color: #ff9fb3;

  font-size: 0.78rem;
  font-weight: 800;
}

/* =========================
   Submit Button
========================= */

.auth-submit-btn {
  position: relative;

  height: 46px;
  margin-top: 10px;

  overflow: hidden;

  color: #ffffff;
  background:
    linear-gradient(
      135deg,
      rgba(90, 120, 255, 0.72),
      rgba(63, 95, 210, 0.86)
    );

  border: 1px solid rgba(185, 205, 255, 0.5);
  border-radius: 6px;

  font-family: 'Noto Sans TC', 'Rajdhani', sans-serif;
  font-size: 0.98rem;
  font-weight: 900;
  letter-spacing: 0.08em;

  cursor: pointer;

  box-shadow:
    inset 0 0 22px rgba(255, 255, 255, 0.08),
    0 0 28px rgba(100, 130, 255, 0.22);

  transition:
    transform 0.22s ease,
    filter 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
}

.auth-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.08);
  border-color: rgba(225, 235, 255, 0.78);

  box-shadow:
    inset 0 0 26px rgba(255, 255, 255, 0.12),
    0 0 36px rgba(105, 150, 255, 0.32);
}

.auth-submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-scan {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 38%,
      rgba(255, 255, 255, 0.24) 50%,
      transparent 62%,
      transparent 100%
    );

  transform: translateX(-120%);
  transition: transform 0.7s ease;
}

.auth-submit-btn:hover .btn-scan {
  transform: translateX(120%);
}

.auth-submit-btn span:last-child {
  position: relative;
  z-index: 2;
}

/* =========================
   Forgot / Footer
========================= */

.forgot-btn {
  align-self: center;

  margin-top: 10px;

  color: rgba(225, 232, 255, 0.52);
  background: transparent;
  border: none;

  font-family: 'Noto Sans TC', 'Rajdhani', sans-serif;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.04em;

  cursor: pointer;

  transition: color 0.2s ease;
}

.forgot-btn:hover {
  color: #ffffff;
}

.auth-footer {
  position: relative;
  z-index: 10;

  margin-top: 12px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;

  color: rgba(220, 230, 255, 0.28);

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

/* =========================
   RWD
========================= */

@media (max-width: 720px) {
  .auth-overlay {
    padding: 14px;
  }

  .auth-panel {
    width: 70vw;
    max-height: 88vh;
    padding: 30px 22px 22px;
  }

  .auth-close-btn {
    top: 14px;
    right: 14px;

    width: 34px;
    height: 34px;
  }

  .auth-header h2 {
    font-size: 1.48rem;
  }

  .auth-tabs {
    margin: 18px auto 16px;
  }

  .input-shell {
    height: 42px;
  }

  .auth-footer {
    flex-direction: column;
    gap: 6px;
  }

  .corner-tl {
    top: 12px;
    left: 12px;
  }

  .corner-tr {
    top: 12px;
    right: 12px;
  }

  .corner-bl {
    bottom: 12px;
    left: 12px;
  }

  .corner-br {
    right: 12px;
    bottom: 12px;
  }
}
</style>