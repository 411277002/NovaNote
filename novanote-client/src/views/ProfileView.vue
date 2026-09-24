<template>
<div class="profile-page" :class="{ 'sidebar-open': isSidebarOpen }">
<button class="sidebar-toggle-btn" type="button" aria-label="開啟導覽選單" @click="toggleSidebar"><span></span><span></span><span></span></button><div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
<aside class="profile-sidebar"><div class="profile-user-card"><div class="profile-avatar"><i class="fa-solid fa-user-astronaut"></i></div><div class="profile-user-copy"><h2>{{ profile.username || 'SpaceExplorer' }}</h2><p>{{ profile.email }}</p></div></div>
<nav class="profile-menu" aria-label="個人檔案導覽"><button class="profile-menu-item" :class="{ active: activeSection === 'profile' }" type="button" @click="scrollToSectionAndClose('profile')"><i class="fa-regular fa-id-card"></i><span>個人檔案</span></button><button class="profile-menu-item" type="button" @click="goStarOverview"><i class="fa-solid fa-earth-americas"></i><span>星圖總覽</span></button><button class="profile-menu-item" type="button" @click="goTrash"><i class="fa-regular fa-trash-can"></i><span>星際回收站</span></button></nav>
<button class="logout-side-btn" type="button" @click="logout"><i class="fa-solid fa-arrow-right-from-bracket"></i><span>登出帳號</span></button></aside>
<main class="profile-main"><header class="profile-header"><p class="eyebrow">YOUR NOVANOTE</p><h1>個人檔案</h1><p class="page-subtitle">管理帳號資訊與安全設定</p></header>
<section class="stats-grid" aria-label="帳號統計"><article v-for="item in statCards" :key="item.key" class="stat-card"><span class="stat-icon"><i class="fa-solid" :class="item.icon"></i></span><strong>{{ item.value }}</strong><span class="stat-label">{{ item.label }}</span></article></section>
<section id="profile" class="profile-panel"><div class="panel-title"><div><p>ACCOUNT</p><h2>帳號資訊</h2></div><span class="panel-caption">您的 NovaNote 帳號資料</span></div><div class="account-layout"><div class="account-avatar"><i class="fa-solid fa-user-astronaut"></i></div><div class="profile-form-grid"><label class="form-field"><span>使用者名稱</span><input v-model="nameForm.username" type="text" placeholder="輸入使用者名稱" autocomplete="username"></label><label class="form-field"><span>電子郵件</span><input :value="profile.email || '尚未提供'" type="email" disabled></label><div class="panel-actions"><button class="save-btn" type="button" :disabled="savingProfile" @click="saveProfile"><i class="fa-solid fa-floppy-disk"></i>{{ savingProfile ? '儲存中…' : '儲存變更' }}</button></div></div></div></section>
<section id="security" class="profile-panel"><div class="panel-title"><div><p>SECURITY</p><h2>更改密碼</h2></div><span class="panel-caption">定期更新密碼，保護您的帳號</span></div><div class="password-fields"><label class="form-field"><span>舊密碼</span><input v-model="passwordForm.currentPassword" type="password" placeholder="輸入目前密碼" autocomplete="current-password"></label><label class="form-field"><span>新密碼</span><input v-model="passwordForm.newPassword" type="password" placeholder="至少 6 個字元" autocomplete="new-password"></label><label class="form-field"><span>確認新密碼</span><input v-model="passwordForm.confirmPassword" type="password" placeholder="再次輸入新密碼" autocomplete="new-password"></label></div><div class="password-footer"><p class="password-hint"><i class="fa-solid fa-circle-info"></i> 密碼至少需要 6 個字元。</p><button class="save-btn" type="button" :disabled="savingPassword" @click="changePassword"><i class="fa-solid fa-key"></i>{{ savingPassword ? '更新中…' : '更新密碼' }}</button></div></section></main>
<transition name="toast"><div v-if="toast.message" class="toast" :class="toast.type"><i class="fa-solid" :class="toast.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'"></i>{{ toast.message }}</div></transition></div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import { usePlanetsStore } from '../stores/planets'
import { useLinksStore } from '../stores/links'

const router = useRouter()
const authStore = useAuthStore()
const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()
const linksStore = useLinksStore()

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

const statCards = computed(() => {
  const allNotes = notesStore.allNotes || []
  const tags = new Set(allNotes.flatMap(note => Array.isArray(note.tags) ? note.tags : []).map(tag => String(tag).trim()).filter(Boolean))
  return [
    { key: 'planets', label: '星球數量', value: planetsStore.planets?.length || 0, icon: 'fa-earth-americas' },
    { key: 'notes', label: '筆記數量', value: allNotes.length, icon: 'fa-note-sticky' },
    { key: 'links', label: '連結數量', value: linksStore.links?.length || 0, icon: 'fa-link' },
    { key: 'tags', label: '標籤數量', value: tags.size, icon: 'fa-tags' }
  ]
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
.profile-page{--radius-box:.5rem;--radius-field:.25rem;--radius-selector:1rem;--bg:#0a1026;--panel:rgba(20,31,57,.78);--text:#eceff4;--muted:#aab7ca;--subtle:#8291a9;--line:rgba(136,192,208,.16);--frost:#88c0d0;--danger:#d0878d;min-height:100vh;color:var(--text);background:radial-gradient(ellipse at 78% 8%,rgba(37,74,122,.18),transparent 34rem),linear-gradient(135deg,#0a1026,#050816 78%);font-family:var(--font-main,Inter,'Noto Sans TC',sans-serif);overflow-x:clip}
:global(html),:global(body),:global(#app){min-height:100%;overflow-x:hidden;overflow-y:auto}
.profile-sidebar{position:fixed;inset:20px auto 20px 20px;z-index:50;width:238px;display:flex;flex-direction:column;padding:22px 16px 16px;border:1px solid var(--line);border-radius:calc(var(--radius-box)*1.5);background:linear-gradient(160deg,#131f39f0,#080f22e8);box-shadow:0 18px 55px #0003;backdrop-filter:blur(18px)}
.profile-user-card{display:flex;align-items:center;gap:12px;padding:7px 6px 20px;border-bottom:1px solid var(--line)}.profile-avatar,.account-avatar{display:grid;place-items:center;color:var(--frost);background:#5e81ac2e;border:1px solid #88c0d03b;border-radius:50%}.profile-avatar{width:44px;height:44px}.profile-user-copy{min-width:0}.profile-user-copy h2{overflow:hidden;margin:0;color:var(--text);font-size:14px;text-overflow:ellipsis;white-space:nowrap}.profile-user-copy p{overflow:hidden;margin:4px 0 0;color:var(--subtle);font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.profile-menu{display:grid;gap:7px;margin-top:22px}.profile-menu-item,.logout-side-btn{display:flex;align-items:center;gap:12px;width:100%;min-height:43px;padding:0 12px;color:var(--muted);border:1px solid transparent;border-radius:var(--radius-field);background:transparent;cursor:pointer;font:inherit;font-size:13px;text-align:left}.profile-menu-item i,.logout-side-btn i{width:17px;text-align:center}.profile-menu-item:hover,.profile-menu-item.active{color:var(--text);background:#5e81ac30}.profile-menu-item.active{border-color:#88c0d02e;box-shadow:inset 3px 0 var(--frost)}.logout-side-btn{margin-top:auto;color:var(--danger);background:#bf616a12}
.profile-main{width:min(100% - 310px,1120px);margin:0 auto 0 max(286px,calc((100% - 1120px + 286px)/2));padding:54px 32px}.profile-header{margin-bottom:24px}.eyebrow,.panel-title>div>p{margin:0 0 8px;color:var(--frost);font-size:10px;font-weight:700;letter-spacing:.18em}.profile-header h1{margin:0;color:var(--text);font-size:clamp(28px,4vw,38px)}.page-subtitle{margin:8px 0 0;color:var(--muted);font-size:14px}.stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.stat-card{display:grid;grid-template-columns:34px 1fr;grid-template-rows:auto auto;align-items:center;gap:0 12px;min-height:100px;padding:17px;border:1px solid var(--line);border-radius:var(--radius-box);background:linear-gradient(145deg,#26385899,var(--panel))}.stat-icon{grid-row:1/3;display:grid;place-items:center;width:34px;height:34px;color:var(--frost);background:#5e81ac26;border-radius:var(--radius-selector)}.stat-card strong{font-size:26px;line-height:1}.stat-label{margin-top:5px;color:var(--muted);font-size:12px}
.profile-panel{margin-top:16px;padding:22px;border:1px solid var(--line);border-radius:var(--radius-box);background:var(--panel);backdrop-filter:blur(14px);scroll-margin-top:24px}.panel-title{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px}.panel-title h2{margin:0;font-size:19px}.panel-caption,.password-hint{color:var(--subtle);font-size:12px}.account-layout{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:24px}.account-avatar{width:88px;height:88px;font-size:34px}.profile-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 18px;align-items:end}.form-field{display:grid;gap:7px;color:var(--muted);font-size:12px;font-weight:600}.form-field input{width:100%;min-height:42px;padding:0 12px;color:var(--text);border:1px solid var(--line);border-radius:var(--radius-field);outline:0;background:#070e1f4d;font:inherit;font-size:13px}.form-field input:focus{border-color:#88c0d07a}.form-field input:disabled{color:var(--muted)}.panel-actions{display:flex;justify-content:flex-end;grid-column:1/-1}.save-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:40px;padding:0 15px;color:#182638;border:0;border-radius:var(--radius-field);background:linear-gradient(135deg,#88c0d0,#81a1c1);cursor:pointer;font:inherit;font-size:12px;font-weight:700}.save-btn:disabled{opacity:.62;cursor:wait}.password-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.password-footer{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:18px}.password-hint{display:flex;align-items:center;gap:8px;margin:0}.password-hint i{color:var(--frost)}
.sidebar-toggle-btn,.sidebar-overlay{display:none}.toast{position:fixed;right:24px;bottom:24px;z-index:100;padding:13px 17px;color:var(--text);border:1px solid var(--line);border-radius:var(--radius-box);background:var(--panel);box-shadow:0 12px 32px #0004}.toast.success i{color:#a3be8c}.toast.error i{color:#d0878d}
:global(html:is([data-theme='light'], [data-theme='novanote-nord-light'])) .profile-page{--panel:rgba(229,233,240,.92);--text:#2e3440;--muted:#4c566a;--subtle:#707d91;--line:rgba(76,86,106,.16);--frost:#5e81ac;--danger:#bf616a;background:radial-gradient(ellipse at 78% 8%,#88c0d02e,transparent 34rem),linear-gradient(135deg,#eceff4,#e5e9f0 78%)}:global(html:is([data-theme='light'], [data-theme='novanote-nord-light'])) .profile-sidebar,:global(html:is([data-theme='light'], [data-theme='novanote-nord-light'])) .stat-card,:global(html:is([data-theme='light'], [data-theme='novanote-nord-light'])) .profile-panel{background:rgba(229,233,240,.9);box-shadow:0 10px 28px #2e344010}:global(html:is([data-theme='light'], [data-theme='novanote-nord-light'])) .form-field input{background:#eceff4dd}
@media(max-width:1100px){.profile-main{width:calc(100% - 286px);margin-left:270px;padding-inline:24px}}@media(max-width:820px){.sidebar-toggle-btn{position:fixed;top:16px;left:16px;z-index:70;display:grid;gap:4px;width:42px;height:42px;padding:10px;border:1px solid var(--line);border-radius:var(--radius-field);background:var(--panel)}.sidebar-toggle-btn span{height:2px;background:var(--text)}.sidebar-overlay{position:fixed;inset:0;z-index:45;display:block;background:#0308148a;backdrop-filter:blur(3px)}.profile-sidebar{inset:12px auto 12px 12px;width:min(280px,calc(100vw - 40px));transform:translateX(calc(-100% - 20px));transition:transform 220ms}.profile-page.sidebar-open .profile-sidebar{transform:translateX(0)}.profile-main{width:100%;margin:0;padding:78px 20px 36px}.stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.profile-main{padding:72px 14px 28px}.profile-panel{padding:17px 14px}.account-layout{grid-template-columns:1fr;gap:15px}.account-avatar{width:68px;height:68px}.profile-form-grid,.password-fields{grid-template-columns:1fr}.panel-title,.password-footer{align-items:flex-start;flex-direction:column}.password-footer .save-btn{width:100%}}
</style>
