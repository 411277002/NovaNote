<template>
  <aside class="sidebar-panel" :class="{ 'is-collapsed': isCollapsed }">
    <button class="toggle-btn" type="button" @click="toggleSidebar">
      {{ isCollapsed ? '→' : '←' }}
    </button>

    <div class="sidebar-content" v-show="!isCollapsed">
      <div class="sidebar-main">
        <!-- Logo + 星系導航 -->
        <header class="sidebar-brand-block">
          <img
            :src="sidebarLogo"
            alt="NovaNote Logo"
            class="sidebar-logo-img"
          />

          <div class="sidebar-brand-text">
            <div class="sidebar-nav-title">星系導航</div>
            <div class="sidebar-nav-subtitle">Knowledge Universe</div>
          </div>
        </header>

        <!-- 搜尋 -->
        <div class="search-wrapper">
          <span class="search-icon">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>

          <input
            :value="searchQuery"
            type="text"
            placeholder="搜尋卡片或星球..."
            class="search-input"
            @input="handleInput"
          />

          <span
            v-if="searchQuery"
            class="clear-icon"
            @click="clearSearch"
          >
            ×
          </span>
        </div>

        <!-- 我的星球 -->
        <section class="sidebar-section">
          <h4 class="section-title">我的星球</h4>

          <ul class="item-list planet-tree-list">
            <li
              v-for="planet in planetsStore.planets"
              :key="planet.id"
              class="planet-tree-item"
            >
              <button
                type="button"
                class="planet-tree-row nav-item"
                :class="[
                  getSearchStatus(planet.name),
                  { expanded: isPlanetExpanded(planet.id) }
                ]"
                @click="togglePlanetExpand(planet.id)"
              >
                <span
                  class="tree-chevron"
                  :class="{ expanded: isPlanetExpanded(planet.id) }"
                >
                  <i class="fa-solid fa-chevron-right"></i>
                </span>

                <span class="planet-icon icon-badge planet-badge">
                  <i class="fa-solid fa-earth-asia"></i>
                </span>

                <span class="name">
                  {{ planet.name || '未命名星球' }}
                </span>

                <span class="count">
                  {{ getNoteCount(planet.id) }}
                </span>
              </button>

              <transition name="tree-expand">
                <ul
                  v-show="isPlanetExpanded(planet.id)"
                  class="planet-note-list"
                >
                  <li
                    v-for="note in getNotesByPlanet(planet.id)"
                    :key="note.id"
                    class="planet-note-tree-item"
                    :class="getSearchStatus(note.title || '無標題')"
                    @click.stop="$emit('select-note', note)"
                  >
                    <span class="tree-branch-line"></span>

                    <span class="planet-note-icon">
                      <i class="fa-solid fa-file-lines"></i>
                    </span>

                    <span class="planet-note-name">
                      {{ note.title || '無標題' }}
                    </span>
                  </li>

                  <li
                    v-if="getNotesByPlanet(planet.id).length === 0"
                    class="planet-note-empty"
                  >
                    <span class="tree-branch-line"></span>
                    <span>這顆星球尚無卡片</span>
                  </li>
                </ul>
              </transition>
            </li>
          </ul>
        </section>

        <!-- 漂浮碎片 -->
        <section class="sidebar-section">
          <h4 class="section-title">漂浮碎片</h4>

          <ul class="item-list">
            <li
              v-for="note in notesStore.floatingNotes"
              :key="note.id"
              class="note-item nav-item"
              :class="getSearchStatus(note.title || '無標題')"
              @click="$emit('select-note', note)"
            >
              <span class="note-icon icon-badge note-badge">
                <i class="fa-solid fa-puzzle-piece"></i>
              </span>

              <span class="name">
                {{ note.title || '無標題' }}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'

import { useNotesStore } from '../../stores/notes'
import { usePlanetsStore } from '../../stores/planets'

import logoDark from '../../assets/logo-dark.png'
import logoLight from '../../assets/logo-light.png'

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'update:collapsed',
  'select-planet',
  'select-note'
])

const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()

const currentTheme = ref(
  document.documentElement.getAttribute('data-theme') || 'dark'
)

const expandedPlanetIds = ref(new Set())

let themeObserver = null

const isCollapsed = computed({
  get: () => props.collapsed,
  set: value => emit('update:collapsed', value)
})

const sidebarLogo = computed(() => {
  return currentTheme.value === 'light' ? logoLight : logoDark
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleInput = (event) => {
  emit('update:searchQuery', event.target.value)

  requestAnimationFrame(() => {
    expandPlanetsBySearch()
  })
}

const clearSearch = () => {
  emit('update:searchQuery', '')
}

const getNotesByPlanet = (planetId) => {
  return (notesStore.allNotes || []).filter((note) => {
    return String(note.planet_id || note.planetId || '') === String(planetId)
  })
}

const getNoteCount = (planetId) => {
  return getNotesByPlanet(planetId).length
}

const isPlanetExpanded = (planetId) => {
  return expandedPlanetIds.value.has(String(planetId))
}

const togglePlanetExpand = (planetId) => {
  const id = String(planetId)
  const nextSet = new Set(expandedPlanetIds.value)

  if (nextSet.has(id)) {
    nextSet.delete(id)
  } else {
    nextSet.add(id)
  }

  expandedPlanetIds.value = nextSet
}

const expandPlanet = (planetId) => {
  if (!planetId) return

  const nextSet = new Set(expandedPlanetIds.value)
  nextSet.add(String(planetId))
  expandedPlanetIds.value = nextSet
}

const expandPlanetsBySearch = () => {
  const query = props.searchQuery.trim().toLowerCase()

  if (!query) return

  const nextSet = new Set(expandedPlanetIds.value)

  ;(notesStore.allNotes || []).forEach((note) => {
    const title = String(note.title || '').toLowerCase()
    const content = String(note.content || '').toLowerCase()
    const tags = note.tags || []

    const tagMatched = tags.some(tag => {
      return String(tag).toLowerCase().includes(query)
    })

    const matched =
      title.includes(query) ||
      content.includes(query) ||
      tagMatched

    if (matched && (note.planet_id || note.planetId)) {
      nextSet.add(String(note.planet_id || note.planetId))
    }
  })

  planetsStore.planets.forEach((planet) => {
    const planetName = String(planet.name || '').toLowerCase()

    if (planetName.includes(query)) {
      nextSet.add(String(planet.id))
    }
  })

  expandedPlanetIds.value = nextSet
}

const getSearchStatus = (title) => {
  const query = props.searchQuery.trim().toLowerCase()

  if (!query) return ''

  const isMatch = String(title || '').toLowerCase().includes(query)

  return isMatch ? 'highlight' : 'dim'
}

watch(
  () => props.searchQuery,
  () => {
    expandPlanetsBySearch()
  }
)

watch(
  () => notesStore.allNotes,
  () => {
    expandPlanetsBySearch()
  },
  { deep: true }
)

onMounted(() => {
  themeObserver = new MutationObserver(() => {
    currentTheme.value =
      document.documentElement.getAttribute('data-theme') || 'dark'
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onBeforeUnmount(() => {
  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }
})
</script>

<style scoped>
.sidebar-panel {
  --sidebar-bg:
    radial-gradient(circle at 30% 0%, rgba(165, 140, 255, 0.12), transparent 28%),
    radial-gradient(circle at 80% 18%, rgba(105, 130, 255, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(8, 10, 30, 0.96), rgba(4, 6, 18, 0.98));

  --sidebar-surface:
    radial-gradient(circle at 50% 0%, rgba(165, 140, 255, 0.1), transparent 50%),
    linear-gradient(145deg, rgba(18, 22, 50, 0.82), rgba(7, 10, 28, 0.88));

  --sidebar-surface-hover:
    radial-gradient(circle at 14% 50%, rgba(165, 140, 255, 0.18), transparent 34%),
    linear-gradient(145deg, rgba(24, 28, 68, 0.9), rgba(9, 12, 32, 0.92));

  --sidebar-item-bg:
    linear-gradient(135deg, rgba(255, 255, 255, 0.018), rgba(255, 255, 255, 0.006));

  --sidebar-item-hover-bg:
    radial-gradient(circle at 12% 50%, rgba(165, 140, 255, 0.16), transparent 35%),
    linear-gradient(135deg, rgba(145, 120, 255, 0.12), rgba(8, 12, 32, 0.72));

  --sidebar-item-active-bg:
    radial-gradient(circle at 12% 50%, rgba(165, 140, 255, 0.22), transparent 36%),
    linear-gradient(135deg, rgba(145, 120, 255, 0.18), rgba(8, 12, 32, 0.82));

  --sidebar-text: #e5e8ff;
  --sidebar-heading: #fbfaff;
  --sidebar-muted: #9da5c9;
  --sidebar-muted-soft: #737c9d;

  --sidebar-accent: #a58cff;
  --sidebar-accent-2: #7f8cff;
  --sidebar-accent-soft: rgba(165, 140, 255, 0.13);
  --sidebar-accent-border: rgba(180, 165, 255, 0.42);

  --sidebar-border: rgba(165, 150, 245, 0.18);
  --sidebar-border-strong: rgba(180, 165, 255, 0.42);

  --sidebar-icon-color: #b9aaff;
  --sidebar-icon-bg:
    radial-gradient(circle at 50% 30%, rgba(165, 140, 255, 0.24), transparent 58%),
    rgba(145, 120, 255, 0.08);

  --sidebar-icon-hover-color: #f4f1ff;
  --sidebar-icon-hover-bg:
    radial-gradient(circle at 50% 30%, rgba(165, 140, 255, 0.34), transparent 60%),
    rgba(145, 120, 255, 0.16);

  --sidebar-search-bg:
    linear-gradient(135deg, rgba(12, 16, 42, 0.86), rgba(5, 8, 24, 0.92));

  --sidebar-count-color: #c5caff;
  --sidebar-count-bg: rgba(145, 120, 255, 0.1);
  --sidebar-count-hover-color: #ffffff;
  --sidebar-count-hover-bg: rgba(165, 140, 255, 0.18);

  --sidebar-shadow-sm:
    inset 0 0 0 1px rgba(255, 255, 255, 0.025),
    0 0 14px rgba(145, 120, 255, 0.08),
    0 8px 20px rgba(0, 0, 0, 0.22);

  --sidebar-shadow-md:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    0 0 22px rgba(145, 120, 255, 0.14),
    0 14px 32px rgba(0, 0, 0, 0.3);

  position: fixed;
  inset: 0 auto 0 0;

  width: 264px;
  height: 100vh;

  color: var(--sidebar-text);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);

  z-index: 100;
  overflow: visible;
  box-sizing: border-box;

  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.035),
    14px 0 44px rgba(0, 0, 0, 0.28),
    0 0 34px rgba(145, 120, 255, 0.08);

  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);

  transition:
    width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease;
}

.sidebar-panel::before {
  content: '';

  position: absolute;
  inset: 0;
  z-index: -1;

  background:
    linear-gradient(rgba(165, 140, 255, 0.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(165, 140, 255, 0.024) 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1.5px);

  background-size:
    32px 32px,
    32px 32px,
    86px 86px;

  opacity: 0.52;
  pointer-events: none;
}

.sidebar-panel::after {
  content: '';

  position: absolute;
  top: 22px;
  right: 16px;

  width: 34px;
  height: 34px;

  border-top: 2px solid rgba(180, 170, 255, 0.7);
  border-right: 2px solid rgba(180, 170, 255, 0.7);

  filter:
    drop-shadow(0 0 8px rgba(165, 140, 255, 0.42))
    drop-shadow(0 0 16px rgba(105, 130, 255, 0.14));

  pointer-events: none;
}

.sidebar-panel,
.sidebar-panel * {
  box-sizing: border-box;
}

.sidebar-panel.is-collapsed {
  width: 0;
}

/* =========================
   Toggle Button
========================= */

.toggle-btn {
  position: absolute;
  top: 28px;
  right: -34px;

  width: 34px;
  height: 58px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--sidebar-muted);
  background:
    radial-gradient(circle at 0% 50%, rgba(165, 140, 255, 0.14), transparent 58%),
    linear-gradient(145deg, rgba(12, 16, 42, 0.96), rgba(5, 8, 24, 0.98));

  border: 1px solid var(--sidebar-border);
  border-left: none;
  border-radius: 0 8px 8px 0;

  clip-path: polygon(
    0 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    0 100%
  );

  cursor: pointer;
  z-index: 220;

  box-shadow:
    0 0 18px rgba(145, 120, 255, 0.1),
    8px 0 24px rgba(0, 0, 0, 0.25);

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.toggle-btn:hover {
  color: #f4f1ff;
  background:
    radial-gradient(circle at 0% 50%, rgba(165, 140, 255, 0.24), transparent 60%),
    linear-gradient(145deg, rgba(22, 26, 62, 0.98), rgba(7, 10, 30, 0.98));

  border-color: var(--sidebar-border-strong);
  box-shadow:
    0 0 22px rgba(145, 120, 255, 0.22),
    8px 0 28px rgba(0, 0, 0, 0.3);
}

/* =========================
   Content
========================= */

.sidebar-content {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  padding: 18px 14px 18px;

  overflow: hidden;
  min-width: 0;
}

.sidebar-main {
  flex: 1;
  min-height: 0;
  width: 100%;
  min-width: 0;

  overflow-y: auto;
  overflow-x: hidden;

  padding: 0 2px 18px 0;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* =========================
   Brand
========================= */

.sidebar-brand-block {
  position: relative;

  width: 100%;
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 10px;

  margin: 0 0 22px;
  padding: 10px 4px 16px;

  border-bottom: 1px solid rgba(165, 150, 245, 0.2);
}

.sidebar-brand-block::after {
  content: '';

  position: absolute;
  left: 4px;
  right: 4px;
  bottom: -1px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(165, 140, 255, 0.52),
      rgba(255, 255, 255, 0.26),
      transparent
    );

  opacity: 0.9;
}

.sidebar-logo-img {
  width: 58px;
  height: 58px;

  object-fit: contain;
  flex-shrink: 0;

  filter:
    drop-shadow(0 0 10px rgba(165, 140, 255, 0.2))
    drop-shadow(0 0 18px rgba(105, 130, 255, 0.1));
}

.sidebar-brand-text {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;

  overflow: hidden;
}

.sidebar-nav-title {
  color: var(--sidebar-heading);

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 1rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  line-height: 1.15;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.18),
    0 0 22px rgba(145, 120, 255, 0.16);
}

.sidebar-nav-subtitle {
  margin-top: 5px;

  color: #a58cff;

  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;

  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================
   Search
========================= */

.search-wrapper {
  position: relative;

  width: 100%;
  min-width: 0;

  margin: 12px 0 26px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  z-index: 2;

  transform: translateY(-50%);

  color: var(--sidebar-muted);
  font-size: 0.86rem;

  pointer-events: none;

  transition: color 0.18s ease;
}

.search-input {
  width: 100%;
  height: 44px;

  padding: 0 38px 0 40px;

  color: var(--sidebar-text);
  background: var(--sidebar-search-bg);

  border: 1px solid rgba(165, 150, 245, 0.24);
  border-radius: 8px;

  clip-path: polygon(
    9px 0,
    calc(100% - 9px) 0,
    100% 9px,
    100% calc(100% - 9px),
    calc(100% - 9px) 100%,
    9px 100%,
    0 calc(100% - 9px),
    0 9px
  );

  font-size: 0.86rem;
  font-weight: 650;

  outline: none;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.018),
    inset 0 0 18px rgba(165, 140, 255, 0.035),
    var(--sidebar-shadow-sm);

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.search-input::placeholder {
  color: var(--sidebar-muted-soft);
}

.search-input:focus {
  border-color: rgba(180, 165, 255, 0.62);

  box-shadow:
    0 0 0 3px rgba(165, 140, 255, 0.12),
    0 0 22px rgba(145, 120, 255, 0.16),
    inset 0 0 18px rgba(165, 140, 255, 0.05);
}

.search-wrapper:focus-within .search-icon {
  color: var(--sidebar-accent);
}

.clear-icon {
  position: absolute;
  right: 13px;
  top: 50%;

  width: 22px;
  height: 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  transform: translateY(-50%);

  color: var(--sidebar-muted);
  border-radius: 6px;

  cursor: pointer;
  font-size: 1.05rem;
  line-height: 1;

  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.clear-icon:hover {
  color: #ffffff;
  background: var(--sidebar-accent-soft);
}

/* =========================
   Sections
========================= */

.sidebar-section {
  width: 100%;
  min-width: 0;
  margin-bottom: 30px;
}

.section-title {
  position: relative;

  margin: 0 0 12px;
  padding: 0 6px 0 10px;

  color: var(--sidebar-muted);

  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.section-title::before {
  content: '';

  position: absolute;
  left: 0;
  top: 50%;

  width: 3px;
  height: 12px;

  border-radius: 999px;
  background: var(--sidebar-accent);

  transform: translateY(-50%);

  box-shadow: 0 0 10px rgba(165, 140, 255, 0.52);
}

.item-list {
  width: 100%;
  min-width: 0;

  list-style: none;
  padding: 0;
  margin: 0;
}

/* =========================
   Items
========================= */

.nav-item {
  position: relative;

  width: 100%;
  min-width: 0;

  display: flex;
  align-items: center;

  margin-bottom: 8px;
  padding: 9px 10px;

  color: var(--sidebar-text);
  background: var(--sidebar-item-bg);
  border: 1px solid transparent;
  border-radius: 8px;

  clip-path: polygon(
    8px 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    8px 100%,
    0 calc(100% - 8px),
    0 8px
  );

  cursor: pointer;
  overflow: hidden;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    transform 0.18s ease,
    filter 0.18s ease;
}

.nav-item::before {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 60%,
      transparent 100%
    );

  transform: translateX(-120%);
  transition: transform 0.56s ease;

  pointer-events: none;
}

.nav-item:hover,
.nav-item.highlight {
  color: var(--sidebar-heading);
  background: var(--sidebar-item-hover-bg);
  border-color: rgba(165, 150, 245, 0.28);
  box-shadow:
    0 0 18px rgba(145, 120, 255, 0.12),
    inset 0 0 18px rgba(165, 140, 255, 0.035);
  transform: translateX(3px);
}

.nav-item:hover::before,
.nav-item.highlight::before {
  transform: translateX(120%);
}

.nav-item.highlight {
  background: var(--sidebar-item-active-bg);
  border-color: var(--sidebar-accent-border);
}

.nav-item.highlight::after {
  content: '';

  position: absolute;
  left: 0;
  top: 9px;
  bottom: 9px;

  width: 3px;
  border-radius: 999px;

  background: var(--sidebar-accent);

  box-shadow:
    0 0 10px rgba(165, 140, 255, 0.7),
    0 0 20px rgba(105, 130, 255, 0.2);
}

.nav-item.dim {
  opacity: 0.38;
  filter: grayscale(0.65);
}

.nav-item.dim:hover {
  opacity: 0.68;
  filter: grayscale(0.2);
}

/* =========================
   Planet Tree
========================= */

.planet-tree-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.planet-tree-item {
  width: 100%;
  min-width: 0;
}

.planet-tree-row {
  width: 100%;
  border: 1px solid transparent;
  font-family: inherit;
  text-align: left;
}

.planet-tree-row.expanded {
  color: var(--sidebar-heading);
  background: var(--sidebar-item-active-bg);
  border-color: rgba(165, 150, 245, 0.28);
  box-shadow:
    0 0 16px rgba(145, 120, 255, 0.1),
    inset 0 0 16px rgba(165, 140, 255, 0.035);
}

.tree-chevron {
  width: 18px;
  height: 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;
  margin-right: 4px;

  color: var(--sidebar-muted);
  font-size: 0.7rem;

  transition:
    transform 0.18s ease,
    color 0.18s ease;
}

.tree-chevron.expanded {
  color: var(--sidebar-accent);
  transform: rotate(90deg);
}

.planet-note-list {
  position: relative;

  display: flex;
  flex-direction: column;
  gap: 3px;

  margin: 4px 0 10px 22px;
  padding: 4px 0 4px 14px;

  border-left: 1px solid rgba(165, 150, 245, 0.18);
}

.planet-note-tree-item {
  position: relative;

  min-height: 34px;
  padding: 7px 8px 7px 4px;

  display: flex;
  align-items: center;
  gap: 9px;

  color: var(--sidebar-muted);
  border-radius: 8px;

  cursor: pointer;
  overflow: hidden;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease,
    opacity 0.18s ease,
    filter 0.18s ease;
}

.planet-note-tree-item:hover,
.planet-note-tree-item.highlight {
  color: #ffffff;
  background:
    radial-gradient(circle at 12% 50%, rgba(165, 140, 255, 0.14), transparent 36%),
    rgba(145, 120, 255, 0.08);
  transform: translateX(3px);
}

.planet-note-tree-item.dim {
  opacity: 0.38;
  filter: grayscale(0.65);
}

.tree-branch-line {
  position: absolute;
  left: -14px;
  top: 50%;

  width: 12px;
  height: 1px;

  background: rgba(165, 150, 245, 0.28);

  transform: translateY(-50%);
}

.planet-note-icon {
  width: 24px;
  height: 24px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: #a58cff;
  background:
    radial-gradient(circle at 50% 30%, rgba(165, 140, 255, 0.2), transparent 58%),
    rgba(145, 120, 255, 0.08);

  border: 1px solid rgba(165, 150, 245, 0.2);
  border-radius: 7px;

  font-size: 0.72rem;
}

.planet-note-name {
  flex: 1;
  min-width: 0;

  font-size: 0.82rem;
  font-weight: 750;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.planet-note-empty {
  position: relative;

  min-height: 32px;
  padding: 7px 8px 7px 4px;

  display: flex;
  align-items: center;

  color: var(--sidebar-muted-soft);

  font-size: 0.78rem;
  font-weight: 700;
}

/* 展開動畫 */
.tree-expand-enter-active,
.tree-expand-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    max-height 0.22s ease;
  overflow: hidden;
}

.tree-expand-enter-from,
.tree-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

.tree-expand-enter-to,
.tree-expand-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 520px;
}

/* =========================
   Icons
========================= */

.planet-icon,
.note-icon {
  margin-right: 11px;
  flex-shrink: 0;
}

.planet-tree-row .planet-icon {
  margin-right: 11px;
}

.icon-badge {
  width: 30px;
  height: 30px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--sidebar-icon-color);
  background: var(--sidebar-icon-bg);

  border: 1px solid rgba(165, 150, 245, 0.24);
  border-radius: 8px;

  clip-path: polygon(
    7px 0,
    calc(100% - 7px) 0,
    100% 7px,
    100% calc(100% - 7px),
    calc(100% - 7px) 100%,
    7px 100%,
    0 calc(100% - 7px),
    0 7px
  );

  font-size: 0.88rem;

  box-shadow:
    inset 0 0 10px rgba(165, 140, 255, 0.06),
    0 0 10px rgba(145, 120, 255, 0.08);

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.icon-badge i {
  display: block;
  line-height: 1;
}

.nav-item:hover .icon-badge,
.nav-item.highlight .icon-badge,
.planet-tree-row.expanded .icon-badge {
  color: var(--sidebar-icon-hover-color);
  background: var(--sidebar-icon-hover-bg);
  border-color: var(--sidebar-accent-border);
  transform: scale(1.04);
  box-shadow:
    0 0 14px rgba(145, 120, 255, 0.2),
    inset 0 0 12px rgba(165, 140, 255, 0.1);
}

/* =========================
   Text
========================= */

.name {
  flex: 1;
  min-width: 0;

  color: inherit;

  font-size: 0.9rem;
  font-weight: 750;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  transition:
    color 0.18s ease,
    font-weight 0.18s ease;
}

.nav-item:hover .name,
.nav-item.highlight .name,
.planet-tree-row.expanded .name {
  font-weight: 900;
}

.count {
  flex-shrink: 0;

  min-width: 28px;
  height: 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-left: 8px;
  padding: 0 8px;

  color: var(--sidebar-count-color);
  background: var(--sidebar-count-bg);

  border: 1px solid rgba(165, 150, 245, 0.22);
  border-radius: 6px;

  font-size: 0.72rem;
  font-weight: 900;

  box-shadow:
    inset 0 0 8px rgba(165, 140, 255, 0.05);

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.nav-item:hover .count,
.nav-item.highlight .count,
.planet-tree-row.expanded .count {
  color: var(--sidebar-count-hover-color);
  background: var(--sidebar-count-hover-bg);
  border-color: var(--sidebar-accent-border);
  box-shadow:
    0 0 12px rgba(145, 120, 255, 0.16),
    inset 0 0 8px rgba(165, 140, 255, 0.08);
}

/* =========================
   Scrollbar
========================= */

.sidebar-main::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.sidebar-main::-webkit-scrollbar-thumb,
.sidebar-main::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-main::-webkit-scrollbar:horizontal,
.sidebar-content::-webkit-scrollbar:horizontal {
  display: none;
}
</style>