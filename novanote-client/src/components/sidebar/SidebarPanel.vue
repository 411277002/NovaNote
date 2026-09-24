<template>
  <aside class="sidebar-panel is-collapsed">

    <div class="sidebar-content" v-if="false">
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
            ref="searchInput"
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

    <nav class="sidebar-rail" aria-label="NovaNote quick navigation">
      <button class="rail-brand" type="button" title="NovaNote" aria-label="Close sidebar panel" @click="activePanel = null">
        <svg class="rail-brand-mark" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="23" cy="24" r="10.5" />
          <ellipse cx="23" cy="24" rx="20" ry="6.5" transform="rotate(-28 23 24)" />
          <circle class="brand-star" cx="38" cy="9" r="1.8" />
          <circle class="brand-orbit-dot" cx="5" cy="32" r="1.5" />
        </svg>
      </button>

      <div class="sidebar-rail-main">
        <button class="rail-action" :class="{ active: activePanel === 'search' }" type="button" title="Search" aria-label="Search" :aria-pressed="activePanel === 'search'" @click="togglePanel('search')">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        </button>
        <button class="rail-action rail-create" type="button" title="Create note" aria-label="Create note" @click="emit('create-note')">
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
        <button class="rail-action" :class="{ active: activePanel === 'planets' }" type="button" title="Planets" aria-label="Planets" :aria-pressed="activePanel === 'planets'" @click="togglePanel('planets')">
          <i class="fa-solid fa-earth-asia" aria-hidden="true"></i>
        </button>
        <button class="rail-action" :class="{ active: activePanel === 'notes' }" type="button" title="Notes" aria-label="Notes" :aria-pressed="activePanel === 'notes'" @click="togglePanel('notes')">
          <i class="fa-regular fa-note-sticky" aria-hidden="true"></i>
        </button>

        <span class="rail-divider" aria-hidden="true"></span>

        <button class="rail-action" type="button" title="Trash" aria-label="Trash" @click="emit('open-trash')">
          <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
        </button>
        <button class="rail-action" type="button" title="Star overview" aria-label="Star overview" @click="emit('open-star-overview')">
          <i class="fa-solid fa-circle-nodes" aria-hidden="true"></i>
        </button>
      </div>

      <div class="sidebar-rail-spacer"></div>

      <div class="sidebar-rail-bottom">
        <button class="rail-action" type="button" title="Help" aria-label="Help" :aria-expanded="isHelpOpen" @click="isHelpOpen = !isHelpOpen">
          <i class="fa-regular fa-circle-question" aria-hidden="true"></i>
        </button>
        <button class="rail-action rail-avatar" type="button" title="Profile" aria-label="Profile" @click="emit('open-profile')">
          <i class="fa-solid fa-user-astronaut" aria-hidden="true"></i>
        </button>
      </div>

      <aside v-if="isHelpOpen" class="sidebar-help-popover" role="status">
        <strong>NovaNote</strong>
        <span>Capture ideas, connect knowledge, and explore your universe.</span>
      </aside>
    </nav>

    <Transition name="sidebar-detail">
      <section v-if="activePanel" class="sidebar-detail-panel" :aria-labelledby="`sidebar-panel-${activePanel}-title`">
        <header class="detail-panel-header">
          <div class="detail-panel-heading">
            <span class="detail-panel-kicker">NOVANOTE / {{ activePanel.toUpperCase() }}</span>
            <h2 :id="`sidebar-panel-${activePanel}-title`">{{ panelTitle }}</h2>
          </div>
          <button class="detail-close" type="button" aria-label="Close panel" title="Close" @click="activePanel = null">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>

        <div v-if="activePanel === 'search'" class="detail-panel-content">
          <div class="panel-search-box">
            <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              ref="panelSearchInput"
              :value="searchQuery"
              type="search"
              placeholder="搜尋筆記、星球或標籤…"
              aria-label="搜尋筆記、星球或標籤"
              @input="handleInput"
            />
            <button v-if="searchQuery" type="button" aria-label="Clear search" @click="clearSearch">×</button>
          </div>

          <template v-if="searchQuery.trim()">
            <p class="detail-section-label">搜尋結果</p>
            <div v-if="searchResults.planets.length || searchResults.notes.length" class="detail-result-list">
              <button v-for="planet in searchResults.planets" :key="`planet-${planet.id}`" class="detail-result-row" type="button" @click="selectPlanet(planet)">
                <span class="result-icon planet-result"><i class="fa-solid fa-earth-asia" aria-hidden="true"></i></span>
                <span class="result-copy"><strong>{{ planet.name }}</strong><small>星球</small></span>
                <i class="fa-solid fa-arrow-up-right-from-square result-arrow" aria-hidden="true"></i>
              </button>
              <button v-for="note in searchResults.notes" :key="`note-${note.id}`" class="detail-result-row" type="button" @click="selectNote(note)">
                <span class="result-icon"><i class="fa-regular fa-file-lines" aria-hidden="true"></i></span>
                <span class="result-copy"><strong>{{ note.title || '未命名筆記' }}</strong><small>筆記</small></span>
                <i class="fa-solid fa-arrow-up-right-from-square result-arrow" aria-hidden="true"></i>
              </button>
              <p v-if="!searchResults.planets.length && !searchResults.notes.length" class="detail-empty">找不到符合的筆記或星球。</p>
            </div>
            <p v-else class="detail-empty">找不到符合的筆記或星球。</p>
          </template>
          <template v-else>
            <p class="detail-section-label">最近搜尋</p>
            <p class="detail-empty search-empty">搜尋紀錄會顯示在這裡。輸入關鍵字即可搜尋筆記、星球與標籤。</p>
            <p class="detail-section-label tags-heading">熱門標籤</p>
            <div v-if="popularTags.length" class="detail-tag-list">
              <button v-for="tag in popularTags" :key="tag.name" class="detail-tag" type="button" @click="searchTag(tag.name)"># {{ tag.name }} <span>{{ tag.count }}</span></button>
            </div>
            <p v-else class="detail-empty">目前還沒有標籤。</p>
          </template>
        </div>

        <div v-else-if="activePanel === 'planets'" class="detail-panel-content">
          <div class="detail-list-heading">
            <p class="detail-section-label">{{ planetsStore.planets.length }} 個星球</p>
            <button class="panel-add-btn" type="button" title="新增星球" aria-label="新增星球" @click="emit('create-planet')"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
          </div>
          <div v-if="planetsStore.planets.length" class="detail-result-list">
            <button v-for="planet in planetsStore.planets" :key="planet.id" class="detail-result-row planet-row" type="button" @click="selectPlanet(planet)">
              <span class="planet-thumbnail" :style="{ '--planet-color': planet.color || '#5e81ac' }"><i class="fa-solid fa-earth-asia" aria-hidden="true"></i></span>
              <span class="result-copy"><strong>{{ planet.name }}</strong><small>{{ planet.texture_type || '星球' }}</small></span>
              <span class="result-count">{{ getNoteCount(planet.id) }}</span>
            </button>
          </div>
          <p v-else class="detail-empty">尚未建立星球。使用右上方 + 開始建立。</p>
        </div>

        <div v-else class="detail-panel-content note-panel-content">
          <div class="detail-list-heading note-heading">
            <p class="detail-section-label">{{ notePanelCount }} 篇筆記</p>
            <button class="panel-add-btn" type="button" title="新增筆記" aria-label="新增筆記" @click="emit('create-note')"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
          </div>
          <div class="note-filter-list" role="group" aria-label="筆記分類">
            <button v-for="filter in noteFilters" :key="filter.id" type="button" :class="{ selected: noteFilter === filter.id }" @click="noteFilter = filter.id">
              <i :class="filter.icon" aria-hidden="true"></i><span>{{ filter.label }}</span><small>{{ filter.count }}</small>
            </button>
          </div>

          <p v-if="tagOptions.length" class="detail-section-label note-tags-label">標籤</p>
          <div v-if="tagOptions.length" class="detail-tag-list note-tags-list">
            <button v-for="tag in tagOptions" :key="tag.name" class="detail-tag" :class="{ 'tag-selected': selectedTag === tag.name }" type="button" @click="toggleTagFilter(tag.name)"># {{ tag.name }}</button>
          </div>

          <div class="detail-result-list note-list">
            <button v-for="note in notePanelNotes" :key="note.id" class="detail-result-row" type="button" @click="selectNote(note)">
              <span class="result-icon"><i class="fa-regular fa-file-lines" aria-hidden="true"></i></span>
              <span class="result-copy"><strong>{{ note.title || '未命名筆記' }}</strong><small>{{ note.tags?.[0] ? `# ${note.tags[0]}` : '未分類' }}</small></span>
              <i class="fa-solid fa-arrow-up-right-from-square result-arrow" aria-hidden="true"></i>
            </button>
            <p v-if="!notePanelNotes.length" class="detail-empty">這個分類目前沒有筆記。</p>
          </div>
        </div>
      </section>
    </Transition>
  </aside>
</template>

<script setup>
import { computed, nextTick, ref, onMounted, onBeforeUnmount, watch } from 'vue'

import { useNotesStore } from '../../stores/notes'
import { usePlanetsStore } from '../../stores/planets'


const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'update:searchQuery',
  'select-planet',
  'select-note',
  'create-note',
  'create-planet',
  'open-profile',
  'open-trash',
  'open-star-overview',
  'toggle-theme'
])

const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()

const currentTheme = ref(
  document.documentElement.getAttribute('data-theme') || 'dark'
)

const expandedPlanetIds = ref(new Set())
const isHelpOpen = ref(false)
const panelSearchInput = ref(null)
const activePanel = ref(null)
const noteFilter = ref('all')
const selectedTag = ref('')

let themeObserver = null

const panelTitle = computed(() => ({
  search: '搜尋',
  planets: '我的星球',
  notes: '我的筆記'
}[activePanel.value] || ''))

const allNotes = computed(() => notesStore.allNotes || [])

const tagOptions = computed(() => {
  const counts = new Map()
  allNotes.value.forEach(note => {
    const tags = Array.isArray(note.tags) ? note.tags : []
    tags.forEach(value => {
      const name = String(value || '').trim().replace(/^#/, '')
      if (name) counts.set(name, (counts.get(name) || 0) + 1)
    })
  })

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
})

const popularTags = computed(() => tagOptions.value.slice(0, 6))

const recentNotes = computed(() => [...allNotes.value].sort((a, b) => {
  const timeA = new Date(a.updated_at || a.created_at || 0).getTime()
  const timeB = new Date(b.updated_at || b.created_at || 0).getTime()
  return timeB - timeA
}))

const notePanelNotes = computed(() => {
  let notes = allNotes.value
  if (noteFilter.value === 'recent') notes = recentNotes.value.slice(0, 12)
  if (noteFilter.value === 'uncategorized') {
    notes = notes.filter(note => !Array.isArray(note.tags) || note.tags.length === 0)
  }
  if (selectedTag.value) {
    notes = notes.filter(note => Array.isArray(note.tags) && note.tags.some(tag => String(tag).replace(/^#/, '') === selectedTag.value))
  }
  return notes
})

const noteFilters = computed(() => [
  { id: 'all', label: '所有筆記', icon: 'fa-regular fa-file-lines', count: allNotes.value.length },
  { id: 'recent', label: '最近編輯', icon: 'fa-regular fa-clock', count: Math.min(allNotes.value.length, 12) },
  { id: 'uncategorized', label: '未分類', icon: 'fa-regular fa-folder', count: allNotes.value.filter(note => !Array.isArray(note.tags) || note.tags.length === 0).length }
])

const notePanelCount = computed(() => notePanelNotes.value.length)

const searchResults = computed(() => {
  const query = String(props.searchQuery || '').trim().toLowerCase()
  if (!query) return { planets: [], notes: [] }
  return {
    planets: planetsStore.planets.filter(planet => String(planet.name || '').toLowerCase().includes(query)).slice(0, 6),
    notes: allNotes.value.filter(note => {
      const searchable = [note.title, note.content, ...(Array.isArray(note.tags) ? note.tags : [])].join(' ').toLowerCase()
      return searchable.includes(query)
    }).slice(0, 10)
  }
})

const togglePanel = async (panel) => {
  activePanel.value = activePanel.value === panel ? null : panel
  isHelpOpen.value = false
  if (activePanel.value === 'search') {
    await nextTick()
    panelSearchInput.value?.focus()
  }
}

const selectPlanet = (planet) => {
  emit('select-planet', planet)
  activePanel.value = null
}

const selectNote = (note) => {
  emit('select-note', note)
  activePanel.value = null
}

const searchTag = (tag) => {
  emit('update:searchQuery', tag)
  activePanel.value = 'search'
}

const toggleTagFilter = (tag) => {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  emit('update:searchQuery', selectedTag.value)
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
  position: fixed;
  inset: 0 auto 0 0;

  width: 264px;
  height: 100vh;

  color: var(--sidebar-text);
  background:
    radial-gradient(circle at 30% 0%, var(--sidebar-accent-soft), transparent 30%),
    radial-gradient(circle at 80% 18%, rgba(81, 186, 252, 0.08), transparent 30%),
    linear-gradient(180deg, var(--sidebar-bg), #080b18);

  border-right: 1px solid var(--sidebar-border);

  z-index: 100;
  overflow: visible;
  box-sizing: border-box;

  box-shadow:
    inset -1px 0 0 rgba(255, 255, 255, 0.035),
    14px 0 44px rgba(0, 0, 0, 0.28),
    0 0 34px rgba(var(--accent-rgb), 0.08);

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
    linear-gradient(rgba(var(--accent-rgb), 0.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--accent-rgb), 0.024) 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 255, 255, 0.11) 1px, transparent 1.5px);

  background-size:
    32px 32px,
    32px 32px,
    86px 86px;

  opacity: 0.48;
  pointer-events: none;
}

.sidebar-panel::after {
  content: '';

  position: absolute;
  top: 22px;
  right: 16px;

  width: 34px;
  height: 34px;

  border-top: 2px solid var(--sidebar-accent-border);
  border-right: 2px solid var(--sidebar-accent-border);

  filter:
    drop-shadow(0 0 8px rgba(var(--accent-rgb), 0.42))
    drop-shadow(0 0 16px rgba(81, 186, 252, 0.14));

  pointer-events: none;
}

.sidebar-panel,
.sidebar-panel * {
  box-sizing: border-box;
}

.sidebar-panel.is-collapsed {
  inset: 16px auto 16px 16px;
  width: 60px;
  height: auto;
  overflow: visible;
  color: #d8e4f5;
  border: 1px solid rgba(154, 184, 224, 0.2);
  border-radius: 25px;
  background:
    radial-gradient(circle at 50% 0%, rgba(100, 151, 220, 0.13), transparent 32%),
    linear-gradient(180deg, rgba(11, 22, 47, 0.92), rgba(5, 12, 28, 0.88));
  box-shadow:
    inset 0 1px 0 rgba(229, 239, 255, 0.09),
    0 18px 48px rgba(0, 0, 0, 0.32),
    0 0 28px rgba(75, 134, 205, 0.08);
}

.sidebar-panel.is-collapsed::after {
  display: none;
}

.sidebar-panel.is-collapsed .toggle-btn {
  display: none;
}

.sidebar-rail {
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.rail-brand {
  display: grid;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  place-items: center;
  padding: 5px;
  border: 1px solid transparent;
  border-radius: 15px;
  background: transparent;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
}

.rail-brand:hover {
  transform: translateY(-1px);
  border-color: rgba(160, 194, 238, 0.2);
  background: rgba(121, 160, 211, 0.1);
}

.rail-brand img {
  display: block;
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.rail-brand-mark {
  width: 36px;
  height: 36px;
  overflow: visible;
  fill: none;
  stroke: #e7ca80;
  stroke-width: 1.35;
  stroke-linecap: round;
  filter: drop-shadow(0 0 5px rgba(231, 202, 128, 0.2));
}

.rail-brand-mark .brand-star {
  fill: #f1dda6;
  stroke: none;
}

.rail-brand-mark .brand-orbit-dot {
  fill: #d4b06a;
  stroke: none;
}

.sidebar-rail-main,
.sidebar-rail-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 9px;
}

.sidebar-rail-main {
  margin-top: 20px;
}

.rail-action {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  color: rgba(205, 221, 244, 0.76);
  border: 1px solid rgba(154, 184, 224, 0.1);
  border-radius: 14px;
  background: rgba(17, 34, 64, 0.46);
  cursor: pointer;
  font-size: 15px;
  transition: color 170ms ease, background 170ms ease, border-color 170ms ease, transform 170ms ease, box-shadow 170ms ease;
}

.rail-action:hover,
.rail-action:focus-visible {
  color: #eff6ff;
  border-color: rgba(151, 193, 244, 0.32);
  background: rgba(60, 94, 143, 0.34);
  box-shadow: 0 5px 16px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}

.rail-action.active {
  color: #eff8ff;
  border-color: rgba(136, 192, 208, 0.4);
  background: linear-gradient(145deg, rgba(93, 126, 168, 0.48), rgba(49, 77, 119, 0.56));
  box-shadow:
    inset 0 1px 0 rgba(225, 242, 255, 0.14),
    0 0 0 1px rgba(136, 192, 208, 0.08),
    0 0 16px rgba(96, 148, 207, 0.14);
}

.rail-action:focus-visible,
.rail-brand:focus-visible {
  outline: 2px solid rgba(136, 192, 208, 0.65);
  outline-offset: 2px;
}

.rail-create {
  width: 46px;
  height: 46px;
  margin: 2px 0 3px;
  color: #101b31;
  border-color: rgba(255, 242, 198, 0.72);
  border-radius: 16px;
  background:
    radial-gradient(circle at 30% 12%, rgba(255, 255, 255, 0.62), transparent 40%),
    linear-gradient(145deg, #f0d99b, #c8a760);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    0 5px 17px rgba(199, 163, 91, 0.2),
    0 0 19px rgba(212, 176, 106, 0.12);
  font-size: 17px;
}

.rail-create:hover,
.rail-create:focus-visible {
  color: #0b1427;
  border-color: rgba(255, 248, 222, 0.95);
  background: linear-gradient(145deg, #f7e6b4, #d6b873);
  box-shadow: 0 7px 21px rgba(199, 163, 91, 0.27), 0 0 22px rgba(212, 176, 106, 0.17);
}

.rail-divider {
  width: 25px;
  height: 1px;
  margin: 5px 0 3px;
  background: linear-gradient(90deg, transparent, rgba(166, 194, 231, 0.4), transparent);
}

.sidebar-rail-spacer {
  flex: 1 1 auto;
  min-height: 24px;
}

.sidebar-rail-bottom {
  gap: 8px;
  padding-top: 12px;
}

.rail-avatar {
  color: #f1dfad;
  border-color: rgba(212, 176, 106, 0.24);
  border-radius: 50%;
  background: rgba(32, 43, 65, 0.88);
}

.rail-avatar:hover {
  color: #fff0c5;
  border-color: rgba(240, 215, 154, 0.52);
  background: rgba(58, 67, 88, 0.92);
}

.sidebar-help-popover {
  position: absolute;
  left: calc(100% + 12px);
  bottom: 12px;
  z-index: 3;
  display: flex;
  width: 220px;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  color: #d8e4f5;
  border: 1px solid rgba(154, 184, 224, 0.2);
  border-radius: 16px;
  background: rgba(9, 19, 40, 0.94);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
  font-size: 12px;
  line-height: 1.5;
}

.sidebar-help-popover strong {
  color: #f0d79a;
  font-size: 13px;
}

.sidebar-help-popover span {
  color: rgba(205, 221, 244, 0.72);
}

.sidebar-detail-panel {
  position: absolute;
  inset: 0 auto 0 calc(100% + 10px);
  z-index: 1;
  display: flex;
  width: min(250px, calc(100vw - 112px));
  min-width: 260px;
  flex-direction: column;
  overflow: hidden;
  color: #d8e4f5;
  border: 1px solid rgba(154, 184, 224, 0.18);
  border-radius: 22px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(69, 105, 157, 0.12), transparent 38%),
    linear-gradient(165deg, rgba(10, 20, 42, 0.96), rgba(6, 13, 30, 0.94));
  box-shadow:
    inset 0 1px 0 rgba(229, 239, 255, 0.07),
    0 18px 52px rgba(0, 0, 0, 0.34),
    0 0 28px rgba(83, 135, 199, 0.07);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.sidebar-detail-enter-active,
.sidebar-detail-leave-active {
  transition: opacity 210ms ease, transform 210ms ease;
}

.sidebar-detail-enter-from,
.sidebar-detail-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

.detail-panel-header {
  display: flex;
  min-height: 82px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 17px 18px 15px 21px;
  border-bottom: 1px solid rgba(154, 184, 224, 0.1);
}

.detail-panel-heading {
  min-width: 0;
}

.detail-panel-kicker {
  display: block;
  margin-bottom: 6px;
  color: rgba(160, 185, 220, 0.54);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.detail-panel-heading h2 {
  margin: 0;
  color: #e7edf8;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.015em;
}

.detail-close,
.panel-add-btn {
  display: grid;
  width: 31px;
  height: 31px;
  flex: 0 0 auto;
  place-items: center;
  padding: 0;
  color: rgba(202, 219, 243, 0.76);
  border: 1px solid rgba(154, 184, 224, 0.14);
  border-radius: 10px;
  background: rgba(26, 43, 71, 0.62);
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
}

.detail-close:hover,
.panel-add-btn:hover {
  color: #f3f7ff;
  border-color: rgba(136, 192, 208, 0.34);
  background: rgba(56, 84, 124, 0.62);
}

.detail-panel-content {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 19px 16px 20px;
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 172, 210, 0.25) transparent;
}

.panel-search-box {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  color: #8fa8cb;
  border: 1px solid rgba(151, 181, 224, 0.17);
  border-radius: 12px;
  background: rgba(5, 13, 29, 0.64);
  transition: border-color 160ms ease, background 160ms ease;
}

.panel-search-box:focus-within {
  border-color: rgba(136, 192, 208, 0.42);
  background: rgba(8, 19, 39, 0.8);
}

.panel-search-box > i {
  flex: 0 0 auto;
  font-size: 13px;
}

.panel-search-box input {
  width: 100%;
  min-width: 0;
  padding: 11px 0;
  color: #e4ebf7;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 12px;
}

.panel-search-box input::placeholder {
  color: rgba(167, 184, 210, 0.56);
}

.panel-search-box button {
  padding: 2px;
  color: #98abc7;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 19px;
}

.detail-section-label {
  margin: 21px 2px 10px;
  color: rgba(172, 193, 222, 0.58);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.search-empty {
  padding: 12px 11px;
  border: 1px solid rgba(151, 181, 224, 0.08);
  border-radius: 12px;
  background: rgba(20, 36, 62, 0.24);
}

.tags-heading {
  margin-top: 23px;
}

.detail-empty {
  margin: 10px 2px;
  color: rgba(182, 198, 221, 0.58);
  font-size: 11px;
  line-height: 1.65;
}

.detail-result-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-result-row {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  gap: 11px;
  padding: 6px 9px;
  color: #d6e0ef;
  text-align: left;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.detail-result-row:hover {
  border-color: rgba(136, 192, 208, 0.15);
  background: rgba(68, 101, 147, 0.16);
  transform: translateX(2px);
}

.result-icon {
  display: grid;
  width: 31px;
  height: 31px;
  flex: 0 0 auto;
  place-items: center;
  color: #a9c0e0;
  border: 1px solid rgba(148, 177, 216, 0.12);
  border-radius: 10px;
  background: rgba(43, 62, 93, 0.44);
  font-size: 12px;
}

.planet-result {
  color: #c8b478;
}

.result-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.result-copy strong {
  overflow: hidden;
  color: #dce6f5;
  font-size: 11px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-copy small {
  color: rgba(166, 185, 212, 0.52);
  font-size: 9px;
}

.result-arrow {
  color: rgba(154, 179, 212, 0.36);
  font-size: 10px;
}

.detail-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.detail-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 9px;
  color: #bccce3;
  border: 1px solid rgba(144, 174, 215, 0.13);
  border-radius: 10px;
  background: rgba(24, 42, 71, 0.42);
  cursor: pointer;
  font-size: 10px;
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
}

.detail-tag:hover,
.detail-tag.tag-selected {
  color: #e4f5ff;
  border-color: rgba(136, 192, 208, 0.32);
  background: rgba(73, 110, 156, 0.26);
}

.detail-tag span {
  color: rgba(176, 197, 224, 0.5);
  font-size: 9px;
}

.detail-list-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.detail-list-heading .detail-section-label {
  margin: 0;
}

.planet-thumbnail {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  color: rgba(238, 242, 250, 0.94);
  border: 1px solid rgba(207, 222, 245, 0.22);
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 24%, rgba(244, 247, 255, 0.72), transparent 18%),
    radial-gradient(circle at 38% 34%, color-mix(in srgb, var(--planet-color) 88%, white), var(--planet-color) 54%, #101c35 100%);
  box-shadow: inset -5px -3px 8px rgba(2, 8, 18, 0.42), 0 0 10px color-mix(in srgb, var(--planet-color) 18%, transparent);
  font-size: 11px;
}

.result-count {
  min-width: 24px;
  color: rgba(190, 207, 231, 0.7);
  text-align: right;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

.note-filter-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.note-filter-list button {
  display: flex;
  min-height: 37px;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
  color: rgba(205, 219, 240, 0.72);
  border: 1px solid transparent;
  border-radius: 11px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-size: 11px;
}

.note-filter-list button:hover,
.note-filter-list button.selected {
  color: #e2f3ff;
  border-color: rgba(136, 192, 208, 0.17);
  background: rgba(65, 99, 144, 0.2);
}

.note-filter-list button > i {
  width: 16px;
  color: #9bb8dd;
  text-align: center;
}

.note-filter-list button > span {
  flex: 1;
}

.note-filter-list button > small {
  color: rgba(175, 195, 222, 0.58);
  font-size: 10px;
}

.note-tags-label {
  margin-top: 20px;
}

.note-tags-list {
  max-height: 88px;
  overflow-y: auto;
}

.note-list {
  margin-top: 17px;
  padding-top: 13px;
  border-top: 1px solid rgba(154, 184, 224, 0.1);
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
    radial-gradient(circle at 0% 50%, var(--sidebar-accent-soft), transparent 58%),
    linear-gradient(145deg, var(--sidebar-surface), #080b18);

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
    0 0 18px rgba(var(--accent-rgb), 0.1),
    8px 0 24px rgba(0, 0, 0, 0.25);

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.toggle-btn:hover {
  color: var(--sidebar-heading);
  background:
    radial-gradient(circle at 0% 50%, var(--sidebar-accent-soft), transparent 60%),
    linear-gradient(145deg, var(--sidebar-surface-hover), var(--sidebar-surface));

  border-color: var(--sidebar-border-strong);
  box-shadow:
    0 0 22px rgba(var(--accent-rgb), 0.22),
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

  padding: 18px 14px;

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

  border-bottom: 1px solid var(--sidebar-border);
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
      var(--sidebar-accent-border),
      rgba(255, 255, 255, 0.22),
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
    drop-shadow(0 0 10px rgba(var(--accent-rgb), 0.2))
    drop-shadow(0 0 18px rgba(81, 186, 252, 0.1));
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
    0 0 22px rgba(var(--accent-rgb), 0.16);
}

.sidebar-nav-subtitle {
  margin-top: 5px;

  color: var(--sidebar-accent);

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

  border: 1px solid var(--sidebar-border);
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
    inset 0 0 18px rgba(var(--accent-rgb), 0.035),
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
  border-color: var(--sidebar-accent-border);

  box-shadow:
    0 0 0 3px var(--sidebar-accent-soft),
    0 0 22px rgba(var(--accent-rgb), 0.16),
    inset 0 0 18px rgba(var(--accent-rgb), 0.05);
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
  color: var(--sidebar-heading);
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

  box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.52);
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
  border-color: var(--sidebar-border-strong);
  box-shadow:
    0 0 18px rgba(var(--accent-rgb), 0.12),
    inset 0 0 18px rgba(var(--accent-rgb), 0.035);
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
    0 0 10px rgba(var(--accent-rgb), 0.7),
    0 0 20px rgba(81, 186, 252, 0.2);
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
  border-color: var(--sidebar-border-strong);
  box-shadow:
    0 0 16px rgba(var(--accent-rgb), 0.1),
    inset 0 0 16px rgba(var(--accent-rgb), 0.035);
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

  border-left: 1px solid var(--sidebar-border);
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
  color: var(--sidebar-heading);
  background:
    radial-gradient(circle at 12% 50%, var(--sidebar-accent-soft), transparent 36%),
    rgba(var(--accent-rgb), 0.08);
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

  background: var(--sidebar-border-strong);

  transform: translateY(-50%);
}

.planet-note-icon {
  width: 24px;
  height: 24px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--sidebar-accent);
  background: var(--sidebar-icon-bg);

  border: 1px solid var(--sidebar-border);
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

  border: 1px solid var(--sidebar-border);
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
    inset 0 0 10px rgba(var(--accent-rgb), 0.06),
    0 0 10px rgba(var(--accent-rgb), 0.08);

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
    0 0 14px rgba(var(--accent-rgb), 0.2),
    inset 0 0 12px rgba(var(--accent-rgb), 0.1);
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

  border: 1px solid var(--sidebar-border);
  border-radius: 6px;

  font-size: 0.72rem;
  font-weight: 900;

  box-shadow:
    inset 0 0 8px rgba(var(--accent-rgb), 0.05);

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
    0 0 12px rgba(var(--accent-rgb), 0.16),
    inset 0 0 8px rgba(var(--accent-rgb), 0.08);
}

/* =========================
   Light Theme
========================= */

:global(html[data-theme='light']) .sidebar-panel {
  background:
    radial-gradient(circle at 30% 0%, var(--sidebar-accent-soft), transparent 30%),
    radial-gradient(circle at 80% 18%, rgba(81, 186, 252, 0.08), transparent 30%),
    linear-gradient(180deg, var(--sidebar-bg), #e5e9f0);

  box-shadow:
    inset -1px 0 0 rgba(76, 86, 106, 0.08),
    8px 0 22px rgba(46, 52, 64, 0.06);
}

:global(html[data-theme='light']) .sidebar-panel.is-collapsed {
  color: #d8e4f5;
  border-color: rgba(154, 184, 224, 0.2);
  background:
    radial-gradient(circle at 50% 0%, rgba(100, 151, 220, 0.13), transparent 32%),
    linear-gradient(180deg, rgba(11, 22, 47, 0.92), rgba(5, 12, 28, 0.88));
  box-shadow:
    inset 0 1px 0 rgba(229, 239, 255, 0.09),
    0 18px 48px rgba(0, 0, 0, 0.32),
    0 0 28px rgba(75, 134, 205, 0.08);
}

:global(html[data-theme='light']) .sidebar-panel.is-collapsed .rail-action {
  color: rgba(205, 221, 244, 0.76);
  border-color: rgba(154, 184, 224, 0.1);
  background: rgba(17, 34, 64, 0.46);
}

:global(html[data-theme='light']) .sidebar-panel.is-collapsed .rail-action:hover {
  color: #eff6ff;
  border-color: rgba(151, 193, 244, 0.32);
  background: rgba(60, 94, 143, 0.34);
}

:global(html[data-theme='light']) .sidebar-panel.is-collapsed .rail-create {
  color: #101b31;
  border-color: rgba(255, 242, 198, 0.72);
  background: linear-gradient(145deg, #f0d99b, #c8a760);
}

@media (max-width: 760px) {
  .sidebar-panel.is-collapsed {
    inset: 10px auto 10px 10px;
    width: 68px;
    border-radius: 22px;
  }

  .sidebar-detail-panel {
    width: calc(100vw - 108px);
    min-width: 0;
  }
}

:global(html[data-theme='light']) .sidebar-panel::before {
  opacity: 0.24;
}

:global(html[data-theme='light']) .toggle-btn {
  background:
    radial-gradient(circle at 0% 50%, var(--sidebar-accent-soft), transparent 58%),
    linear-gradient(145deg, #eceff4, #e5e9f0);

  box-shadow:
    4px 0 12px rgba(46, 52, 64, 0.08),
    0 0 12px rgba(94, 129, 172, 0.06);
}

:global(html[data-theme='light']) .search-input {
  box-shadow:
    inset 0 0 0 1px rgba(236, 239, 244, 0.72),
    var(--sidebar-shadow-sm);
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
