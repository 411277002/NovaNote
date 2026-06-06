<template>
  <section class="mini-map" @mousedown.stop>
    <div v-if="!collapsed" class="mini-map-content">
      <div class="mini-timeline" v-if="availableMonths.length > 0">
        <div class="mini-timeline-top">
          <div class="mini-timeline-title">
            <i class="fa-solid fa-clock-rotate-left"></i>
            知識時間軸
          </div>
        </div>

        <div class="mini-timeline-select-row">
          <label class="mini-timeline-select-label">
            回顧月份
          </label>

          <div class="mini-timeline-select-wrap">
            <select
              v-model="selectedMonth"
              class="mini-timeline-select"
            >
              <option
                v-for="month in availableMonths"
                :key="month"
                :value="month"
              >
                {{ formatMonth(month) }}
              </option>
            </select>

            <i class="fa-solid fa-chevron-down mini-select-arrow"></i>
          </div>
        </div>

        <p class="mini-timeline-summary">
          截至
          <strong>{{ formatMonth(selectedMonth) }}</strong>
          ：{{ timelinePlanets.length }} 顆星球・{{ timelineNotes.length }} 張漂浮卡片
        </p>

        <p class="mini-timeline-current">
          本月新增
          <strong>{{ currentMonthStats.planets }}</strong>
          顆星球・
          <strong>{{ currentMonthStats.notes }}</strong>
          張卡片
        </p>

        <!-- 星圖：放在時間軸框框裡 -->
        <div class="mini-map-body">
          <button
            v-for="planet in timelinePlanets"
            :key="'mini-p-' + planet.id"
            class="mini-node mini-planet"
            :class="`timeline-${getTimelineStatus(planet)}`"
            type="button"
            :title="getPlanetTitle(planet)"
            :style="getNodeStyle(planet)"
            @click="emit('focus-node', { type: 'planet', id: planet.id })"
          ></button>

          <button
            v-for="note in timelineNotes"
            :key="'mini-n-' + note.id"
            class="mini-node mini-note"
            :class="`timeline-${getTimelineStatus(note)}`"
            type="button"
            :title="getNoteTitle(note)"
            :style="getNodeStyle(note)"
            @click="emit('focus-node', { type: 'note', id: note.id })"
          ></button>

          <div class="mini-map-glow"></div>
        </div>
      </div>

      <!-- 沒有 created_at 或沒有月份資料時 -->
      <div class="mini-timeline-empty" v-else>
        <i class="fa-solid fa-circle-info"></i>
        尚無可用的月份資料
      </div>

      <!-- 本月新增清單：放在時間軸框框外面 -->
      <div class="monthly-new-list" v-if="selectedMonth">
        <div class="monthly-new-header">
          <span>
            <i class="fa-solid fa-sparkles"></i>
            本月新增
          </span>

          <strong>
            {{ currentMonthItems.length }}
          </strong>
        </div>

        <div v-if="currentMonthItems.length > 0" class="monthly-new-items">
          <button
            v-for="item in currentMonthItems"
            :key="item.type + '-' + item.id"
            class="monthly-new-item"
            :class="item.type === 'planet' ? 'planet-item' : 'note-item'"
            type="button"
            @click="handleOpenTimelineItem(item)"
          >
            <span
              class="monthly-new-icon icon-badge"
              :class="item.type === 'planet' ? 'planet-badge' : 'note-badge'"
            >
              <i
                class="fa-solid"
                :class="item.type === 'planet' ? 'fa-earth-asia' : 'fa-puzzle-piece'"
              ></i>
            </span>

            <span class="monthly-new-name">
              {{ item.name }}
            </span>

            <i class="fa-solid fa-arrow-up-right-from-square monthly-new-arrow"></i>
          </button>
        </div>

        <div v-else class="monthly-new-empty">
          這個月份沒有新增內容
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  planets: {
    type: Array,
    default: () => []
  },
  notes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['focus-node', 'open-note', 'open-planet'])

const collapsed = ref(false)
const selectedMonth = ref(null)

const getCreatedAt = (item) => {
  return (
    item?.created_at ||
    item?.createdAt ||
    item?.created_time ||
    item?.createdTime ||
    item?.createdDate ||
    null
  )
}

const getMonthKey = (dateString) => {
  if (!dateString) return null

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) return null

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

const getCurrentMonthKey = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')

  return `${year}-${month}`
}

const addOneMonth = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number)

  const date = new Date(year, month - 1, 1)
  date.setMonth(date.getMonth() + 1)

  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')

  return `${nextYear}-${nextMonth}`
}

const buildMonthRange = (startMonth, endMonth) => {
  if (!startMonth || !endMonth) return []

  const months = []
  let cursor = startMonth

  while (cursor <= endMonth) {
    months.push(cursor)
    cursor = addOneMonth(cursor)
  }

  return months
}

const availableMonths = computed(() => {
  const dates = [
    ...props.planets.map(item => getCreatedAt(item)),
    ...props.notes.map(item => getCreatedAt(item))
  ].filter(Boolean)

  const existingMonths = dates
    .map(date => getMonthKey(date))
    .filter(Boolean)
    .sort()

  if (!existingMonths.length) return []

  const firstCreatedMonth = existingMonths[0]
  const currentMonth = getCurrentMonthKey()

  return buildMonthRange(firstCreatedMonth, currentMonth)
})

watch(
  availableMonths,
  (months) => {
    if (!months.length) {
      selectedMonth.value = null
      return
    }

    if (!selectedMonth.value || !months.includes(selectedMonth.value)) {
      selectedMonth.value = months[months.length - 1]
    }
  },
  { immediate: true }
)

const getTimelineStatus = (item) => {
  if (!selectedMonth.value) return 'normal'

  const itemMonth = getMonthKey(getCreatedAt(item))

  // 沒有 created_at 的舊資料，先當作過去資料保留顯示
  if (!itemMonth) return 'past'

  if (itemMonth === selectedMonth.value) {
    return 'current'
  }

  if (itemMonth < selectedMonth.value) {
    return 'past'
  }

  return 'future'
}

const timelinePlanets = computed(() => {
  if (!selectedMonth.value) return props.planets

  return props.planets.filter(planet => {
    return getTimelineStatus(planet) !== 'future'
  })
})

const timelineNotes = computed(() => {
  if (!selectedMonth.value) return props.notes

  return props.notes.filter(note => {
    return getTimelineStatus(note) !== 'future'
  })
})

const currentMonthStats = computed(() => {
  if (!selectedMonth.value) {
    return {
      planets: 0,
      notes: 0
    }
  }

  return {
    planets: props.planets.filter(planet => {
      return getMonthKey(getCreatedAt(planet)) === selectedMonth.value
    }).length,
    notes: props.notes.filter(note => {
      return getMonthKey(getCreatedAt(note)) === selectedMonth.value
    }).length
  }
})

const currentMonthItems = computed(() => {
  if (!selectedMonth.value) return []

  const currentPlanets = props.planets
    .filter(planet => {
      return getMonthKey(getCreatedAt(planet)) === selectedMonth.value
    })
    .map(planet => ({
      type: 'planet',
      id: planet.id,
      name: planet.name || '未命名星球',
      createdAt: getCreatedAt(planet),
      raw: planet
    }))

  const currentNotes = props.notes
    .filter(note => {
      return getMonthKey(getCreatedAt(note)) === selectedMonth.value
    })
    .map(note => ({
      type: 'note',
      id: note.id,
      name: note.title || '無標題卡片',
      createdAt: getCreatedAt(note),
      raw: note
    }))

  return [...currentPlanets, ...currentNotes].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()

    return timeB - timeA
  })
})

const formatMonth = (month) => {
  if (!month) return '未選擇'

  const [year, monthNumber] = month.split('-')
  return `${year}/${monthNumber}`
}

const getPlanetTitle = (planet) => {
  const status = getTimelineStatus(planet)

  const prefix = status === 'current'
    ? '本月新增｜'
    : status === 'past'
      ? '過去建立｜'
      : ''

  return `${prefix}${planet.name || '未命名星球'}`
}

const getNoteTitle = (note) => {
  const status = getTimelineStatus(note)

  const prefix = status === 'current'
    ? '本月新增｜'
    : status === 'past'
      ? '過去建立｜'
      : ''

  return `${prefix}${note.title || '無標題卡片'}`
}

const handleOpenTimelineItem = (item) => {
  if (!item) return

  if (item.type === 'note') {
    emit('open-note', item.raw)
    return
  }

  if (item.type === 'planet') {
    emit('open-planet', item.raw)
  }
}

const safePercent = (value, fallback = 0.5) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return fallback * 100

  return Math.min(98, Math.max(2, number * 100))
}

const getNodeStyle = (node) => {
  return {
    left: `${safePercent(node.x_pos)}%`,
    top: `${safePercent(node.y_pos)}%`
  }
}
</script>

<style scoped>
.mini-map {
  position: relative;
  width: 100%;

  --mini-card-bg: var(--surface-bg);
  --mini-content-bg: var(--surface-bg-soft);
  --mini-content-border: var(--surface-border);

  background: none;

  color: var(--text-color);
  overflow: hidden;
}

/* =========================
   Timeline
========================= */

.mini-timeline {
  margin-bottom: 12px;
  padding: 18px;

  border-radius: 22px;
  border: 1px solid var(--surface-border);

  background: var(--mini-card-bg);
  color: var(--text-color);

  box-shadow: var(--sidebar-shadow-sm);
}

.mini-timeline-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  margin-bottom: 9px;
}

.mini-timeline-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  color: var(--heading-color);

  font-size: 0.73rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.mini-timeline-title i {
  color: var(--accent-color);
}

.mini-timeline-select {
  width: 100%;
  height: 42px;

  padding: 0 40px 0 14px;

  border: 1px solid var(--input-border);
  border-radius: 16px;

  background: var(--input-bg);
  color: var(--input-text);

  font-size: 0.9rem;
  font-weight: 900;
  font-family: inherit;

  outline: none;
  cursor: pointer;

  appearance: none;
  -webkit-appearance: none;

  box-shadow: var(--sidebar-shadow-sm);

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.mini-timeline-select-row {
  display: flex;
  flex-direction: column;
  gap: 7px;

  margin-bottom: 10px;
}

.mini-timeline-select-label {
  color: var(--muted-text);

  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.mini-timeline-select-wrap {
  position: relative;
  width: 100%;
}

.mini-timeline-select {
  width: 100%;
  height: 38px;

  padding: 0 36px 0 12px;

  border: 1px solid var(--input-border);
  border-radius: 14px;

  background: var(--input-bg);
  color: var(--input-text);

  font-size: 0.82rem;
  font-weight: 900;
  font-family: inherit;

  outline: none;
  cursor: pointer;

  appearance: none;
  -webkit-appearance: none;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.mini-timeline-select:hover {
  border-color: var(--accent-border);
  background: var(--button-hover-bg);
}

.mini-timeline-select:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.mini-select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;

  transform: translateY(-50%);

  color: var(--accent-color);
  font-size: 0.72rem;

  pointer-events: none;
}

.mini-timeline-summary,
.mini-timeline-current {
  margin: 0;

  color: var(--muted-text);

  font-size: 0.76rem;
  line-height: 1.65;
}

.mini-timeline-summary strong,
.mini-timeline-current strong {
  color: var(--heading-color);
  font-weight: 900;
}

.mini-timeline-empty {
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 12px;
  padding: 10px 11px;

  border-radius: 16px;
  border: 1px solid var(--surface-border);

  color: var(--muted-text);
  background: var(--inner-card-bg);

  font-size: 0.72rem;
  font-weight: 700;
}

.mini-timeline-empty i {
  color: var(--accent-color);
}

/* =========================
   Mini map body
========================= */

.mini-map-body {
  position: relative;
  height: 230px;

  margin-top: 14px;

  border-radius: 20px;
  border: 1px solid var(--mini-content-border);

  background:
    radial-gradient(circle at 30% 22%, var(--accent-soft), transparent 34%),
    radial-gradient(circle at 76% 70%, var(--related-glow), transparent 38%),
    var(--mini-content-bg);

  overflow: hidden;
}

.mini-map-body::before {
  content: '';
  position: absolute;
  inset: 10px;

  border: 1px dashed var(--border-color);
  border-radius: 16px;

  pointer-events: none;
}

.mini-node {
  position: absolute;

  transform: translate(-50%, -50%);

  border: none;
  cursor: pointer;

  z-index: 2;

  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    opacity 0.22s ease,
    filter 0.22s ease,
    background-color 0.22s ease;
}

.mini-node:hover {
  transform: translate(-50%, -50%) scale(1.8);
  z-index: 5;
}

.mini-planet {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: var(--accent-color);
  box-shadow:
    0 0 8px var(--highlight-glow),
    0 0 18px var(--primary-glow);
}

.mini-note {
  width: 6px;
  height: 6px;

  border-radius: 2px;

  background: var(--heading-color);
  box-shadow:
    0 0 8px var(--primary-glow-soft);
}

/* =========================
   Timeline node states
========================= */

.mini-node.timeline-current {
  opacity: 1;
  filter: none;
}

.mini-planet.timeline-current {
  transform: translate(-50%, -50%) scale(1.18);

  background: var(--accent-color);
  box-shadow:
    0 0 10px var(--highlight-glow),
    0 0 24px var(--primary-glow),
    0 0 42px var(--related-glow);
}

.mini-note.timeline-current {
  transform: translate(-50%, -50%) scale(1.16);

  background: var(--heading-color);
  box-shadow:
    0 0 10px var(--primary-glow-soft),
    0 0 22px var(--highlight-glow);
}

.mini-node.timeline-past {
  opacity: 0.38;
  filter: grayscale(1) brightness(0.72);
  box-shadow: none;
}

.mini-planet.timeline-past {
  background: var(--muted-text);
}

.mini-note.timeline-past {
  background: var(--disabled-text);
}

.mini-node.timeline-normal {
  opacity: 1;
  filter: none;
}

.mini-node.timeline-current:hover,
.mini-node.timeline-past:hover,
.mini-node.timeline-normal:hover {
  transform: translate(-50%, -50%) scale(1.8);
  opacity: 1;
  filter: none;
}

.mini-map-glow {
  position: absolute;
  inset: auto 18px 14px 18px;
  height: 1px;

  background: linear-gradient(
    90deg,
    transparent,
    var(--highlight-glow),
    transparent
  );

  pointer-events: none;
}

/* =========================
   Monthly New List
========================= */

.monthly-new-list {
  margin-top: 12px;
  padding: 18px;

  border-radius: 22px;
  border: 1px solid var(--surface-border);

  background: var(--mini-card-bg);
  color: var(--text-color);

  box-shadow: var(--sidebar-shadow-sm);
}

.monthly-new-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  margin-bottom: 10px;
  padding: 0 4px;
}

.monthly-new-header span {
  display: inline-flex;
  align-items: center;
  gap: 7px;

  color: var(--sidebar-heading);

  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.06em;
}

.monthly-new-header i {
  color: var(--sidebar-accent);
}

.monthly-new-header strong {
  min-width: 28px;
  height: 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 8px;

  border-radius: 999px;
  border: 1px solid var(--sidebar-border);

  color: var(--sidebar-count-color);
  background: var(--sidebar-count-bg);

  font-size: 0.72rem;
  font-weight: 800;
}

.monthly-new-items {
  display: flex;
  flex-direction: column;
  gap: 6px;

  max-height: 220px;
  overflow-y: auto;
  overflow-x: hidden;

  padding-right: 2px;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

.monthly-new-items::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* item 整體：仿 sidebar .nav-item */
.monthly-new-item {
  position: relative;

  width: 100%;
  min-width: 0;
  min-height: 48px;

  display: flex;
  align-items: center;

  padding: 9px 10px;

  border: 1px solid transparent;
  border-radius: 14px;

  background: var(--sidebar-item-bg);
  color: var(--sidebar-text);

  cursor: pointer;
  overflow: hidden;

  font-family: inherit;
  text-align: left;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease,
    transform 0.18s ease,
    filter 0.18s ease;
}

.monthly-new-item:hover {
  color: var(--sidebar-heading);
  background: var(--sidebar-item-hover-bg);
  border-color: var(--sidebar-border);
  box-shadow: var(--sidebar-shadow-sm);
  transform: translateY(-1px);
}

/* 左側 icon：仿 sidebar .icon-badge */
.monthly-new-icon {
  width: 30px;
  height: 30px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  margin-right: 11px;
  flex-shrink: 0;

  border-radius: 11px;
  border: 1px solid var(--sidebar-border);

  color: var(--sidebar-icon-color);
  background: var(--sidebar-icon-bg);

  font-size: 0.88rem;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.monthly-new-icon i {
  display: block;
  line-height: 1;
}

.monthly-new-item:hover .monthly-new-icon {
  color: var(--sidebar-icon-hover-color);
  background: var(--sidebar-icon-hover-bg);
  border-color: var(--sidebar-accent-border);
  transform: scale(1.03);
}

/* 名稱：仿 sidebar .name */
.monthly-new-name {
  flex: 1;
  min-width: 0;

  color: inherit;

  font-size: 0.9rem;
  font-weight: 650;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  transition:
    color 0.18s ease,
    font-weight 0.18s ease;
}

.monthly-new-item:hover .monthly-new-name {
  font-weight: 800;
}

.monthly-new-item:hover .monthly-new-type {
  color: var(--sidebar-count-hover-color);
  background: var(--sidebar-count-hover-bg);
  border-color: var(--sidebar-accent-border);
}

.monthly-new-arrow {
  flex-shrink: 0;

  margin-left: 8px;

  color: var(--sidebar-muted);
  font-size: 0.68rem;

  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.monthly-new-item:hover .monthly-new-arrow {
  color: var(--sidebar-accent);
  transform: translate(1px, -1px);
}

/* 不同類型可以保留同樣樣式，只靠 icon 區分 */
.monthly-new-item.planet-item .monthly-new-icon {
  color: var(--sidebar-icon-color);
}

.monthly-new-item.note-item .monthly-new-icon {
  color: var(--sidebar-icon-color);
}

.monthly-new-empty {
  padding: 18px 12px;

  border: 1px dashed var(--sidebar-border);
  border-radius: 14px;

  color: var(--sidebar-muted);
  background: var(--sidebar-surface-soft);

  text-align: center;
  font-size: 0.78rem;
  font-weight: 800;
}
</style>