<template>
  <div class="auth-overlay" @click.self="emit('close')">
    <section ref="panel" class="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title" tabindex="-1">
      <button class="auth-close-btn" type="button" aria-label="Close sign in dialog" @click="emit('close')">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>

      <header class="auth-header">
        <svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="29" cy="33" r="18" />
          <ellipse cx="29" cy="33" rx="29" ry="9" transform="rotate(-28 29 33)" />
          <path d="M49 8v10M44 13h10" />
        </svg>
        <p class="brand-name">NOVANOTE</p>
        <p class="auth-kicker">THINK BEYOND</p>
        <h1 id="auth-title">{{ mode === 'login' ? 'Log in' : 'Create account' }}</h1>
        
      </header>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="mode === 'register'" class="auth-field">
          <label for="auth-username">Username</label>
          <div class="input-shell">
            <i class="fa-regular fa-user" aria-hidden="true"></i>
            <input id="auth-username" v-model="form.username" type="text" placeholder="Choose a username" autocomplete="username" required />
          </div>
        </div>

        <div class="auth-field">
          <label for="auth-email">Email</label>
          <div class="input-shell">
            <i class="fa-regular fa-envelope" aria-hidden="true"></i>
            <input id="auth-email" ref="emailInput" v-model="form.email" type="email" placeholder="Enter your email" autocomplete="email" required />
          </div>
        </div>

        <div class="auth-field">
          <label for="auth-password">Password</label>
          <div class="input-shell">
            <i class="fa-solid fa-lock" aria-hidden="true"></i>
            <input id="auth-password" v-model="form.password" type="password" placeholder="Enter your password" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" required />
          </div>
        </div>

        <div v-if="mode === 'register'" class="auth-field">
          <label for="auth-confirm-password">Confirm password</label>
          <div class="input-shell">
            <i class="fa-solid fa-shield-halved" aria-hidden="true"></i>
            <input id="auth-confirm-password" v-model="form.confirmPassword" type="password" placeholder="Enter your password again" autocomplete="new-password" required />
          </div>
        </div>

        <p v-if="errorMessage" class="auth-error" role="alert">
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          {{ errorMessage }}
        </p>

        <button class="auth-submit-btn" type="submit" :disabled="isLoading">
          <span>{{ isLoading ? 'Please wait…' : mode === 'login' ? 'Enter' : 'Create Account' }}</span>
          <span class="submit-arrow" aria-hidden="true">→</span>
        </button>
      </form>

      <footer class="auth-footer">
        <p v-if="mode === 'login'" class="auth-switch-copy">
          Don’t have an account?
          <button class="account-link" type="button" @click="switchMode('register')">Create Account</button>
        </p>
        <p v-else class="auth-switch-copy">
          Already have an account?
          <button class="account-link" type="button" @click="switchMode('login')">Log in</button>
        </p>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const emit = defineEmits(['close'])
const props = defineProps({
  initialMode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'register'].includes(value)
  }
})

const router = useRouter()
const authStore = useAuthStore()
const mode = ref(props.initialMode)
const isLoading = ref(false)
const errorMessage = ref('')
const panel = ref(null)
const emailInput = ref(null)
const opener = ref(null)
const previousBodyOverflow = ref('')
const previousHtmlOverflow = ref('')
const previousBodyPaddingRight = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const switchMode = (nextMode) => {
  mode.value = nextMode
  errorMessage.value = ''
}

const handleModalKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
    return
  }

  if (event.key !== 'Tab') return
  const focusable = panel.value?.querySelectorAll('button:not(:disabled), input:not(:disabled)')
  if (!focusable?.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  opener.value = document.activeElement
  previousBodyOverflow.value = document.body.style.overflow
  previousHtmlOverflow.value = document.documentElement.style.overflow
  previousBodyPaddingRight.value = document.body.style.paddingRight
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0
    document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
  }
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  document.addEventListener('keydown', handleModalKeydown)
  nextTick(() => emailInput.value?.focus())
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleModalKeydown)
  document.body.style.overflow = previousBodyOverflow.value
  document.documentElement.style.overflow = previousHtmlOverflow.value
  document.body.style.paddingRight = previousBodyPaddingRight.value
  if (opener.value?.isConnected) opener.value.focus()
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
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 20px;
  background: rgba(4, 8, 20, 0.3);
  backdrop-filter: blur(18px) brightness(0.72) saturate(0.9);
  -webkit-backdrop-filter: blur(18px) brightness(0.72) saturate(0.9);
}

.auth-panel {
  position: relative;
  width: min(460px, calc(100vw - 32px));
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  scrollbar-width: none;
  padding: 30px 36px 24px;
  color: #f5f5f1;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 30px;
  background:
    radial-gradient(ellipse at 50% -18%, rgba(133, 161, 210, 0.1), transparent 48%),
    linear-gradient(145deg, rgba(10, 16, 38, 0.66), rgba(8, 14, 32, 0.6));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 42px rgba(99, 133, 191, 0.045),
    0 28px 84px rgba(0, 0, 0, 0.48),
    0 0 38px rgba(129, 165, 224, 0.09);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  animation: auth-panel-enter 360ms cubic-bezier(0.2, 0.72, 0.25, 1) both;
}

.auth-panel::-webkit-scrollbar { display: none; }

@keyframes auth-panel-enter {
  from { opacity: 0; transform: translateY(12px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.auth-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #aab8ce;
  border: none;
  background: rgba(8, 16, 34, 0.4);
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
}
.auth-close-btn:hover { color: #fff; }

.auth-header { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 2px 0 23px; }
.brand-mark { width: 46px; height: 46px; margin: 0 0 10px; overflow: visible; fill: none; stroke: #e8d79d; stroke-width: 1.4; stroke-linecap: round; filter: drop-shadow(0 0 7px rgba(231, 213, 155, 0.24)); }
.brand-mark path { stroke-width: 1.8; }
.brand-name { margin: 0; color: #e8edf6; font: 500 13px/1.3 Inter, 'Noto Sans TC', sans-serif; letter-spacing: 0.32em; }
.auth-kicker { margin: 6px 0 17px; color: #8d9bb1; font: 600 9px/1.3 Inter, 'Noto Sans TC', sans-serif; letter-spacing: 0.4em; }
.auth-header h1 { margin: 0; color: #f5f6f8; font: 400 42px/1.05 Inter, 'Noto Sans TC', sans-serif; letter-spacing: -0.045em; }
.auth-subtitle { margin: 8px 0 0; color: #9aa9c1; font: 400 13px/1.4 Inter, 'Noto Sans TC', sans-serif; letter-spacing: 0.2em; }

.auth-form { display: flex; flex-direction: column; gap: 13px; }
.auth-field { display: flex; flex-direction: column; gap: 7px; }
.auth-field label { color: #aab8ce; font: 600 10px/1.3 Inter, 'Noto Sans TC', sans-serif; letter-spacing: 0.11em; text-transform: uppercase; }
.input-shell { display: flex; align-items: center; gap: 12px; min-height: 50px; padding: 0 15px; border: 1px solid rgba(168, 190, 226, 0.15); border-radius: 14px; background: rgba(5, 12, 28, 0.48); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025); transition: none; }
.input-shell:focus-within { border-color: rgba(168, 190, 226, 0.15); background: rgba(5, 12, 28, 0.48); box-shadow: none; }
.input-shell i { width: 17px; color: #95a9c7; font-size: 14px; text-align: center; }
.input-shell input { width: 100%; min-width: 0; padding: 13px 0; color: #eef3fb; border: 0; outline: none; background: transparent; box-shadow: none; font: 400 14px/1.4 Inter, 'Noto Sans TC', sans-serif; caret-color: #f0d79a; }
.input-shell input:focus, .input-shell input:focus-visible { border: 0; outline: none; box-shadow: none; }
.input-shell input::placeholder { color: #77859c; opacity: 1; }

.auth-error { display: flex; align-items: flex-start; gap: 9px; margin: 0; padding: 10px 12px; color: #ffc4c4; border: 1px solid rgba(248, 113, 113, 0.2); border-radius: 12px; background: rgba(127, 29, 29, 0.16); font-size: 12px; line-height: 1.5; }
.auth-error i { margin-top: 2px; }
.auth-submit-btn { display: flex; align-items: center; justify-content: center; gap: 13px; width: 100%; min-height: 51px; margin-top: 5px; color: #182035; border: 1px solid rgba(255, 249, 221, 0.76); border-radius: 999px; background: linear-gradient(110deg, #e5d89f, #f3e7bb 54%, #e8d9a4); box-shadow: 0 7px 24px rgba(211, 190, 122, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.68); cursor: pointer; font: 600 14px/1 Inter, 'Noto Sans TC', sans-serif; letter-spacing: 0.12em; transition: filter 180ms ease, transform 180ms ease, box-shadow 180ms ease; }
.auth-submit-btn:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); box-shadow: 0 9px 29px rgba(211, 190, 122, 0.21), inset 0 1px 0 rgba(255, 255, 255, 0.76); }
.auth-submit-btn:active:not(:disabled) { transform: translateY(0); }
.auth-submit-btn:disabled { cursor: wait; opacity: 0.7; }
.submit-arrow { font-size: 19px; line-height: 0.8; }

.auth-footer { display: flex; justify-content: center; margin-top: 19px; padding-top: 16px; border-top: 1px solid rgba(177, 195, 225, 0.11); }
.auth-switch-copy { margin: 0; color: #9aa9c1; text-align: center; font: 400 12px/1.5 Inter, 'Noto Sans TC', sans-serif; }
.account-link { padding: 0; color: #e2d6a8; border: 0; background: transparent; font: 600 12px/1.5 Inter, 'Noto Sans TC', sans-serif; cursor: pointer; transition: color 180ms ease; }
.account-link:hover { color: #fff2bc; text-decoration: underline; text-underline-offset: 3px; }

@media (max-width: 520px) {
  .auth-overlay { padding: 12px; }
  .auth-panel { width: min(100%, 440px); max-height: calc(100dvh - 24px); padding: 25px 22px 20px; border-radius: 27px; }
  .auth-close-btn { top: 12px; right: 12px; width: 33px; height: 33px; }
  .auth-header { padding-bottom: 20px; }
  .brand-mark { width: 42px; height: 42px; }
  .auth-header h1 { font-size: 38px; }
  .auth-footer { margin-top: 16px; padding-top: 14px; }
}
@media (max-height: 650px) {
  .auth-overlay { padding-block: 8px; }
  .auth-panel { max-height: calc(100dvh - 16px); padding-block: 20px 16px; }
  .auth-header { padding-bottom: 14px; }
  .brand-mark { width: 36px; height: 36px; margin-bottom: 6px; }
  .auth-kicker { margin-bottom: 10px; }
  .auth-footer { margin-top: 13px; padding-top: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .auth-panel { animation: none; }
  .auth-overlay *, .auth-overlay *::before, .auth-overlay *::after { transition-duration: 0.01ms !important; }
}
</style>
