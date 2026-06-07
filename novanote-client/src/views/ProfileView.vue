<template>
  <div class="profile-page" :class="{ 'sidebar-open': isSidebarOpen }">
    <button
      class="sidebar-toggle-btn"
      type="button"
      aria-label="開啟或關閉側邊欄"
      @click="toggleSidebar"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <div
      v-if="isSidebarOpen"
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <aside class="profile-sidebar">
      <button class="back-btn" @click="goUniverse">
        <i class="fa-solid fa-arrow-left"></i>
        <span>返回宇宙</span>
      </button>

      <div class="profile-user-card">
        <div class="profile-avatar">
          <i class="fa-solid fa-user-astronaut"></i>
        </div>

        <h2>{{ profile.username || 'SpaceExplorer' }}</h2>
      </div>

      <nav class="profile-menu">
        <button
          class="profile-menu-item"
          :class="{ active: activeSection === 'profile' }"
          type="button"
          @click="scrollToSectionAndClose('profile')"
        >
          <i class="fa-solid fa-user-pen"></i>
          <span>個人檔案</span>
        </button>

        <button
          class="profile-menu-item"
          :class="{ active: activeSection === 'security' }"
          type="button"
          @click="scrollToSectionAndClose('security')"
        >
          <i class="fa-solid fa-key"></i>
          <span>更改密碼</span>
        </button>

        <button
          class="profile-menu-item"
          type="button"
          @click="goStarOverview"
        >
          <i class="fa-solid fa-earth-americas"></i>
          <span>星圖總覽</span>
        </button>

        <button
          class="profile-menu-item"
          type="button"
          @click="goTrash"
        >
          <i class="fa-solid fa-trash-can"></i>
          <span>星際回收站</span>
        </button>
      </nav>

      <button class="logout-side-btn" @click="logout">
        <i class="fa-solid fa-right-from-bracket"></i>
        <span>登出帳號</span>
      </button>
    </aside>

    <main class="profile-main">
      <header class="profile-header">
        <div>
          <p>Explorer Profile</p>
          <h1>個人檔案</h1>
        </div>

        <div class="header-badge">
          <i class="fa-solid fa-shield-halved"></i>
          Account Center
        </div>
      </header>

      <section id="profile" class="profile-panel">
        <div class="panel-title">
          <div>
            <p>Profile Settings</p>
            <h2>我的檔案</h2>
          </div>
        </div>

        <div class="profile-form-grid">
          <label class="form-field">
            <span>使用者名稱</span>
            <input
              v-model="nameForm.username"
              type="text"
              placeholder="輸入新的使用者名稱"
            />
          </label>

          <label class="form-field">
            <span>E-mail</span>
            <input
              :value="profile.email || '未設定'"
              type="text"
              disabled
            />
          </label>
        </div>

        <div class="panel-actions">
          <button
            class="save-btn"
            type="button"
            :disabled="savingProfile"
            @click="saveProfile"
          >
            <i class="fa-solid fa-floppy-disk"></i>
            {{ savingProfile ? '儲存中...' : '儲存變更' }}
          </button>
        </div>
      </section>

      <section id="security" class="profile-panel">
        <div class="panel-title">
          <div>
            <p>Security</p>
            <h2>更改密碼</h2>
          </div>
        </div>

        <div class="password-layout">
          <div class="password-fields">
            <label class="form-field">
              <span>舊密碼</span>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                placeholder="請輸入目前密碼"
              />
            </label>

            <label class="form-field">
              <span>新密碼</span>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="至少 6 個字元"
              />
            </label>

            <label class="form-field">
              <span>確認密碼</span>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="再次輸入新密碼"
              />
            </label>
          </div>

          <div class="password-hint">
            <i class="fa-solid fa-circle-info"></i>
            <p>建議密碼至少 6 位，並混合英文與數字，避免使用生日或常見字詞。</p>
          </div>
        </div>

        <div class="panel-actions">
          <button
            class="password-btn"
            type="button"
            :disabled="savingPassword"
            @click="changePassword"
          >
            <i class="fa-solid fa-key"></i>
            {{ savingPassword ? '更新中...' : '儲存密碼' }}
          </button>
        </div>
      </section>
    </main>

    <transition name="toast">
      <div v-if="toast.message" class="toast" :class="toast.type">
        <i
          class="fa-solid"
          :class="toast.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'"
        ></i>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import { usePlanetsStore } from '../stores/planets'

const router = useRouter()
const authStore = useAuthStore()
const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()

const isSidebarOpen = ref(false)

const activeSection = ref('profile')
let sectionObserver = null

const sectionIds = ['profile', 'security']

const setupSectionObserver = () => {
  if (sectionObserver) {
    sectionObserver.disconnect()
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => {
          return a.boundingClientRect.top - b.boundingClientRect.top
        })

      if (visibleSections.length > 0) {
        activeSection.value = visibleSections[0].target.id
      }
    },
    {
      root: null,
      threshold: 0.35,
      rootMargin: '-20% 0px -55% 0px'
    }
  )

  sectionIds.forEach((id) => {
    const section = document.getElementById(id)

    if (section) {
      sectionObserver.observe(section)
    }
  })
}

const user = computed(() => {
  return authStore.user || JSON.parse(localStorage.getItem('user') || 'null')
})

const profile = reactive({
  id: '',
  username: '',
  email: '',
  role: ''
})

const nameForm = reactive({
  username: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const savingProfile = ref(false)
const savingPassword = ref(false)

const toast = reactive({
  message: '',
  type: 'success'
})

const stats = computed(() => {
  const allNotes = notesStore.allNotes || []
  const planets = planetsStore.planets || []

  return {
    planetCount: planets.length,
    noteCount: allNotes.length,
    floatingCount: allNotes.filter(note => !getNotePlanetId(note)).length,
    inPlanetCount: allNotes.filter(note => getNotePlanetId(note)).length
  }
})

const getCreatedAt = (item) => {
  return (
    item.created_at ||
    item.createdAt ||
    item.created_time ||
    item.createdTime ||
    item.inserted_at ||
    item.insertedAt ||
    item.updated_at ||
    item.updatedAt ||
    null
  )
}

const getNotePlanetId = (note) => {
  return note.planet_id || note.planetId || note.planet?.id || null
}

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

const goUniverse = () => {
  router.push('/universe')
  closeSidebar()
}

const goTrash = () => {
  router.push('/trash')
  closeSidebar()
}

const goStarOverview = () => {
  router.push('/star-overview')
  closeSidebar()
}

const openTimelineNode = (node) => {
  closeSidebar()

  if (node.type === 'floating-note' || node.type === 'internal-note' || node.type === 'note') {
    router.push(`/editor/${node.rawId}`)
    return
  }

  if (node.type === 'planet') {
    router.push({
      path: '/universe',
      query: {
        planet: node.rawId
      }
    })
  }
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type

  setTimeout(() => {
    toast.message = ''
  }, 2600)
}

const scrollToSection = (id) => {
  activeSection.value = id

  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

const scrollToSectionAndClose = (id) => {
  scrollToSection(id)
  closeSidebar()
}

const loadProfile = async () => {
  if (!user.value?.id) {
    router.push('/')
    return
  }

  try {
    const res = await api.get(`/users/${user.value.id}/profile`)

    Object.assign(profile, res.data)
    nameForm.username = res.data.username || ''
  } catch (err) {
    console.error('讀取個人資料失敗:', err)

    Object.assign(profile, {
      id: user.value.id,
      username: user.value.username || 'SpaceExplorer',
      email: user.value.email || '',
      role: user.value.role || 'Explorer'
    })

    nameForm.username = profile.username
  }
}

const saveProfile = async () => {
  if (!nameForm.username.trim()) {
    showToast('使用者名稱不能空白', 'error')
    return
  }

  savingProfile.value = true

  try {
    const res = await api.put(`/users/${user.value.id}/profile`, {
      username: nameForm.username.trim()
    })

    Object.assign(profile, res.data)

    const oldUser = JSON.parse(localStorage.getItem('user') || '{}')
    const newUser = {
      ...oldUser,
      username: res.data.username
    }

    localStorage.setItem('user', JSON.stringify(newUser))

    if (authStore.user) {
      authStore.user.username = res.data.username
    }

    showToast('個人名稱已更新')
  } catch (err) {
    console.error('更新個人資料失敗:', err)
    showToast(err.response?.data?.error || '更新個人資料失敗', 'error')
  } finally {
    savingProfile.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    showToast('請輸入目前密碼與新密碼', 'error')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    showToast('新密碼至少需要 6 個字元', 'error')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showToast('兩次輸入的新密碼不一致', 'error')
    return
  }

  savingPassword.value = true

  try {
    await api.put(`/users/${user.value.id}/password`, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })

    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    showToast('密碼已成功更新')
  } catch (err) {
    console.error('修改密碼失敗:', err)
    showToast(err.response?.data?.error || '修改密碼失敗', 'error')
  } finally {
    savingPassword.value = false
  }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(async () => {
  const savedTheme = localStorage.getItem('nova-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)

  await Promise.all([
    loadProfile(),
    notesStore.refreshData(),
    planetsStore.fetchPlanets()
  ])

  await nextTick()
  setupSectionObserver()
})

onBeforeUnmount(() => {
  if (sectionObserver) {
    sectionObserver.disconnect()
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  width: 100%;

  display: flex;

  color: var(--profile-text);

  background:
    linear-gradient(rgba(143, 124, 255, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.026) 1px, transparent 1px),
    radial-gradient(circle at 12% 8%, var(--profile-bg-radial-1), transparent 28%),
    radial-gradient(circle at 96% 14%, var(--profile-bg-radial-2), transparent 30%),
    radial-gradient(circle at 52% 86%, rgba(143, 124, 255, 0.06), transparent 35%),
    var(--profile-bg);

  background-size:
    42px 42px,
    42px 42px,
    auto,
    auto,
    auto,
    auto;

  font-family: var(--font-main);

  overflow-x: hidden;
}

:global(html),
:global(body),
:global(#app) {
  min-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

/* =========================
   Sidebar Toggle
========================= */

.sidebar-toggle-btn {
  display: none;
}

.sidebar-overlay {
  display: none;
}

/* =========================
   Sidebar
========================= */

.profile-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;

  width: 280px;
  height: 100vh;

  display: flex;
  flex-direction: column;

  padding: 34px 26px;

  background:
    radial-gradient(circle at 35% 0%, var(--profile-accent-soft), transparent 30%),
    linear-gradient(180deg, var(--profile-sidebar-bg), var(--profile-bg));
  border-right: 1px solid var(--profile-sidebar-border);

  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.035),
    18px 0 48px rgba(0, 0, 0, 0.26);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);

  overflow: hidden;

  transition:
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease;
}

.profile-sidebar::before {
  content: '';

  position: absolute;
  inset: 0;
  z-index: -1;

  background-image:
    linear-gradient(rgba(143, 124, 255, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.026) 1px, transparent 1px);

  background-size: 32px 32px;
  pointer-events: none;
}

.profile-sidebar::after {
  content: '';

  position: absolute;
  top: 24px;
  right: 18px;

  width: 34px;
  height: 34px;

  border-top: 2px solid var(--profile-accent);
  border-right: 2px solid var(--profile-accent);

  opacity: 0.68;
  filter: drop-shadow(0 0 8px var(--profile-accent-soft));

  pointer-events: none;
}

.back-btn {
  position: relative;

  width: fit-content;
  min-height: 42px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;

  padding: 0 17px;

  color: var(--profile-heading);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  clip-path: polygon(
    10px 0,
    100% 0,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    0 100%,
    0 10px
  );

  cursor: pointer;

  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.02em;

  box-shadow: var(--profile-shadow-sm);

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.back-btn:hover {
  color: var(--profile-accent);
  background: var(--profile-menu-hover-bg);
  border-color: var(--profile-accent-border);
  transform: translateY(-2px);
  box-shadow: var(--profile-shadow-md);
}

.profile-user-card {
  position: relative;
  margin: 42px 0 30px;
  text-align: center;
}

.profile-avatar {
  position: relative;

  width: 86px;
  height: 86px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 18px;

  color: var(--profile-accent);
  background:
    radial-gradient(circle at 50% 22%, var(--profile-accent-soft), transparent 58%),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-accent-border);
  border-radius: 8px;

  font-size: 2.1rem;

  box-shadow:
    0 0 22px rgba(143, 124, 255, 0.16),
    var(--profile-shadow-md);

  clip-path: polygon(
    16px 0,
    calc(100% - 16px) 0,
    100% 16px,
    100% calc(100% - 16px),
    calc(100% - 16px) 100%,
    16px 100%,
    0 calc(100% - 16px),
    0 16px
  );
}

.profile-avatar::after {
  content: '';

  position: absolute;
  inset: 8px;

  border: 1px solid var(--profile-accent-border);
  opacity: 0.28;

  clip-path: inherit;
  pointer-events: none;
}

.profile-user-card h2 {
  margin: 0;

  color: var(--profile-heading);

  font-family: 'Orbitron', var(--font-main);
  font-size: 1.22rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.03em;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.18),
    0 0 24px rgba(143, 124, 255, 0.16);

  word-break: break-word;
}

.profile-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-menu-item {
  position: relative;

  width: 100%;
  min-height: 46px;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 0 14px;

  color: var(--profile-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 800;
  text-align: left;

  overflow: hidden;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.profile-menu-item::after {
  content: '';

  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 5px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      var(--profile-accent),
      transparent
    );

  opacity: 0;
  transition: opacity 0.18s ease;
}

.profile-menu-item i {
  width: 20px;
  color: var(--profile-muted-soft);
  transition: color 0.18s ease;
}

.profile-menu-item:hover,
.profile-menu-item.active {
  color: var(--profile-heading);
  background: var(--profile-menu-active-bg);
  border-color: var(--profile-accent-border);
  transform: translateX(3px);
  box-shadow: 0 0 18px rgba(143, 124, 255, 0.12);
}

.profile-menu-item:hover::after,
.profile-menu-item.active::after {
  opacity: 0.72;
}

.profile-menu-item:hover i,
.profile-menu-item.active i {
  color: var(--profile-accent);
}

.logout-side-btn {
  position: relative;

  min-height: 46px;

  display: flex;
  align-items: center;
  gap: 10px;

  margin-top: auto;
  padding: 0 14px;

  color: var(--profile-danger);
  background: var(--profile-danger-bg);
  border: 1px solid transparent;
  border-radius: 6px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 800;
  text-align: left;

  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.logout-side-btn:hover {
  background: var(--profile-danger-bg-hover);
  border-color: var(--profile-danger);
  transform: translateX(3px);
  box-shadow: 0 0 18px rgba(255, 119, 119, 0.12);
}

/* =========================
   Main Layout
========================= */

.profile-main {
  width: 100%;
  min-width: 0;

  margin-left: 280px;
  padding: 42px clamp(24px, 5vw, 64px) 70px;
}

.profile-header {
  width: min(100%, 800px);

  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18px;

  margin: 0 auto 34px;
}

.profile-header p {
  margin: 0 0 7px;

  color: var(--profile-accent);

  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.profile-header h1 {
  margin: 0;

  color: var(--profile-heading);

  font-size: clamp(2rem, 5vw, 3.1rem);
  font-weight: 850;
  line-height: 1.1;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.18),
    0 0 28px rgba(143, 124, 255, 0.18);
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 9px 12px;

  color: var(--profile-muted);
  background: var(--profile-panel-bg-soft);
  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  box-shadow: var(--profile-shadow-sm);
}

/* =========================
   Panel
========================= */

.profile-panel {
  position: relative;

  width: min(100%, 800px);

  margin: 0 auto 24px;
  padding: clamp(22px, 4vw, 34px);

  color: var(--profile-text);
  background:
    radial-gradient(circle at 50% 0%, var(--profile-accent-soft), transparent 24%),
    radial-gradient(circle at 82% 20%, rgba(81, 186, 252, 0.08), transparent 28%),
    var(--profile-panel-bg);
  border: 1px solid var(--profile-panel-border);
  border-radius: 8px;

  box-shadow: var(--profile-shadow-lg);

  overflow: hidden;

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  scroll-margin-top: 28px;

  transition:
    background-color 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease;
}

.profile-panel::before {
  content: '';

  position: absolute;
  inset: 0;
  z-index: 0;

  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1.5px),
    linear-gradient(rgba(143, 124, 255, 0.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.024) 1px, transparent 1px);

  background-size:
    92px 92px,
    34px 34px,
    34px 34px;

  opacity: 0.5;
  pointer-events: none;
}

.profile-panel::after {
  content: '';

  position: absolute;
  top: 14px;
  right: 14px;

  width: 34px;
  height: 34px;

  border-top: 2px solid var(--profile-accent-border);
  border-right: 2px solid var(--profile-accent-border);

  filter:
    drop-shadow(0 0 8px rgba(143, 124, 255, 0.42))
    drop-shadow(0 0 16px rgba(81, 186, 252, 0.16));

  pointer-events: none;
}

.profile-panel > * {
  position: relative;
  z-index: 2;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 22px;
  margin-bottom: 24px;

  border-bottom: 1px solid var(--profile-panel-border);
}

.panel-title p {
  margin: 0 0 6px;

  color: var(--profile-accent);

  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.panel-title h2 {
  margin: 0;

  color: var(--profile-heading);

  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 850;
  line-height: 1.2;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.18),
    0 0 28px rgba(143, 124, 255, 0.18);
}

/* =========================
   Form
========================= */

.profile-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.form-field {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 9px;

  color: var(--profile-text);

  font-size: 0.9rem;
  font-weight: 800;
}

.form-field span {
  color: var(--profile-muted);

  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}

.form-field input {
  width: 100%;
  height: 48px;

  padding: 0 14px;

  color: var(--profile-text);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
    var(--profile-input-bg);

  border: 1px solid var(--profile-input-border);
  border-radius: 6px;

  outline: none;

  font-family: inherit;
  font-size: 0.94rem;
  font-weight: 700;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    inset 0 0 22px rgba(143, 124, 255, 0.025);

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.form-field input::placeholder {
  color: var(--profile-muted-soft);
}

.form-field input:focus {
  border-color: var(--profile-accent-border);
  box-shadow:
    0 0 0 3px var(--profile-accent-soft),
    0 0 18px rgba(143, 124, 255, 0.18);
}

.form-field input:disabled {
  color: var(--profile-input-disabled-text);
  background: var(--profile-input-disabled-bg);
  cursor: not-allowed;
}

.panel-actions {
  display: flex;
  justify-content: flex-end;

  margin-top: 28px;
}

.save-btn,
.password-btn {
  position: relative;

  min-width: 136px;
  min-height: 46px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 0 18px;

  color: var(--profile-button-text);
  background: var(--profile-button-bg);
  border: 1px solid var(--profile-accent-border);
  border-radius: 6px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 850;
  letter-spacing: 0.04em;

  box-shadow: var(--profile-shadow-sm);

  overflow: hidden;

  transition:
    background-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    border-color 0.18s ease;
}

.save-btn::after,
.password-btn::after {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 38%,
      rgba(255, 255, 255, 0.22) 50%,
      transparent 62%,
      transparent 100%
    );

  transform: translateX(-120%);
  transition: transform 0.65s ease;

  pointer-events: none;
}

.save-btn:hover,
.password-btn:hover {
  background: var(--profile-button-bg-hover);
  transform: translateY(-2px);
  box-shadow:
    0 0 24px rgba(143, 124, 255, 0.2),
    0 14px 34px rgba(0, 0, 0, 0.3);
  border-color: var(--profile-accent-border);
}

.save-btn:hover::after,
.password-btn:hover::after {
  transform: translateX(120%);
}

.save-btn:disabled,
.password-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* =========================
   Password
========================= */

.password-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
  gap: 32px;
  align-items: start;
}

.password-fields {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.password-hint {
  display: flex;
  gap: 12px;

  padding: 20px;

  color: var(--profile-muted);
  background:
    linear-gradient(145deg, var(--profile-accent-soft), rgba(81, 186, 252, 0.05));

  border: 1px solid var(--profile-accent-border);
  border-radius: 6px;

  line-height: 1.7;
  font-weight: 700;

  box-shadow: inset 0 0 20px rgba(143, 124, 255, 0.05);
}

.password-hint i {
  margin-top: 4px;
  color: var(--profile-accent);
}

.password-hint p {
  margin: 0;
}

/* =========================
   Toast
========================= */

.toast {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 5000;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  max-width: min(420px, calc(100vw - 48px));
  padding: 14px 18px;

  color: var(--profile-text);
  background: var(--profile-panel-bg);
  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  box-shadow:
    0 0 26px rgba(143, 124, 255, 0.18),
    var(--profile-shadow-lg);

  font-weight: 800;

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.toast.success i {
  color: var(--profile-success);
}

.toast.error i {
  color: var(--profile-error);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* =========================
   Light Theme Fine Tune
========================= */

:global(html[data-theme='light']) .profile-page {
  background:
    linear-gradient(rgba(143, 124, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.018) 1px, transparent 1px),
    radial-gradient(circle at 12% 8%, var(--profile-bg-radial-1), transparent 28%),
    radial-gradient(circle at 96% 14%, var(--profile-bg-radial-2), transparent 30%),
    var(--profile-bg);

  background-size:
    42px 42px,
    42px 42px,
    auto,
    auto,
    auto;
}

:global(html[data-theme='light']) .profile-sidebar {
  background:
    radial-gradient(circle at 35% 0%, var(--profile-accent-soft), transparent 30%),
    linear-gradient(180deg, var(--profile-sidebar-bg), var(--profile-bg));

  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.8),
    18px 0 40px rgba(15, 23, 42, 0.08);
}

:global(html[data-theme='light']) .profile-panel,
:global(html[data-theme='light']) .toast {
  box-shadow: var(--profile-shadow-lg);
}

/* =========================
   RWD
========================= */

@media (max-width: 1180px) {
  .profile-sidebar {
    width: 250px;
    padding: 30px 22px;
  }

  .profile-main {
    margin-left: 250px;
    padding: 38px clamp(22px, 4vw, 46px) 64px;
  }

  .password-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .profile-page {
    display: block;
  }

  .sidebar-toggle-btn {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 130;

    width: 48px;
    height: 48px;

    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5px;

    padding: 0;

    background: var(--profile-panel-bg);
    border: 1px solid var(--profile-panel-border);
    border-radius: 6px;

    cursor: pointer;

    box-shadow: var(--profile-shadow-md);

    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .sidebar-toggle-btn:hover {
    background: var(--profile-menu-hover-bg);
    border-color: var(--profile-accent-border);
    transform: translateY(-1px);
  }

  .sidebar-toggle-btn span {
    width: 20px;
    height: 2px;

    display: block;

    background: var(--profile-heading);
    border-radius: 999px;

    transition:
      transform 0.22s ease,
      opacity 0.18s ease,
      background-color 0.18s ease;
  }

  .profile-page.sidebar-open .sidebar-toggle-btn span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .profile-page.sidebar-open .sidebar-toggle-btn span:nth-child(2) {
    opacity: 0;
  }

  .profile-page.sidebar-open .sidebar-toggle-btn span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;

    display: block;

    background: rgba(0, 0, 0, 0.46);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  :global(html[data-theme='light']) .sidebar-overlay {
    background: rgba(10, 20, 40, 0.32);
  }

  .profile-sidebar {
    z-index: 110;

    width: min(82vw, 300px);
    height: 100vh;

    padding: 84px 24px 28px;

    transform: translateX(-104%);

    border-right: 1px solid var(--profile-sidebar-border);
  }

  .profile-page.sidebar-open .profile-sidebar {
    transform: translateX(0);
  }

  .profile-main {
    margin-left: 0;
    padding: 90px 20px 54px;
  }

  .profile-header {
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 24px;
  }

  .header-badge {
    display: none;
  }

  .profile-user-card {
    margin: 24px 0 28px;
  }

  .profile-form-grid {
    grid-template-columns: 1fr;
  }

  .password-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .sidebar-toggle-btn {
    top: 16px;
    left: 16px;

    width: 46px;
    height: 46px;
    border-radius: 6px;
  }

  .profile-sidebar {
    width: min(86vw, 286px);
    padding: 78px 20px 24px;
  }

  .profile-main {
    padding: 84px 14px 48px;
  }

  .profile-panel {
    padding: 20px 16px;
    border-radius: 8px;
  }

  .profile-panel::after {
    width: 26px;
    height: 26px;
  }

  .panel-actions {
    justify-content: stretch;
  }

  .save-btn,
  .password-btn {
    width: 100%;
  }

  .toast {
    right: 16px;
    bottom: 16px;
    max-width: calc(100vw - 32px);
  }
}

@media (max-width: 420px) {
  .profile-sidebar {
    width: min(88vw, 276px);
  }

  .profile-main {
    padding-left: 12px;
    padding-right: 12px;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .panel-title {
    padding-bottom: 18px;
    margin-bottom: 20px;
  }

  .panel-title h2 {
    font-size: 1.35rem;
  }
}
</style>