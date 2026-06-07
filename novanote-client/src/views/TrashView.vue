<template>
  <div
    class="trash-page"
    :class="{ 'dark-trash': currentTheme === 'dark' }"
    @click="closeContextMenu"
  >
    <header class="trash-header">
      <div class="trash-title-block">
        <p class="eyebrow">NOVA ARCHIVE</p>
        <h1 class="trash-title">星際回收站</h1>
        <p class="trash-subtitle">
          被刪除的卡片與星球會暫時停留在這裡，可以復原或永久刪除。
        </p>
      </div>

      <button class="back-universe-btn" @click="goUniverse">
        <i class="fa-solid fa-arrow-left"></i>
        返回宇宙
      </button>
    </header>

    <main class="trash-content">
      <!-- 筆記垃圾桶 -->
      <section class="trash-section">
        <div class="section-header">
          <div>
            <p class="section-kicker">DELETED NOTES</p>
            <h2 class="section-title">漂浮碎片</h2>
          </div>

          <span class="section-count">
            {{ trashNotes.length }} 張卡片
          </span>
        </div>

        <div v-if="loading" class="empty-state">
          <i class="fa-solid fa-spinner"></i>
          正在讀取星際回收站...
        </div>

        <div v-else-if="trashNotes.length === 0" class="empty-state">
          <i class="fa-regular fa-folder-open"></i>
          目前沒有被刪除的卡片
        </div>

        <div v-else class="trash-grid">
          <article
            v-for="note in trashNotes"
            :key="'note-' + note.id"
            class="trash-card note-card"
            @contextmenu.prevent.stop="openContextMenu($event, 'note', note)"
          >
            <div class="trash-card-top">
              <h3 class="item-title">
                {{ note.title || '未命名文件' }}
              </h3>

              <div
                class="trash-preview"
                v-html="note.content || '沒有內容'"
              ></div>

              <div class="trash-tags" v-if="note.tags?.length">
                <span
                  v-for="tag in note.tags"
                  :key="tag"
                  class="tag-pill"
                >
                  #{{ tag }}
                </span>
              </div>

              <p class="deleted-time">
                <i class="fa-regular fa-clock"></i>
                刪除時間：{{ formatDate(note.deleted_at) }}
              </p>
            </div>

            <div class="card-actions">
              <button
                class="restore-btn"
                @click.stop="restoreNote(note.id)"
              >
                <i class="fa-solid fa-rotate-left"></i>
                復原
              </button>

              <button
                class="delete-btn"
                @click.stop="permanentDeleteNote(note)"
              >
                <i class="fa-regular fa-trash-can"></i>
                永久刪除
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- 星球垃圾桶 -->
      <section class="trash-section">
        <div class="section-header">
          <div>
            <p class="section-kicker">DELETED PLANETS</p>
            <h2 class="section-title">消失星球</h2>
          </div>

          <span class="section-count">
            {{ trashPlanets.length }} 顆星球
          </span>
        </div>

        <div v-if="loading" class="empty-state">
          <i class="fa-solid fa-spinner"></i>
          正在讀取星際回收站...
        </div>

        <div v-else-if="trashPlanets.length === 0" class="empty-state">
          <i class="fa-regular fa-folder-open"></i>
          目前沒有被刪除的星球
        </div>

        <div v-else class="trash-grid">
          <article
            v-for="planet in trashPlanets"
            :key="'planet-' + planet.id"
            class="trash-card planet-card"
            @contextmenu.prevent.stop="openContextMenu($event, 'planet', planet)"
          >
            <div class="trash-card-top">
              <div class="planet-row">
                <div
                  class="planet-dot"
                  :style="{ background: planet.color || '#646cff' }"
                ></div>

                <div>
                  <h3 class="item-title planet-title">
                    {{ planet.name || '未命名星球' }}
                  </h3>

                  <p class="planet-texture">
                    {{ textureLabel(planet.texture_type) }}
                  </p>
                </div>
              </div>

              <p class="planet-note-hint">
                復原星球後，原本歸屬於此星球的卡片會保留在星球內。
              </p>

              <p class="deleted-time">
                <i class="fa-regular fa-clock"></i>
                刪除時間：{{ formatDate(planet.deleted_at) }}
              </p>
            </div>

            <div class="card-actions">
              <button
                class="restore-btn"
                @click.stop="restorePlanet(planet.id)"
              >
                <i class="fa-solid fa-rotate-left"></i>
                復原
              </button>

              <button
                class="delete-btn"
                @click.stop="permanentDeletePlanet(planet)"
              >
                <i class="fa-regular fa-trash-can"></i>
                永久刪除
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- 右鍵選單 -->
    <div
      v-if="contextMenu.show"
      class="trash-context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <button class="menu-option restore-option" @click="handleContextRestore">
        <i class="fa-solid fa-rotate-left"></i>
        復原
      </button>

      <button class="menu-option delete-option" @click="handleContextPermanentDelete">
        <i class="fa-regular fa-trash-can"></i>
        永久刪除
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { useNotesStore } from '../stores/notes'
import { usePlanetsStore } from '../stores/planets'

const router = useRouter()
const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()

const trashNotes = ref([])
const trashPlanets = ref([])
const loading = ref(false)

const currentTheme = ref('light')
let themeObserver = null

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  type: '',
  item: null
})

const getCurrentTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  const bodyTheme = document.body.getAttribute('data-theme')
  const appTheme = document.getElementById('app')?.getAttribute('data-theme')
  const savedTheme = localStorage.getItem('nova-theme')

  if (
    htmlTheme === 'dark' ||
    bodyTheme === 'dark' ||
    appTheme === 'dark' ||
    savedTheme === 'dark' ||
    document.documentElement.classList.contains('dark') ||
    document.body.classList.contains('dark') ||
    document.getElementById('app')?.classList.contains('dark') ||
    document.documentElement.classList.contains('dark-mode') ||
    document.body.classList.contains('dark-mode') ||
    document.getElementById('app')?.classList.contains('dark-mode')
  ) {
    return 'dark'
  }

  return 'light'
}

const syncTheme = () => {
  currentTheme.value = getCurrentTheme()
}

const loadTrash = async () => {
  loading.value = true

  try {
    const [notes, planets] = await Promise.all([
      notesStore.fetchTrashNotes(),
      planetsStore.fetchTrashPlanets()
    ])

    trashNotes.value = notes || []
    trashPlanets.value = planets || []
  } catch (err) {
    console.error('讀取星際回收站失敗:', err)
    alert('讀取星際回收站失敗，請稍後再試')
  } finally {
    loading.value = false
  }
}

const restoreNote = async (id) => {
  try {
    await notesStore.restoreNote(id)
    await loadTrash()
  } catch (err) {
    console.error('復原卡片失敗:', err)
    alert('復原卡片失敗，請稍後再試')
  }
}

const restorePlanet = async (id) => {
  try {
    await planetsStore.restorePlanet(id)
    await loadTrash()
  } catch (err) {
    console.error('復原星球失敗:', err)
    alert('復原星球失敗，請稍後再試')
  }
}

const permanentDeleteNote = async (note) => {
  const name = note.title || '未命名文件'

  if (!confirm(`確定要永久刪除「${name}」嗎？此操作無法復原。`)) {
    return
  }

  try {
    await notesStore.permanentDeleteNote(note.id)
    await loadTrash()
  } catch (err) {
    console.error('永久刪除卡片失敗:', err)
    alert('永久刪除卡片失敗，請稍後再試')
  }
}

const permanentDeletePlanet = async (planet) => {
  const name = planet.name || '未命名星球'

  if (
    !confirm(
      `確定要永久刪除「${name}」嗎？\n\n此操作無法復原。\n星球本身、星球內部卡片，以及相關連線都會一起被永久刪除。`
    )
  ) {
    return
  }

  try {
    await planetsStore.permanentDeletePlanet(planet.id)
    await loadTrash()
  } catch (err) {
    console.error('永久刪除星球失敗:', err)
    alert('永久刪除星球失敗，請稍後再試')
  }
}

const openContextMenu = (event, type, item) => {
  const menuWidth = 190
  const menuHeight = 104
  const margin = 12

  let x = event.clientX
  let y = event.clientY

  if (x + menuWidth > window.innerWidth - margin) {
    x = window.innerWidth - menuWidth - margin
  }

  if (y + menuHeight > window.innerHeight - margin) {
    y = window.innerHeight - menuHeight - margin
  }

  contextMenu.show = true
  contextMenu.x = x
  contextMenu.y = y
  contextMenu.type = type
  contextMenu.item = item
}

const closeContextMenu = () => {
  contextMenu.show = false
  contextMenu.type = ''
  contextMenu.item = null
}

const handleContextRestore = async () => {
  if (!contextMenu.item) return

  const { type, item } = contextMenu
  closeContextMenu()

  if (type === 'note') {
    await restoreNote(item.id)
  } else if (type === 'planet') {
    await restorePlanet(item.id)
  }
}

const handleContextPermanentDelete = async () => {
  if (!contextMenu.item) return

  const { type, item } = contextMenu
  closeContextMenu()

  if (type === 'note') {
    await permanentDeleteNote(item)
  } else if (type === 'planet') {
    await permanentDeletePlanet(item)
  }
}

const formatDate = (value) => {
  if (!value) return '未知'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const textureLabel = (type) => {
  const map = {
    rocky: '岩石行星',
    gas: '氣體巨星',
    ringed: '帶環行星',
    ice: '冰晶星球',
    lava: '熔岩星球',
    ocean: '海洋星球'
  }

  return map[type] || type || 'rocky'
}

const goUniverse = () => {
  router.push('/universe')
}

const handleEsc = (event) => {
  if (event.key === 'Escape') {
    closeContextMenu()
  }
}

onMounted(() => {
  syncTheme()
  loadTrash()

  themeObserver = new MutationObserver(syncTheme)

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class']
  })

  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-theme', 'class']
  })

  const appEl = document.getElementById('app')
  if (appEl) {
    themeObserver.observe(appEl, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    })
  }

  window.addEventListener('keydown', handleEsc)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEsc)

  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>

<style scoped>
.trash-page {
  min-height: 100vh;
  width: 100vw;
  padding: 56px 72px 96px;
  box-sizing: border-box;

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

  overflow-y: auto;
  overflow-x: hidden;
}

/* =========================
   Header
========================= */

.trash-header {
  width: min(100%, 1180px);

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  margin: 0 auto 44px;
}

.trash-title-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eyebrow {
  margin: 0;

  color: var(--profile-accent);

  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.trash-title {
  margin: 0;

  color: var(--profile-heading);

  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 950;
  line-height: 1.1;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.16),
    0 0 28px rgba(143, 124, 255, 0.18);
}

.trash-subtitle {
  margin: 0;

  color: var(--profile-muted);

  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.7;
}

.back-universe-btn {
  position: relative;

  min-height: 42px;
  padding: 0 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

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
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.02em;

  box-shadow: var(--profile-shadow-sm);

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease;
}

.back-universe-btn:hover {
  transform: translateY(-2px);
  color: var(--profile-accent);
  border-color: var(--profile-accent-border);
  background: var(--profile-menu-hover-bg);
  box-shadow: var(--profile-shadow-md);
}

/* =========================
   Main
========================= */

.trash-content {
  width: min(100%, 1180px);

  display: flex;
  flex-direction: column;
  gap: 36px;

  margin: 0 auto;
  padding-bottom: 80px;
}

/* =========================
   Section
========================= */

.trash-section {
  position: relative;

  padding: 32px 36px 34px;

  border-radius: 8px;
  border: 1px solid var(--profile-panel-border);

  background: var(--profile-panel-bg);
  box-shadow: var(--profile-shadow-lg);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  overflow: hidden;
}

.trash-section::before {
  content: '';

  position: absolute;
  inset: 0;
  z-index: 0;

  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.16) 1px, transparent 1.5px),
    linear-gradient(rgba(143, 124, 255, 0.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.024) 1px, transparent 1px);

  background-size:
    92px 92px,
    34px 34px,
    34px 34px;

  opacity: 0.5;
  pointer-events: none;
}

.trash-section::after {
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

.trash-section > * {
  position: relative;
  z-index: 2;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding-bottom: 20px;
  margin-bottom: 24px;

  border-bottom: 1px solid var(--profile-panel-border);
}

.section-kicker {
  margin: 0 0 5px;

  color: var(--profile-accent);

  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;

  color: var(--profile-heading);

  font-size: 1.35rem;
  font-weight: 950;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.16),
    0 0 24px rgba(143, 124, 255, 0.16);
}

.section-count {
  min-height: 32px;
  padding: 0 12px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--profile-muted);
  background: var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  font-size: 0.86rem;
  font-weight: 900;
}

/* =========================
   Empty
========================= */

.empty-state {
  min-height: 116px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  color: var(--profile-muted);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
    var(--profile-panel-bg-soft);

  border: 1px dashed var(--profile-panel-border);
  border-radius: 6px;

  font-size: 0.95rem;
  font-weight: 850;
}

.empty-state i {
  color: var(--profile-accent);
  filter: drop-shadow(0 0 8px rgba(143, 124, 255, 0.45));
}

/* =========================
   Cards
========================= */

.trash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.trash-card {
  position: relative;

  min-height: 230px;
  padding: 20px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;

  border-radius: 6px;
  border: 1px solid var(--profile-panel-border);

  background:
    radial-gradient(circle at 88% 12%, var(--profile-accent-soft), transparent 30%),
    linear-gradient(145deg, rgba(16, 19, 48, 0.94), rgba(7, 10, 28, 0.98));

  box-shadow: var(--profile-shadow-sm);

  cursor: context-menu;
  overflow: hidden;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

:global(html[data-theme='light']) .trash-card {
  background:
    radial-gradient(circle at 88% 12%, var(--profile-accent-soft), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.98));
}

.trash-card::before {
  content: '';

  position: absolute;
  inset: 7px;

  border: 1px solid rgba(180, 165, 255, 0.09);
  border-radius: 4px;

  pointer-events: none;
}

.trash-card::after {
  content: '';

  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 12px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      var(--profile-accent),
      rgba(81, 186, 252, 0.35),
      transparent
    );

  opacity: 0.72;
  pointer-events: none;
}

.trash-card:hover {
  transform: translateY(-3px);
  border-color: var(--profile-accent-border);
  box-shadow: var(--profile-shadow-md);
}

.trash-card > * {
  position: relative;
  z-index: 2;
}

.trash-card-top {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-title {
  margin: 0;

  color: var(--profile-heading);

  font-size: 1.08rem;
  font-weight: 950;
  line-height: 1.35;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  text-shadow: 0 0 12px rgba(143, 124, 255, 0.14);
}

.trash-preview {
  max-height: 64px;

  overflow: hidden;

  color: var(--profile-muted);
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.65;
}

.trash-preview :deep(p) {
  margin: 0 0 8px;
}

.trash-preview :deep(*) {
  font-size: inherit !important;
  line-height: inherit !important;
  color: inherit !important;
}

.trash-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-pill {
  padding: 4px 9px;

  color: var(--tag-text);
  background: var(--tag-bg);

  border: 1px solid var(--tag-border);
  border-radius: 4px;

  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.deleted-time,
.planet-texture,
.planet-note-hint {
  margin: 0;

  color: var(--profile-muted);

  font-size: 0.8rem;
  font-weight: 750;
  line-height: 1.55;
}

.deleted-time {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.deleted-time i {
  color: var(--profile-accent);
}

.planet-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.planet-dot {
  position: relative;

  width: 52px;
  height: 52px;
  flex: 0 0 auto;

  border-radius: 999px;

  box-shadow:
    inset -12px -12px 18px rgba(0, 0, 0, 0.38),
    inset 6px 6px 12px rgba(255, 255, 255, 0.24),
    0 0 24px rgba(143, 124, 255, 0.22);
}

.planet-dot::after {
  content: '';

  position: absolute;
  inset: -5px;

  border: 1px solid var(--profile-accent-border);
  border-radius: inherit;

  opacity: 0.8;
}

.planet-title {
  margin-bottom: 4px;
}

.planet-note-hint {
  color: var(--profile-muted-soft);
}

/* =========================
   Actions
========================= */

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.restore-btn,
.delete-btn {
  position: relative;

  height: 38px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  border-radius: 6px;
  border: 1px solid transparent;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 900;
  letter-spacing: 0.02em;

  overflow: hidden;

  transition:
    transform 0.16s ease,
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.restore-btn::after,
.delete-btn::after {
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

.restore-btn:hover::after,
.delete-btn:hover::after {
  transform: translateX(120%);
}

.restore-btn {
  color: var(--profile-button-text);
  background: var(--profile-button-bg);

  border-color: var(--profile-accent-border);

  box-shadow: 0 10px 24px rgba(143, 124, 255, 0.22);
}

.restore-btn:hover {
  transform: translateY(-1px);

  background: var(--profile-button-bg-hover);
  border-color: var(--profile-accent-border);

  box-shadow: 0 14px 30px rgba(143, 124, 255, 0.26);
}

.delete-btn {
  color: var(--danger-color);
  background: var(--danger-bg);

  border-color: rgba(255, 119, 119, 0.3);
}

.delete-btn:hover {
  transform: translateY(-1px);

  background: rgba(255, 90, 150, 0.16);
  border-color: var(--danger-color);

  box-shadow: 0 0 18px rgba(255, 90, 150, 0.12);
}

/* =========================
   Context Menu
========================= */

.trash-context-menu {
  position: fixed;
  z-index: 5000;

  min-width: 190px;
  padding: 8px;

  border-radius: 6px;
  border: 1px solid var(--profile-panel-border);

  background:
    radial-gradient(circle at 80% 0%, var(--profile-accent-soft), transparent 32%),
    var(--floating-bg);

  box-shadow:
    0 22px 60px rgba(0, 0, 0, 0.38),
    0 0 24px rgba(143, 124, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);

  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  animation: menuIn 0.14s ease;
}

.menu-option {
  width: 100%;

  padding: 11px 13px;

  display: flex;
  align-items: center;
  gap: 9px;

  border: none;
  border-radius: 6px;

  background: transparent;
  color: var(--profile-text);

  cursor: pointer;

  text-align: left;
  font-family: inherit;
  font-weight: 850;

  transition:
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.menu-option:hover {
  background: var(--profile-menu-hover-bg);
  transform: translateX(2px);
}

.restore-option {
  color: var(--profile-accent);
}

.delete-option {
  color: var(--danger-color);
}

@keyframes menuIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* =========================
   Scrollbar
========================= */

.trash-page::-webkit-scrollbar {
  width: 8px;
}

.trash-page::-webkit-scrollbar-thumb {
  background: var(--profile-accent-border);
  border-radius: 999px;
}

.trash-page::-webkit-scrollbar-thumb:hover {
  background: var(--profile-accent);
}

.trash-page::-webkit-scrollbar-track {
  background: transparent;
}

/* =========================
   Responsive
========================= */

@media (max-width: 900px) {
  .trash-page {
    padding: 36px 24px 72px;
  }

  .trash-header {
    flex-direction: column;
  }

  .trash-section {
    padding: 24px;
  }

  .trash-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .trash-page {
    padding: 30px 16px 64px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-actions {
    grid-template-columns: 1fr;
  }

  .trash-title {
    font-size: 1.8rem;
  }

  .trash-section {
    padding: 20px 16px;
  }
}
</style>