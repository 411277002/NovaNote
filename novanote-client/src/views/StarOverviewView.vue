<template>
  <div class="star-overview-page">
    <main class="star-main">
      <header class="star-header">
        <div>
          <p>Star Atlas</p>
          <h1>星圖總覽</h1>
        </div>

        <button class="back-btn" type="button" @click="goUniverse">
          <i class="fa-solid fa-arrow-left"></i>
          返回宇宙
        </button>
      </header>

      <section class="star-panel">
        <div class="panel-title">
          <div>
            <p>Knowledge Universe</p>
            <h2>知識宇宙統計</h2>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <span><i class="fa-solid fa-globe"></i></span>
            <p>星球數</p>
            <strong>{{ stats.planetCount }}</strong>
          </div>

          <div class="stat-card">
            <span><i class="fa-solid fa-puzzle-piece"></i></span>
            <p>卡片數</p>
            <strong>{{ stats.noteCount }}</strong>
          </div>

          <div class="stat-card">
            <span><i class="fa-solid fa-meteor"></i></span>
            <p>漂浮卡片</p>
            <strong>{{ stats.floatingCount }}</strong>
          </div>

          <div class="stat-card">
            <span><i class="fa-solid fa-layer-group"></i></span>
            <p>星球內卡片</p>
            <strong>{{ stats.inPlanetCount }}</strong>
          </div>
        </div>
      </section>

      <section class="star-panel timeline-panel">
        <div class="timeline-topbar">
          <div class="timeline-title-block">
            <p>Knowledge Timeline</p>
            <h2>星圖時間軸</h2>
          </div>

          <label class="timeline-select-field">
            <span>選擇月份</span>

            <div class="timeline-select-shell">
              <select v-model="selectedTimelineMonth">
                <option
                  v-for="month in timelineMonths"
                  :key="month.value"
                  :value="month.value"
                >
                  {{ month.slashLabel || month.label }}
                </option>
              </select>

              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </label>
        </div>

        <div class="timeline-summary-bar">
          <p>
            截至
            <strong>{{ selectedTimelineMonthSlashLabel || selectedTimelineMonthLabel }}</strong>
            ：
            <strong>{{ timelineSummary.planetCount }}</strong>
            顆星球・
            <strong>{{ timelineSummary.noteCount }}</strong>
            張卡片
          </p>
          <p>
            本月新增
            <strong class="accent-number">{{ timelineSummary.currentPlanetCount }}</strong>
            顆星球・
            <strong class="accent-number">{{ timelineSummary.currentNoteCount }}</strong>
            張卡片
          </p>
        </div>

        <div class="timeline-tip">
          <i class="fa-solid fa-share-nodes"></i>
          <span>顯示截至所選月份的知識宇宙狀態，星圖中只呈現星球與漂浮卡片，星球內卡片將以 +N 呈現。</span>
        </div>

        <div class="timeline-map-frame">
          <div class="timeline-map-frame-corner top-left"></div>
          <div class="timeline-map-frame-corner top-right"></div>
          <div class="timeline-map-frame-corner bottom-left"></div>
          <div class="timeline-map-frame-corner bottom-right"></div>

          <div class="timeline-map">
            <div class="timeline-orbit orbit-1"></div>
            <div class="timeline-orbit orbit-2"></div>
            <div class="timeline-orbit orbit-3"></div>
            <div class="timeline-orbit orbit-4"></div>

            <svg class="timeline-lines">
              <line
                v-for="line in timelineLinks"
                :key="line.id"
                :x1="`${line.from.x}%`"
                :y1="`${line.from.y}%`"
                :x2="`${line.to.x}%`"
                :y2="`${line.to.y}%`"
                :class="['timeline-line', line.status]"
              />
            </svg>

            <button
              v-for="node in timelineNodes"
              :key="node.uid"
              type="button"
              :class="['timeline-node', node.type, node.status, { 'has-child-cards': node.type === 'planet' && node.childCount > 0 }]"
              :style="{ left: `${node.x}%`, top: `${node.y}%` }"
              :title="node.title"
              @click="openTimelineNode(node)"
            >
              <span class="node-pulse"></span>
              <span class="node-core"></span>

              <span
                v-if="node.type === 'planet' && node.childCount > 0"
                class="node-child-badge"
                :class="{ current: node.currentChildCount > 0 }"
              >
                +{{ node.childCount }}
              </span>
            </button>

            <div v-if="timelineNodes.length === 0" class="timeline-empty">
              <i class="fa-solid fa-meteor"></i>
              <p>尚未建立任何星球或卡片，開始建立第一個節點後，星圖將自動呈現你的宇宙成長。</p>
            </div>
          </div>
        </div>

        <div class="timeline-new-section">
          <div class="timeline-new-header">
            <h3>本月新增</h3>
            <strong>{{ currentMonthTotalCount }}</strong>
          </div>

          <div v-if="currentMonthGroups.length > 0" class="timeline-group-list">
            <section
              v-for="group in currentMonthGroups"
              :key="group.key"
              class="timeline-new-group"
            >
              <div class="timeline-new-group-head">
                <div>
                  <span class="timeline-new-group-icon" :class="group.key">
                    <i :class="group.icon"></i>
                  </span>
                  <h4>{{ group.title }}</h4>
                </div>
                <strong>{{ group.items.length }}</strong>
              </div>

              <div class="timeline-new-scroll" :class="{ scrollable: group.items.length > 3 }">
                <button
                  v-for="item in group.items"
                  :key="item.uid"
                  type="button"
                  class="timeline-new-item"
                  :class="item.type"
                  @click="openTimelineNode(item)"
                >
                  <span class="timeline-new-item-icon" :class="[item.type, { 'in-planet': item.type === 'internal-note', floating: item.type === 'floating-note' }]">
                    <i :class="item.type === 'planet' ? 'fa-solid fa-globe' : item.type === 'internal-note' ? 'fa-solid fa-layer-group' : 'fa-solid fa-note-sticky'"></i>
                  </span>

                  <div class="timeline-new-item-text">
                    <strong>{{ item.title }}</strong>
                    <span v-if="item.type === 'planet'">當月新增星球</span>
                    <span v-else-if="item.type === 'internal-note'">{{ item.parentPlanetName ? `位於 ${item.parentPlanetName}` : '位於未知星球' }}</span>
                    <span v-else>漂浮卡片</span>
                  </div>

                  <i class="fa-solid fa-arrow-up-right-from-square open-icon"></i>
                </button>
              </div>
            </section>
          </div>

          <p v-else class="timeline-no-new">本月沒有新增內容，但仍顯示截至本月為止的知識宇宙狀態。</p>
        </div>
      </section>
    </main>

    <transition name="toast">
      <div v-if="toast.message" class="toast" :class="toast.type">
        <i class="fa-solid" :class="toast.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'"></i>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import { usePlanetsStore } from '../stores/planets'

const router = useRouter()
const authStore = useAuthStore()
const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()

const profile = reactive({
  username: ''
})

const toast = reactive({
  message: '',
  type: 'success'
})

const selectedTimelineMonth = ref('')

const user = computed(() => {
  return authStore.user || JSON.parse(localStorage.getItem('user') || 'null')
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

const getMonthValue = (dateValue) => {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const currentMonthValue = computed(() => getMonthValue(new Date()))

const getMonthStartDate = (monthValue) => {
  if (!monthValue) return null
  const [year, month] = monthValue.split('-').map(Number)
  return new Date(year, month - 1, 1, 0, 0, 0, 0)
}

const getMonthEndDate = (monthValue) => {
  if (!monthValue) return null
  const [year, month] = monthValue.split('-').map(Number)
  return new Date(year, month, 0, 23, 59, 59, 999)
}

const formatMonthLabel = (monthValue) => {
  if (!monthValue) return ''
  const [year, month] = monthValue.split('-')
  return `${year} 年 ${Number(month)} 月`
}

const formatMonthSlashLabel = (monthValue) => {
  if (!monthValue) return ''
  const [year, month] = monthValue.split('-')
  return `${year}/${month}`
}

const getPlanetTitle = (planet) => {
  return planet.name || planet.title || planet.planet_name || '未命名星球'
}

const getNoteTitle = (note) => {
  return note.title || note.name || '未命名文件'
}

const planetNameMap = computed(() => {
  const map = new Map()
  ;(planetsStore.planets || []).forEach((planet) => {
    map.set(String(planet.id), getPlanetTitle(planet))
  })
  return map
})

const getParentPlanetName = (planetId) => {
  if (!planetId) return ''
  return planetNameMap.value.get(String(planetId)) || ''
}

const getNodePosition = (type, index, total) => {
  if (type === 'planet') {
    const radiusX = 30
    const radiusY = 18
    const angle = total <= 1 ? -Math.PI / 2 : (-Math.PI / 2) + (Math.PI * 2 * index) / total
    return { x: 50 + Math.cos(angle) * radiusX, y: 42 + Math.sin(angle) * radiusY }
  }
  const columns = 5
  const column = index % columns
  const row = Math.floor(index / columns)
  return { x: 22 + column * 14, y: 62 + row * 9 }
}

const getTimelineStatus = (createdAt, monthStart, monthEnd) => {
  const createdDate = new Date(createdAt)
  return createdDate >= monthStart && createdDate <= monthEnd ? 'current' : 'past'
}

const isCreatedBeforeMonthEnd = (item, monthEnd) => {
  if (!item.createdAt || !monthEnd) return false
  const createdDate = new Date(item.createdAt)
  if (Number.isNaN(createdDate.getTime())) return false
  return createdDate <= monthEnd
}

const allTimelineItems = computed(() => {
  const planets = planetsStore.planets || []
  const notes = notesStore.allNotes || []

  const planetItems = planets
    .map((planet, index) => {
      const position = getNodePosition('planet', index, Math.max(planets.length, 1))
      return {
        ...planet,
        uid: `planet-${planet.id}`,
        rawId: planet.id,
        type: 'planet',
        title: getPlanetTitle(planet),
        createdAt: getCreatedAt(planet),
        x: position.x,
        y: position.y,
        planetId: null,
        parentPlanetName: ''
      }
    })
    .filter(item => item.createdAt)

  const floatingNotes = notes.filter(note => !getNotePlanetId(note))

  const noteItems = notes
    .map((note) => {
      const planetId = getNotePlanetId(note)
      const isFloating = !planetId
      const floatingIndex = floatingNotes.findIndex(floatingNote => floatingNote.id === note.id)
      const position = isFloating ? getNodePosition('floating-note', floatingIndex, Math.max(floatingNotes.length, 1)) : { x: null, y: null }
      const type = isFloating ? 'floating-note' : 'internal-note'
      return {
        ...note,
        uid: `note-${note.id}`,
        rawId: note.id,
        type,
        title: getNoteTitle(note),
        planetId,
        parentPlanetName: getParentPlanetName(planetId),
        createdAt: getCreatedAt(note),
        x: position.x,
        y: position.y
      }
    })
    .filter(item => item.createdAt)

  return [...planetItems, ...noteItems]
})

const timelineMonths = computed(() => {
  const monthSet = new Set()
  allTimelineItems.value.forEach((item) => {
    const month = getMonthValue(item.createdAt)
    if (month) {
      monthSet.add(month)
    }
  })
  if (currentMonthValue.value) {
    monthSet.add(currentMonthValue.value)
  }
  const months = [...monthSet].sort()
  return months.map(month => ({ value: month, label: formatMonthLabel(month), slashLabel: formatMonthSlashLabel(month) }))
})

const selectedTimelineMonthLabel = computed(() => formatMonthLabel(selectedTimelineMonth.value))
const selectedTimelineMonthSlashLabel = computed(() => formatMonthSlashLabel(selectedTimelineMonth.value))

const timelineNodes = computed(() => {
  if (!selectedTimelineMonth.value) return []
  const monthStart = getMonthStartDate(selectedTimelineMonth.value)
  const monthEnd = getMonthEndDate(selectedTimelineMonth.value)

  const visibleItems = allTimelineItems.value
    .filter(item => item.type !== 'internal-note')
    .filter(item => isCreatedBeforeMonthEnd(item, monthEnd))

  const internalNotes = allTimelineItems.value
    .filter(item => item.type === 'internal-note')
    .filter(item => isCreatedBeforeMonthEnd(item, monthEnd))

  return visibleItems.map((item) => {
    const status = getTimelineStatus(item.createdAt, monthStart, monthEnd)
    if (item.type !== 'planet') {
      return { ...item, status, childCount: 0, currentChildCount: 0 }
    }

    const childNotes = internalNotes.filter(note => String(note.planetId) === String(item.rawId))
    const currentChildNotes = childNotes.filter((note) => {
      const createdDate = new Date(note.createdAt)
      return createdDate >= monthStart && createdDate <= monthEnd
    })
    const hasCurrentChildNotes = currentChildNotes.length > 0

    return {
      ...item,
      status: status === 'current' || hasCurrentChildNotes ? 'current' : 'past',
      childCount: childNotes.length,
      currentChildCount: currentChildNotes.length
    }
  })
})

const timelineLinks = computed(() => [])

const timelineSummary = computed(() => {
  if (!selectedTimelineMonth.value) {
    return { currentCount: 0, currentPlanetCount: 0, currentNoteCount: 0, planetCount: 0, noteCount: 0, floatingNoteCount: 0, internalNoteCount: 0 }
  }

  const monthStart = getMonthStartDate(selectedTimelineMonth.value)
  const monthEnd = getMonthEndDate(selectedTimelineMonth.value)
  const items = allTimelineItems.value.filter(item => isCreatedBeforeMonthEnd(item, monthEnd))
  const currentItems = items.filter((item) => {
    const createdDate = new Date(item.createdAt)
    return createdDate >= monthStart && createdDate <= monthEnd
  })

  return {
    currentCount: currentItems.length,
    currentPlanetCount: currentItems.filter(item => item.type === 'planet').length,
    currentNoteCount: currentItems.filter(item => item.type === 'floating-note' || item.type === 'internal-note').length,
    planetCount: items.filter(item => item.type === 'planet').length,
    noteCount: items.filter(item => item.type === 'floating-note' || item.type === 'internal-note').length,
    floatingNoteCount: items.filter(item => item.type === 'floating-note').length,
    internalNoteCount: items.filter(item => item.type === 'internal-note').length
  }
})

const currentMonthItems = computed(() => {
  if (!selectedTimelineMonth.value) return []
  const monthStart = getMonthStartDate(selectedTimelineMonth.value)
  const monthEnd = getMonthEndDate(selectedTimelineMonth.value)

  return allTimelineItems.value
    .filter((item) => {
      const createdDate = new Date(item.createdAt)
      return createdDate >= monthStart && createdDate <= monthEnd
    })
    .map((item) => {
      const parentPlanetName = item.type === 'internal-note' ? getParentPlanetName(item.planetId) : ''
      let subtitle = ''
      if (item.type === 'planet') {
        subtitle = '當月新增星球'
      } else if (item.type === 'internal-note') {
        subtitle = parentPlanetName ? `位於 ${parentPlanetName}` : '位於未知星球'
      } else {
        subtitle = '漂浮卡片'
      }
      return { ...item, status: 'current', parentPlanetName, subtitle }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const currentMonthGroups = computed(() => {
  const planets = currentMonthItems.value.filter(item => item.type === 'planet')
  const internalNotes = currentMonthItems.value.filter(item => item.type === 'internal-note')
  const floatingNotes = currentMonthItems.value.filter(item => item.type === 'floating-note')

  return [
    { key: 'planet', title: '星球', icon: 'fa-solid fa-globe', items: planets },
    { key: 'internal-note', title: '星球內卡片', icon: 'fa-solid fa-layer-group', items: internalNotes },
    { key: 'floating-note', title: '漂浮卡片', icon: 'fa-solid fa-note-sticky', items: floatingNotes }
  ].filter(group => group.items.length > 0)
})

const currentMonthTotalCount = computed(() => currentMonthItems.value.length)

const openTimelineNode = (node) => {
  if (node.type === 'floating-note' || node.type === 'internal-note' || node.type === 'note') {
    router.push(`/editor/${node.rawId}`)
    return
  }
  if (node.type === 'planet') {
    router.push({ path: '/universe', query: { planet: node.rawId } })
  }
}

const goUniverse = () => {
  router.push('/universe')
}

const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  setTimeout(() => { toast.message = '' }, 2600)
}

const loadProfile = async () => {
  if (!user.value?.id) {
    router.push('/')
    return
  }

  try {
    const res = await api.get(`/users/${user.value.id}/profile`)
    Object.assign(profile, res.data)
  } catch (err) {
    console.warn('無法讀取星圖檔案資訊', err)
  }
}

watch(
  timelineMonths,
  (months) => {
    if (!months.length) {
      selectedTimelineMonth.value = currentMonthValue.value
      return
    }
    const hasCurrentMonth = months.some(month => month.value === currentMonthValue.value)
    const hasSelectedMonth = months.some(month => month.value === selectedTimelineMonth.value)
    if (!selectedTimelineMonth.value || !hasSelectedMonth) {
      selectedTimelineMonth.value = hasCurrentMonth ? currentMonthValue.value : months[months.length - 1].value
    }
  },
  { immediate: true }
)

onMounted(async () => {
  const savedTheme = localStorage.getItem('nova-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)

  await Promise.all([
    loadProfile(),
    notesStore.refreshData(),
    planetsStore.fetchPlanets()
  ])

  if (!selectedTimelineMonth.value && currentMonthValue.value) {
    selectedTimelineMonth.value = currentMonthValue.value
  }
})
</script>

<style scoped>
.star-overview-page {
  --star-bg: var(--profile-bg);
  --star-bg-radial-1: var(--profile-bg-radial-1);
  --star-bg-radial-2: var(--profile-bg-radial-2);

  --star-text: var(--profile-text);
  --star-heading: var(--profile-heading);
  --star-muted: var(--profile-muted);
  --star-muted-soft: var(--profile-muted-soft);

  --star-accent: var(--accent-color);
  --star-accent-hover: var(--accent-color-hover);
  --star-cyan: var(--link-color);

  --star-accent-soft: var(--accent-soft);
  --star-accent-border: var(--accent-border);

  --star-panel-bg:
    radial-gradient(circle at 50% 0%, var(--accent-soft), transparent 24%),
    radial-gradient(circle at 82% 20%, rgba(81, 186, 252, 0.09), transparent 28%),
    var(--profile-panel-bg);

  --star-panel-soft: var(--profile-panel-bg-soft);
  --star-panel-border: var(--profile-panel-border);

  --star-card-bg:
    radial-gradient(circle at 50% 0%, var(--accent-soft), transparent 56%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
    var(--profile-panel-bg-soft);

  --star-shadow-sm: var(--profile-shadow-sm);
  --star-shadow-md: var(--profile-shadow-md);
  --star-shadow-lg: var(--profile-shadow-lg);

  min-height: 100vh;
  width: 100vw;

  padding: 56px 72px 96px;
  box-sizing: border-box;

  color: var(--star-text);

  background:
    linear-gradient(rgba(143, 124, 255, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.026) 1px, transparent 1px),
    radial-gradient(circle at 12% 8%, var(--star-bg-radial-1), transparent 28%),
    radial-gradient(circle at 96% 14%, var(--star-bg-radial-2), transparent 30%),
    radial-gradient(circle at 52% 86%, rgba(143, 124, 255, 0.06), transparent 35%),
    var(--star-bg);

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

:global(html[data-theme='light']) .star-overview-page {
  background:
    linear-gradient(rgba(143, 124, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.02) 1px, transparent 1px),
    radial-gradient(circle at 12% 8%, var(--star-bg-radial-1), transparent 28%),
    radial-gradient(circle at 96% 14%, var(--star-bg-radial-2), transparent 30%),
    radial-gradient(circle at 52% 86%, rgba(143, 124, 255, 0.045), transparent 35%),
    var(--star-bg);
}

/* =========================
   Layout
========================= */

.star-main {
  width: min(100%, 1180px);
  margin: 0 auto;
}

.star-header {
  width: min(100%, 1180px);

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  margin: 0 auto 44px;
}

.star-header p,
.timeline-title-block p,
.panel-title p {
  margin: 0 0 8px;

  color: var(--star-accent);

  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.star-header h1 {
  margin: 0;

  color: var(--star-heading);

  font-size: clamp(2rem, 4vw, 3.1rem);
  font-weight: 950;
  line-height: 1.08;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.16),
    0 0 28px rgba(143, 124, 255, 0.18);
}

.back-btn {
  position: relative;

  min-height: 42px;
  padding: 0 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  color: var(--star-heading);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012)),
    var(--star-panel-soft);

  border: 1px solid var(--star-panel-border);
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

  box-shadow: var(--star-shadow-sm);

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  color: var(--star-accent);
  border-color: var(--star-accent-border);
  background: var(--accent-soft);
  box-shadow: var(--star-shadow-md);
}

/* =========================
   Panel
========================= */

.star-panel {
  position: relative;
  width: 100%;

  margin: 0 auto 24px;
  padding: clamp(24px, 3vw, 34px);

  color: var(--star-text);
  background: var(--star-panel-bg);
  border: 1px solid var(--star-panel-border);
  border-radius: 8px;

  box-shadow: var(--star-shadow-lg);

  overflow: hidden;

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.star-panel::before {
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

.star-panel::after {
  content: '';

  position: absolute;
  top: 14px;
  right: 14px;

  width: 34px;
  height: 34px;

  border-top: 2px solid var(--star-accent-border);
  border-right: 2px solid var(--star-accent-border);

  filter:
    drop-shadow(0 0 8px rgba(143, 124, 255, 0.42))
    drop-shadow(0 0 16px rgba(81, 186, 252, 0.16));

  pointer-events: none;
}

.star-panel > * {
  position: relative;
  z-index: 2;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-bottom: 22px;
  margin-bottom: 24px;

  border-bottom: 1px solid var(--star-panel-border);
}

.panel-title p {
  margin-bottom: 6px;
  font-size: 0.76rem;
  letter-spacing: 0.18em;
}

.panel-title h2,
.timeline-title-block h2 {
  margin: 0;

  color: var(--star-heading);

  font-size: clamp(1.35rem, 3vw, 1.75rem);
  font-weight: 900;
  line-height: 1.2;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.16),
    0 0 24px rgba(143, 124, 255, 0.16);
}

/* =========================
   Stats
========================= */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  position: relative;

  min-width: 0;
  padding: 22px;

  background: var(--star-card-bg);

  border: 1px solid var(--star-panel-border);
  border-radius: 8px;

  overflow: hidden;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.stat-card::before {
  content: '';

  position: absolute;
  inset: 7px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;

  pointer-events: none;
}

.stat-card::after {
  content: '';

  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 12px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      var(--star-accent),
      rgba(81, 186, 252, 0.35),
      transparent
    );

  opacity: 0.72;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--star-accent-border);
  box-shadow:
    0 0 24px rgba(143, 124, 255, 0.16),
    0 14px 32px rgba(0, 0, 0, 0.22);
}

.stat-card span {
  width: 42px;
  height: 42px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-bottom: 18px;

  color: var(--star-accent);
  background:
    radial-gradient(circle at 50% 22%, var(--accent-soft), transparent 58%),
    rgba(143, 124, 255, 0.12);

  border: 1px solid var(--star-accent-border);
  border-radius: 8px;

  box-shadow:
    0 0 18px rgba(143, 124, 255, 0.22),
    inset 0 0 14px rgba(143, 124, 255, 0.08);
}

.stat-card p {
  margin: 0 0 10px;

  color: var(--star-muted);

  font-size: 0.86rem;
  font-weight: 850;
}

.stat-card strong {
  display: block;

  color: var(--star-heading);

  font-size: clamp(1.65rem, 4vw, 2rem);
  font-weight: 900;
  line-height: 1;

  text-shadow: 0 0 16px rgba(143, 124, 255, 0.18);
}

/* =========================
   Timeline Head
========================= */

.timeline-panel {
  width: 100%;
}

.timeline-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  padding-bottom: 22px;
  margin-bottom: 24px;

  border-bottom: 1px solid var(--star-panel-border);
}

.timeline-title-block p {
  margin-bottom: 6px;
  font-size: 0.76rem;
  letter-spacing: 0.18em;
}

.timeline-select-field {
  min-width: 220px;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-select-field > span {
  color: var(--star-muted);

  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
}

.timeline-select-shell {
  position: relative;

  height: 46px;

  display: flex;
  align-items: center;

  background:
    radial-gradient(circle at 62% 50%, rgba(81, 186, 252, 0.14), transparent 32%),
    var(--input-bg);

  border: 1px solid var(--star-accent-border);
  border-radius: 10px;

  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.035),
    0 0 22px rgba(81, 186, 252, 0.12),
    inset 0 0 24px rgba(143, 124, 255, 0.06);

  overflow: hidden;
}

.timeline-select-shell::before {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.11) 50%,
      transparent 60%,
      transparent 100%
    );

  transform: translateX(-120%);
  animation: timelineSelectShine 5s ease-in-out infinite;

  pointer-events: none;
}

.timeline-select-shell select {
  position: relative;
  z-index: 2;

  width: 100%;
  height: 100%;

  padding: 0 42px 0 14px;

  color: var(--input-text);
  background: transparent;
  border: 0;
  outline: none;

  appearance: none;
  -webkit-appearance: none;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.96rem;
  font-weight: 850;
}

.timeline-select-shell select option {
  color: var(--select-option-text);
  background: var(--select-option-bg);
}

.timeline-select-shell i {
  position: absolute;
  right: 14px;
  top: 50%;
  z-index: 3;

  color: var(--star-accent);

  font-size: 0.95rem;

  transform: translateY(-50%);
  pointer-events: none;

  filter: drop-shadow(0 0 8px rgba(143, 124, 255, 0.72));
}

.timeline-summary-bar {
  margin-bottom: 16px;
}

.timeline-summary-bar p {
  margin: 0;

  color: var(--star-muted);

  font-size: 0.96rem;
  font-weight: 850;
  line-height: 1.8;
}

.timeline-summary-bar strong {
  color: var(--star-heading);
  font-weight: 900;
}

.timeline-summary-bar .accent-number,
.accent-number {
  color: var(--star-accent);
  text-shadow:
    0 0 10px rgba(143, 124, 255, 0.62),
    0 0 22px rgba(81, 186, 252, 0.16);
}

.timeline-tip {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 16px 18px;
  margin-bottom: 20px;

  color: var(--star-muted);
  background: var(--star-panel-soft);
  border: 1px solid var(--star-panel-border);
  border-radius: 12px;

  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.6;
}

.timeline-tip i {
  color: var(--star-accent);
  font-size: 1.05rem;
  filter: drop-shadow(0 0 8px rgba(143, 124, 255, 0.6));
}

/* =========================
   Timeline Map
========================= */

.timeline-map-frame {
  position: relative;

  padding: 14px;
  margin-bottom: 24px;

  background:
    linear-gradient(135deg, rgba(81, 186, 252, 0.12), transparent 18%),
    linear-gradient(315deg, var(--accent-soft), transparent 18%),
    rgba(4, 8, 24, 0.68);

  border: 1px solid rgba(81, 186, 252, 0.32);
  border-radius: 18px;

  box-shadow:
    0 0 24px rgba(81, 186, 252, 0.14),
    inset 0 0 34px rgba(81, 186, 252, 0.05);
}

:global(html[data-theme='light']) .timeline-map-frame {
  background:
    linear-gradient(135deg, rgba(81, 186, 252, 0.08), transparent 18%),
    linear-gradient(315deg, var(--accent-soft), transparent 18%),
    rgba(255, 255, 255, 0.72);
}

.timeline-map-frame::before {
  content: '';

  position: absolute;
  inset: 8px;

  border: 1px dashed rgba(150, 160, 220, 0.22);
  border-radius: 14px;

  pointer-events: none;
}

.timeline-map-frame-corner {
  position: absolute;
  z-index: 3;

  width: 38px;
  height: 38px;

  border-color: var(--star-accent-border);
  filter: drop-shadow(0 0 8px rgba(143, 124, 255, 0.5));

  pointer-events: none;
}

.timeline-map-frame-corner.top-left {
  top: 10px;
  left: 10px;
  border-top: 2px solid;
  border-left: 2px solid;
}

.timeline-map-frame-corner.top-right {
  top: 10px;
  right: 10px;
  border-top: 2px solid;
  border-right: 2px solid;
}

.timeline-map-frame-corner.bottom-left {
  bottom: 10px;
  left: 10px;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.timeline-map-frame-corner.bottom-right {
  right: 10px;
  bottom: 10px;
  border-right: 2px solid;
  border-bottom: 2px solid;
}

.timeline-map {
  position: relative;

  height: 360px;
  min-height: 360px;

  background:
    radial-gradient(circle at 56% 52%, var(--accent-soft), transparent 24%),
    radial-gradient(circle at 36% 64%, rgba(143, 124, 255, 0.1), transparent 18%),
    radial-gradient(circle at 50% 50%, rgba(81, 186, 252, 0.07), transparent 46%),
    linear-gradient(rgba(81, 186, 252, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(81, 186, 252, 0.03) 1px, transparent 1px),
    rgba(2, 6, 20, 0.8);

  background-size:
    auto,
    auto,
    auto,
    42px 42px,
    42px 42px,
    auto;

  border: 1px dashed rgba(160, 170, 230, 0.2);
  border-radius: 14px;

  overflow: hidden;
}

:global(html[data-theme='light']) .timeline-map {
  background:
    radial-gradient(circle at 56% 52%, var(--accent-soft), transparent 24%),
    radial-gradient(circle at 50% 50%, rgba(81, 186, 252, 0.07), transparent 46%),
    linear-gradient(rgba(81, 186, 252, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(81, 186, 252, 0.045) 1px, transparent 1px),
    rgba(255, 255, 255, 0.66);
}

.timeline-map::before {
  content: '';

  position: absolute;
  inset: 0;

  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.42) 1px, transparent 1.7px),
    radial-gradient(circle, rgba(81, 186, 252, 0.22) 1px, transparent 1.4px);

  background-size:
    94px 94px,
    53px 53px;

  opacity: 0.28;

  pointer-events: none;
}

.timeline-map::after {
  content: '';

  position: absolute;
  top: 10%;
  right: 18%;

  width: 220px;
  height: 220px;

  background:
    radial-gradient(circle, rgba(143, 124, 255, 0.16), transparent 64%);

  filter: blur(8px);
  opacity: 0.48;

  pointer-events: none;
}

.timeline-orbit {
  position: absolute;
  left: 50%;
  top: 50%;

  border: 1px solid rgba(81, 186, 252, 0.14);
  border-radius: 50%;

  transform: translate(-50%, -50%) rotate(-12deg);

  pointer-events: none;
}

.orbit-1 {
  width: 28%;
  height: 20%;
}

.orbit-2 {
  width: 46%;
  height: 34%;
}

.orbit-3 {
  width: 66%;
  height: 48%;
}

.orbit-4 {
  width: 88%;
  height: 64%;
}

.timeline-lines {
  position: absolute;
  inset: 0;
  z-index: 2;

  width: 100%;
  height: 100%;

  pointer-events: none;
}

.timeline-line {
  stroke-width: 1.6;
  stroke-linecap: round;
}

.timeline-line.past {
  stroke: rgba(115, 130, 170, 0.26);
  opacity: 0.36;
}

.timeline-line.active {
  stroke: rgba(143, 124, 255, 0.95);
  opacity: 0.95;
  filter:
    drop-shadow(0 0 6px rgba(143, 124, 255, 0.8))
    drop-shadow(0 0 14px rgba(81, 186, 252, 0.28));
}

.timeline-node {
  position: absolute;
  z-index: 4;

  padding: 0;

  background: transparent;
  border: 0;

  cursor: pointer;

  transform: translate(-50%, -50%);

  transition:
    opacity 0.22s ease,
    filter 0.22s ease,
    transform 0.22s ease;
}

.timeline-node:hover {
  transform: translate(-50%, -50%) scale(1.22);
  opacity: 1;
  filter: none;
}

.timeline-node.planet {
  width: 30px;
  height: 30px;
}

.timeline-node.floating-note {
  width: 18px;
  height: 18px;
}

.timeline-node.past {
  opacity: 0.42;
  filter: grayscale(1) brightness(0.74);
}

.timeline-node.current {
  opacity: 1;
  filter: none;
}

.timeline-node.current.planet {
  width: 36px;
  height: 36px;
}

.timeline-node.current.floating-note {
  width: 24px;
  height: 24px;
}

.node-core {
  position: absolute;
  display: block;
}

.timeline-node.planet .node-core {
  inset: 5px;

  border-radius: 50%;

  background:
    radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.94), rgba(205, 196, 255, 0.48) 38%, rgba(92, 78, 148, 0.72) 70%);

  box-shadow:
    inset -2px -2px 6px rgba(0, 0, 0, 0.34),
    0 0 7px rgba(143, 124, 255, 0.2);
}

.timeline-node.floating-note .node-core {
  inset: 5px;

  border-radius: 3px;

  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(143, 124, 255, 0.74) 45%, rgba(90, 75, 220, 0.86));

  box-shadow:
    0 0 9px rgba(143, 124, 255, 0.28),
    inset 0 0 5px rgba(255, 255, 255, 0.16);

  transform: rotate(45deg);
}

.timeline-node.current.planet .node-core {
  inset: 6px;

  background:
    radial-gradient(circle at 35% 30%, #ffffff 0%, #f7f4ff 26%, var(--star-accent) 56%, #5a43e8 100%);

  box-shadow:
    0 0 10px rgba(255, 255, 255, 0.82),
    0 0 24px rgba(143, 124, 255, 0.95),
    0 0 52px rgba(143, 124, 255, 0.58),
    0 0 76px rgba(81, 186, 252, 0.18);
}

.timeline-node.current.floating-note .node-core {
  inset: 6px;

  background:
    linear-gradient(135deg, #ffffff 0%, #d8d0ff 28%, var(--star-accent) 58%, #6d55ff 100%);

  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.72),
    0 0 18px rgba(143, 124, 255, 0.86),
    0 0 38px rgba(143, 124, 255, 0.46);

  transform: rotate(45deg);
}

.node-pulse {
  position: absolute;
  inset: -14px;

  display: block;

  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
}

.timeline-node.current .node-pulse {
  opacity: 1;

  background:
    radial-gradient(circle, rgba(143, 124, 255, 0.34) 0%, rgba(143, 124, 255, 0.12) 30%, transparent 68%);

  animation: nodePulse 2.8s ease-in-out infinite;
}

.timeline-node.planet .node-pulse::before,
.timeline-node.planet .node-pulse::after {
  content: '';

  position: absolute;

  border: 1px solid rgba(143, 124, 255, 0.34);
  border-radius: 50%;
}

.timeline-node.planet .node-pulse::before {
  inset: 8px;
}

.timeline-node.planet .node-pulse::after {
  inset: 15px;
  border-color: rgba(81, 186, 252, 0.18);
}

.node-child-badge {
  position: absolute;
  right: -14px;
  top: -10px;
  z-index: 5;

  min-width: 22px;
  height: 18px;
  padding: 0 6px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--star-heading);
  background:
    radial-gradient(circle at 50% 20%, var(--accent-soft), transparent 62%),
    var(--star-panel-soft);

  border: 1px solid var(--star-accent-border);
  border-radius: 999px;

  font-size: 0.62rem;
  font-weight: 850;

  box-shadow:
    0 0 12px rgba(143, 124, 255, 0.2),
    inset 0 0 10px rgba(143, 124, 255, 0.08);
}

.node-child-badge.current {
  color: var(--accent-text);
  border-color: var(--star-accent-border);
  box-shadow:
    0 0 12px rgba(143, 124, 255, 0.6),
    0 0 24px rgba(143, 124, 255, 0.3);
}

/* =========================
   Empty
========================= */

.timeline-empty {
  position: absolute;
  inset: 0;
  z-index: 5;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  padding: 28px;
  text-align: center;

  color: var(--star-muted);
  background:
    radial-gradient(circle at 50% 30%, var(--accent-soft), transparent 42%),
    rgba(2, 6, 20, 0.64);

  font-weight: 800;
  line-height: 1.7;
}

:global(html[data-theme='light']) .timeline-empty {
  background:
    radial-gradient(circle at 50% 30%, var(--accent-soft), transparent 42%),
    rgba(255, 255, 255, 0.72);
}

.timeline-empty i {
  color: var(--star-accent);
  font-size: 1.5rem;
  filter: drop-shadow(0 0 10px rgba(143, 124, 255, 0.55));
}

/* =========================
   Current Month Groups
========================= */

.timeline-new-section {
  margin-top: 10px;
}

.timeline-new-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  margin-bottom: 18px;
}

.timeline-new-header h3 {
  margin: 0;

  color: var(--star-heading);

  font-size: 1.15rem;
  font-weight: 900;
}

.timeline-new-header > strong {
  min-width: 42px;
  height: 32px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--star-heading);
  background:
    radial-gradient(circle at 50% 20%, var(--accent-soft), transparent 62%),
    rgba(143, 124, 255, 0.14);

  border: 1px solid var(--star-accent-border);
  border-radius: 6px;

  font-size: 0.92rem;
  font-weight: 850;
}

.timeline-group-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.timeline-new-group {
  padding: 16px;

  background:
    radial-gradient(circle at 10% 0%, var(--accent-soft), transparent 26%),
    var(--star-panel-soft);

  border: 1px solid var(--star-panel-border);
  border-radius: 14px;

  box-shadow:
    inset 0 0 20px rgba(143, 124, 255, 0.035),
    0 10px 22px rgba(0, 0, 0, 0.12);
}

.timeline-new-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 12px;
}

.timeline-new-group-head > div {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 10px;
}

.timeline-new-group-head h4 {
  margin: 0;

  color: var(--star-heading);

  font-size: 0.98rem;
  font-weight: 900;
  line-height: 1.2;
}

.timeline-new-group-head > strong {
  min-width: 34px;
  height: 26px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--star-heading);
  background: var(--accent-soft);
  border: 1px solid var(--star-accent-border);
  border-radius: 6px;

  font-size: 0.78rem;
  font-weight: 850;
}

.timeline-new-group-icon {
  width: 32px;
  height: 32px;

  flex: 0 0 32px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--star-accent);
  background:
    radial-gradient(circle at 50% 30%, var(--accent-soft), transparent 58%),
    rgba(143, 124, 255, 0.08);

  border: 1px solid var(--star-accent-border);
  border-radius: 10px;

  font-size: 0.9rem;
}

.timeline-new-group-icon.planet {
  color: var(--star-accent);
}

.timeline-new-group-icon.internal-note {
  color: var(--star-accent-hover);
}

.timeline-new-group-icon.floating-note {
  color: var(--star-accent);
}

.timeline-new-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-new-scroll.scrollable {
  max-height: 286px;
  padding-right: 6px;

  overflow-y: auto;
}

.timeline-new-scroll.scrollable::-webkit-scrollbar {
  width: 6px;
}

.timeline-new-scroll.scrollable::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.035);
  border-radius: 999px;
}

.timeline-new-scroll.scrollable::-webkit-scrollbar-thumb {
  background: var(--star-accent-border);
  border-radius: 999px;
}

.timeline-new-scroll.scrollable::-webkit-scrollbar-thumb:hover {
  background: var(--star-accent);
}

.timeline-new-item {
  width: 100%;
  min-height: 82px;

  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;

  padding: 16px;

  color: var(--star-heading);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
    var(--star-panel-soft);

  border: 1px solid var(--star-panel-border);
  border-radius: 12px;

  cursor: pointer;

  font-family: inherit;
  text-align: left;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.timeline-new-item:hover {
  transform: translateY(-2px);
  border-color: var(--star-accent-border);
  box-shadow: 0 0 20px rgba(143, 124, 255, 0.14);
}

.timeline-new-item.planet,
.timeline-new-item.internal-note {
  border-color: var(--star-panel-border);
}

.timeline-new-item.floating-note {
  border-color: var(--star-accent-border);
}

.timeline-new-item-icon {
  width: 40px;
  height: 40px;

  flex: 0 0 40px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--star-accent);
  background:
    radial-gradient(circle at 50% 30%, var(--accent-soft), transparent 58%),
    rgba(143, 124, 255, 0.08);

  border: 1px solid var(--star-accent-border);
  border-radius: 12px;

  font-size: 1rem;
}

.timeline-new-item-icon.planet {
  color: var(--star-accent);
}

.timeline-new-item-icon.in-planet {
  color: var(--star-accent-hover);
}

.timeline-new-item-icon.floating {
  color: var(--star-accent);
}

.timeline-new-item-text {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-new-item-text strong {
  color: var(--star-heading);

  font-size: 0.98rem;
  font-weight: 850;
  line-height: 1.25;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-new-item-text span {
  color: var(--star-muted);

  font-size: 0.84rem;
  font-weight: 750;
  line-height: 1.35;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-new-item .open-icon,
.open-icon {
  color: var(--star-muted);
  font-size: 0.88rem;
}

.timeline-no-new {
  margin: 0;
  padding: 16px 18px;

  color: var(--star-muted);
  background: var(--surface-bg-soft);
  border: 1px solid var(--star-panel-border);
  border-radius: 12px;

  font-size: 0.92rem;
  font-weight: 750;
  line-height: 1.7;
}

/* =========================
   Toast
========================= */

.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 500;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  max-width: min(420px, calc(100vw - 32px));
  padding: 14px 18px;

  color: var(--star-text);
  background: var(--star-panel-bg);
  border: 1px solid var(--star-panel-border);
  border-radius: 8px;

  box-shadow:
    0 0 26px rgba(143, 124, 255, 0.18),
    var(--star-shadow-lg);

  font-weight: 850;

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
  transform: translateY(10px);
}

/* =========================
   Animation
========================= */

@keyframes timelineSelectShine {
  0% {
    transform: translateX(-120%);
  }

  42% {
    transform: translateX(-120%);
  }

  68% {
    transform: translateX(120%);
  }

  100% {
    transform: translateX(120%);
  }
}

@keyframes nodePulse {
  0%,
  100% {
    transform: scale(0.82);
    opacity: 0.72;
  }

  50% {
    transform: scale(1.16);
    opacity: 1;
  }
}

/* =========================
   Scrollbar
========================= */

.star-overview-page::-webkit-scrollbar {
  width: 8px;
}

.star-overview-page::-webkit-scrollbar-thumb {
  background: var(--star-accent-border);
  border-radius: 999px;
}

.star-overview-page::-webkit-scrollbar-thumb:hover {
  background: var(--star-accent);
}

.star-overview-page::-webkit-scrollbar-track {
  background: transparent;
}

/* =========================
   RWD
========================= */

@media (max-width: 980px) {
  .star-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .timeline-topbar {
    align-items: stretch;
    flex-direction: column;
  }

  .timeline-select-field {
    min-width: 100%;
  }

  .star-overview-page {
    padding: 36px 24px 72px;
  }

  .star-panel {
    padding: 24px;
  }
}

@media (max-width: 620px) {
  .star-overview-page {
    padding: 30px 16px 64px;
  }

  .star-header h1 {
    font-size: 1.8rem;
  }

  .star-panel {
    padding: 20px 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .timeline-map {
    height: 320px;
    min-height: 320px;
  }

  .timeline-tip {
    align-items: flex-start;
    font-size: 0.88rem;
  }

  .timeline-new-group {
    padding: 14px;
  }

  .timeline-new-item {
    min-height: 74px;
    padding: 14px;
  }

  .timeline-new-scroll.scrollable {
    max-height: 252px;
  }
}

@media (max-width: 420px) {
  .star-overview-page {
    padding-left: 12px;
    padding-right: 12px;
  }

  .timeline-map {
    height: 300px;
    min-height: 300px;
  }

  .timeline-select-shell {
    height: 44px;
  }

  .timeline-select-shell select {
    font-size: 0.92rem;
  }

  .timeline-new-item-text strong {
    font-size: 0.92rem;
  }

  .timeline-new-item-text span {
    font-size: 0.8rem;
  }
}
</style>
