<template>
  <div class="planet-overlay" @click.self="emit('close')">
    <div class="planet-content-box galaxy-planet-panel" @mousedown.stop>
      <div class="galaxy-panel-edge"></div>
      <div class="galaxy-panel-frame frame-outer"></div>
      <div class="galaxy-panel-frame frame-inner"></div>
      <div class="galaxy-panel-grid"></div>
      <div class="galaxy-panel-energy"></div>

      <span class="galaxy-corner corner-tl"></span>
      <span class="galaxy-corner corner-tr"></span>
      <span class="galaxy-corner corner-bl"></span>
      <span class="galaxy-corner corner-br"></span>

      <header class="planet-header galaxy-planet-header">
        <div class="planet-title-area">
          <div class="planet-title-row">
            <span class="planet-title-icon">
              <i class="fa-solid fa-satellite"></i>
            </span>

            <input
              v-model="editingName"
              class="planet-title-input"
              placeholder="未命名星球"
              @focus="isEditingName = true"
              @blur="saveName"
              @keydown.enter.prevent="saveName"
            />

            <span v-if="isEditingName" class="planet-title-saving-hint">
              Enter Save
            </span>
          </div>

          <div class="planet-update-row">
            <span>LAST UPDATE</span>
            <strong>{{ latestUpdateTime }}</strong>
          </div>
        </div>

        <div class="planet-header-actions">
          <button
            class="add-note-to-planet-btn"
            type="button"
            @click="emit('create-note', planet)"
          >
            <i class="fa-solid fa-plus"></i>
            新增卡片
          </button>

          <button
            class="close-overlay-btn"
            type="button"
            aria-label="關閉"
            @click="emit('close')"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </header>

      <main
        class="planet-notes-zone"
        :class="{
          'is-empty': sortedNotes.length === 0,
          'is-list-view': viewMode === 'list'
        }"
      >
        <template v-if="sortedNotes.length > 0">
          <!-- Grid 模式 -->
          <div v-if="viewMode === 'grid'" class="planet-notes-grid-mode">
            <section class="featured-notes-row">
              <article
                v-for="note in featuredNotes"
                :key="note.id"
                class="inner-note-card featured-note-card"
                @click="emit('open-note', note)"
                @contextmenu.prevent="emit('contextmenu-note', $event, note)"
              >
                <div class="note-card-tags-line" @click.stop>
                  <template v-if="editingTagNoteId === note.id">
                    <input
                      v-model="tagDraft"
                      class="inline-tag-input"
                      placeholder="新增標籤..."
                      @keydown.enter.prevent="saveNoteTags(note)"
                      @keydown.esc.prevent="cancelEditTags"
                      @blur="saveNoteTags(note)"
                    />
                  </template>

                  <button
                    v-else
                    class="inline-tag-trigger"
                    type="button"
                    @click.stop="startEditTags(note)"
                  >
                    <template v-if="note.tags?.length">
                      {{ getNoteTagsText(note) }}
                    </template>

                    <template v-else>
                      <i class="fa-solid fa-plus"></i>
                      新增標籤...
                    </template>
                  </button>
                </div>

                <h4>{{ note.title || '無標題' }}</h4>

                <div class="note-update-time">
                  {{ formatNoteTime(note) }}
                </div>

                <div class="note-card-footer-line"></div>
              </article>
            </section>

            <section
              v-if="restNotes.length > 0"
              class="rest-notes-grid"
            >
              <article
                v-for="note in restNotes"
                :key="note.id"
                class="inner-note-card compact-note-card"
                @click="emit('open-note', note)"
                @contextmenu.prevent="emit('contextmenu-note', $event, note)"
              >
                <div class="note-card-tags-line" @click.stop>
                  <template v-if="editingTagNoteId === note.id">
                    <input
                      v-model="tagDraft"
                      class="inline-tag-input"
                      placeholder="+ 新增標籤..."
                      @keydown.enter.prevent="saveNoteTags(note)"
                      @keydown.esc.prevent="cancelEditTags"
                      @blur="saveNoteTags(note)"
                    />
                  </template>

                  <button
                    v-else
                    class="inline-tag-trigger"
                    type="button"
                    @click.stop="startEditTags(note)"
                  >
                    <template v-if="note.tags?.length">
                      {{ getNoteTagsText(note) }}
                    </template>

                    <template v-else>
                      <i class="fa-solid fa-plus"></i>
                      新增標籤...
                    </template>
                  </button>
                </div>

                <h4>{{ note.title || '無標題' }}</h4>

                <div class="note-update-time">
                  {{ formatNoteTime(note) }}
                </div>

                <div class="note-card-footer-line"></div>
              </article>
            </section>
          </div>

          <!-- List 模式 -->
          <section v-else class="planet-notes-list-mode">
            <div class="note-list-header">
              <span class="list-col-name">標籤 / 名稱</span>
              <span class="list-col-preview">內容</span>
              <span class="list-col-time">修改日期</span>
            </div>

            <article
              v-for="note in sortedNotes"
              :key="note.id"
              class="note-list-row"
              @click="emit('open-note', note)"
              @contextmenu.prevent="emit('contextmenu-note', $event, note)"
            >
              <div class="note-list-name list-col-name">
                <span class="note-list-icon">
                  <i class="fa-regular fa-file-lines"></i>
                </span>

                <div class="note-list-title-wrap">
                  <small class="note-list-tags" @click.stop>
                    <template v-if="editingTagNoteId === note.id">
                      <input
                        v-model="tagDraft"
                        class="inline-tag-input list"
                        placeholder="+ 新增標籤..."
                        @keydown.enter.prevent="saveNoteTags(note)"
                        @keydown.esc.prevent="cancelEditTags"
                        @blur="saveNoteTags(note)"
                      />
                    </template>

                    <button
                      v-else
                      class="inline-tag-trigger list"
                      type="button"
                      @click.stop="startEditTags(note)"
                    >
                      <template v-if="note.tags?.length">
                        {{ getNoteTagsText(note) }}
                      </template>

                      <template v-else>
                        <i class="fa-solid fa-plus"></i>
                        新增標籤...
                      </template>
                    </button>
                  </small>
                  <strong>{{ note.title || '未命名文件' }}</strong>
                </div>
              </div>

              <div class="note-list-preview list-col-preview">
                {{ getFirstLinePreview(note.content) }}
              </div>

              <div class="note-list-time list-col-time">
                {{ formatNoteTime(note) }}
              </div>
            </article>
          </section>
        </template>

        <div v-else class="empty-state galaxy-empty-state">
          <div class="empty-state-icon">
            <i class="fa-solid fa-satellite-dish"></i>
          </div>

          <p>此星球尚無靈感軌道...</p>

          <button
            class="empty-add-note-btn"
            type="button"
            @click="emit('create-note', planet)"
          >
            <i class="fa-solid fa-plus"></i>
            建立第一張卡片
          </button>
        </div>
      </main>

      <footer class="planet-panel-footer">
        <div class="planet-footer-stats">
          <span>
            <i class="fa-solid fa-id-card"></i>
            {{ sortedNotes.length }} CARDS
          </span>

          <span>
            <i class="fa-solid fa-link"></i>
            {{ linksCount }} LINKS
          </span>
        </div>

        <div class="planet-view-switch">
          <span>VIEW</span>

          <button
            type="button"
            :class="{ active: viewMode === 'grid' }"
            title="卡片檢視"
            @click="viewMode = 'grid'"
          >
            <i class="fa-solid fa-grip"></i>
          </button>

          <button
            type="button"
            :class="{ active: viewMode === 'list' }"
            title="列表檢視"
            @click="viewMode = 'list'"
          >
            <i class="fa-solid fa-list"></i>
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  planet: {
    type: Object,
    required: true
  },
  notes: {
    type: Array,
    default: () => []
  },
  linksCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'close',
  'create-note',
  'save-name',
  'open-note',
  'contextmenu-note',
  'filter-tag',
  'update-note-tags'
])

const editingName = ref(props.planet?.name || '未命名星球')
const isEditingName = ref(false)
const viewMode = ref('grid')

const windowWidth = ref(window.innerWidth)

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

const featuredLimit = computed(() => {
  if (windowWidth.value <= 900) return 1
  if (windowWidth.value <= 1280) return 2
  return 3
})

watch(
  () => props.planet,
  (planet) => {
    editingName.value = planet?.name || '未命名星球'
    isEditingName.value = false
  },
  { immediate: true }
)

const getNoteTimeValue = (note) => {
  const value =
    note?.update_at ||
    note?.updateAt ||
    note?.updated_at ||
    note?.updatedAt ||
    note?.modified_at ||
    note?.modifiedAt ||
    note?.created_at ||
    note?.createdAt ||
    0

  const time = new Date(value).getTime()

  return Number.isFinite(time) ? time : 0
}

const sortedNotes = computed(() => {
  return [...props.notes].sort((a, b) => {
    return getNoteTimeValue(b) - getNoteTimeValue(a)
  })
})

const featuredNotes = computed(() => {
  return sortedNotes.value.slice(0, featuredLimit.value)
})

const restNotes = computed(() => {
  return sortedNotes.value.slice(featuredLimit.value)
})

const formatDateTime = (value) => {
  if (!value) return '尚無更新'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '尚無更新'

  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const latestUpdateTime = computed(() => {
  const noteTimes = sortedNotes.value
    .map(note => getNoteTimeValue(note))
    .filter(time => time > 0)

  const planetTime = new Date(
    props.planet?.update_at ||
    props.planet?.updateAt ||
    props.planet?.updated_at ||
    props.planet?.updatedAt ||
    props.planet?.created_at ||
    props.planet?.createdAt ||
    0
  ).getTime()

  const safePlanetTime = Number.isFinite(planetTime) ? planetTime : 0
  const latest = Math.max(safePlanetTime, ...noteTimes)

  if (!latest) return '尚無更新'

  return formatDateTime(latest)
})

const editingTagNoteId = ref(null)
const tagDraft = ref('')

const startEditTags = (note) => {
  editingTagNoteId.value = note.id

  const tags = Array.isArray(note.tags) ? note.tags : []

  tagDraft.value = tags
    .map(tag => String(tag || '').replace('#', '').trim())
    .filter(Boolean)
    .join(', ')
}

const cancelEditTags = () => {
  editingTagNoteId.value = null
  tagDraft.value = ''
}

const saveNoteTags = (note) => {
  const tags = tagDraft.value
    .split(/[,，\s]+/)
    .map(tag => String(tag || '').replace('#', '').trim())
    .filter(Boolean)

  emit('update-note-tags', {
    note,
    tags
  })

  editingTagNoteId.value = null
  tagDraft.value = ''
}

const getNoteTagsText = (note) => {
  const tags = Array.isArray(note?.tags) ? note.tags : []

  if (tags.length === 0) return '未加標籤'

  const text = tags
    .map(tag => String(tag || '').replace('#', '').trim())
    .filter(Boolean)
    .map(tag => `#${tag}`)
    .join('  ')

  return text || '未加標籤'
}

const getFirstLinePreview = (content) => {
  if (!content) return ''

  const firstLine = String(content)
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)[0]

  return firstLine || '沒有內容'
}

const formatNoteTime = (note) => {
  const value =
    note?.update_at ||
    note?.updateAt ||
    note?.updated_at ||
    note?.updatedAt ||
    note?.modified_at ||
    note?.modifiedAt ||
    note?.created_at ||
    note?.createdAt

  if (!value) return '尚無更新時間'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '尚無更新時間'

  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const saveName = () => {
  isEditingName.value = false

  const newName = editingName.value.trim() || '未命名星球'
  const oldName = props.planet?.name || '未命名星球'

  editingName.value = newName

  if (newName === oldName) return

  emit('save-name', newName)
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
</script>

<style scoped>
.planet-overlay {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background:
    radial-gradient(circle at 20% 18%, rgba(95, 160, 255, 0.08), transparent 28%),
    radial-gradient(circle at 82% 76%, rgba(112, 72, 255, 0.08), transparent 26%),
    rgba(2, 5, 14, 0.74);

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  z-index: 3000;
}

.planet-content-box.galaxy-planet-panel {
  position: relative;

  width: min(1100px, 88vw);
  height: min(680px, 82vh);

  padding: 42px 48px 64px;

  color: var(--galaxy-panel-text);

  background:
    radial-gradient(circle at 48% 20%, rgba(80, 150, 255, 0.08), transparent 22%),
    radial-gradient(circle at 70% 84%, rgba(75, 190, 255, 0.05), transparent 24%),
    linear-gradient(135deg, var(--galaxy-panel-bg-2), var(--galaxy-panel-bg-1) 52%, #060a16);

  border: 1px solid var(--galaxy-frame-main);
  border-radius: 8px;

  overflow: hidden;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    0 28px 90px rgba(0, 0, 0, 0.58),
    0 0 46px rgba(80, 180, 255, 0.1);

  --galaxy-panel-bg-1: rgba(8, 12, 26, 0.96);
  --galaxy-panel-bg-2: rgba(12, 24, 46, 0.9);
  --galaxy-panel-text: #d8e7ff;
  --galaxy-panel-heading: #f5f8ff;
  --galaxy-panel-muted: #7f98c8;
  --galaxy-accent: #69caff;
  --galaxy-accent-2: #a383ff;
  --galaxy-frame-main: rgba(156, 215, 255, 0.34);
  --galaxy-frame-soft: rgba(120, 190, 255, 0.16);
  --galaxy-frame-bright: rgba(215, 238, 255, 0.72);
  --galaxy-card-bg: rgba(7, 14, 32, 0.68);
  --galaxy-card-border: rgba(138, 203, 255, 0.26);
  --galaxy-card-border-hover: rgba(180, 224, 255, 0.7);
}

.galaxy-panel-edge,
.galaxy-panel-frame,
.galaxy-panel-grid,
.galaxy-panel-energy {
  position: absolute;
  pointer-events: none;
}

.galaxy-panel-edge {
  inset: 0;
  z-index: 1;

  border-radius: 8px;

  box-shadow:
    inset 5px 0 14px rgba(214, 235, 255, 0.07),
    inset -5px 0 14px rgba(214, 235, 255, 0.07),
    inset 0 5px 16px rgba(120, 190, 255, 0.05),
    inset 0 -5px 16px rgba(120, 190, 255, 0.05);
}

.galaxy-panel-frame {
  z-index: 2;
  border-radius: 6px;
}

.frame-outer {
  inset: 16px;
  border: 1px solid rgba(152, 216, 255, 0.18);
}

.frame-inner {
  inset: 26px;
  border: 1px solid rgba(152, 216, 255, 0.09);
}

.galaxy-panel-grid {
  inset: 0;
  z-index: 0;

  background-image:
    linear-gradient(rgba(130, 190, 255, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(130, 190, 255, 0.026) 1px, transparent 1px);

  background-size: 38px 38px;
  opacity: 0.7;
}

.galaxy-panel-energy {
  inset: 0;
  z-index: 1;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 42%,
      rgba(160, 224, 255, 0.045) 49%,
      rgba(225, 245, 255, 0.16) 50%,
      rgba(160, 224, 255, 0.045) 51%,
      transparent 58%,
      transparent 100%
    );

  transform: translateX(-100%);
  animation: galaxyScan 7s linear infinite;
}

@keyframes galaxyScan {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }

  18% {
    opacity: 1;
  }

  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

.galaxy-corner {
  position: absolute;
  z-index: 4;

  width: 42px;
  height: 42px;

  pointer-events: none;
}

.galaxy-corner::before,
.galaxy-corner::after {
  content: '';
  position: absolute;

  background: linear-gradient(90deg, var(--galaxy-frame-bright), var(--galaxy-accent));
  box-shadow: 0 0 12px rgba(100, 190, 255, 0.28);
}

.corner-tl {
  top: 22px;
  left: 22px;
}

.corner-tr {
  top: 22px;
  right: 22px;
}

.corner-bl {
  bottom: 22px;
  left: 22px;
}

.corner-br {
  right: 22px;
  bottom: 22px;
}

.corner-tl::before,
.corner-tr::before,
.corner-bl::before,
.corner-br::before {
  width: 34px;
  height: 2px;
}

.corner-tl::after,
.corner-tr::after,
.corner-bl::after,
.corner-br::after {
  width: 2px;
  height: 34px;
}

.corner-tl::before,
.corner-tr::before {
  top: 0;
}

.corner-bl::before,
.corner-br::before {
  bottom: 0;
}

.corner-tl::after,
.corner-bl::after {
  left: 0;
}

.corner-tr::after,
.corner-br::after {
  right: 0;
}

/* Header */

.galaxy-planet-header {
  position: relative;
  z-index: 8;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;

  margin-bottom: 36px;
}

.planet-title-area {
  min-width: 0;
}

.planet-title-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.planet-title-icon {
  width: 48px;
  height: 48px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--galaxy-accent);

  border: 1px solid rgba(130, 205, 255, 0.28);
  border-radius: 10px;

  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.18), transparent 34%),
    rgba(15, 31, 62, 0.72);

  box-shadow:
    inset 0 0 18px rgba(120, 200, 255, 0.08),
    0 0 20px rgba(80, 170, 255, 0.1);

  font-size: 1.3rem;
}

.planet-title-input {
  min-width: 320px;
  max-width: 620px;

  padding: 0;

  color: var(--galaxy-panel-heading);
  background: transparent;
  border: none;
  outline: none;

  font-family: 'Orbitron', 'Rajdhani', 'Inter', 'Noto Sans TC', sans-serif;
  font-size: clamp(1.5rem, 3.2vw, 3rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.08em;

  text-shadow:
    0 0 12px rgba(160, 220, 255, 0.18),
    0 0 28px rgba(120, 190, 255, 0.08);
}

.planet-title-input:hover,
.planet-title-input:focus {
  color: #ffffff;
}

.planet-title-input::placeholder {
  color: rgba(210, 225, 255, 0.38);
}

.planet-title-saving-hint {
  padding: 5px 9px;

  color: var(--galaxy-accent);
  border: 1px solid rgba(100, 200, 255, 0.18);
  border-radius: 4px;

  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  white-space: nowrap;
}

.planet-update-row {
  margin-top: 14px;
  margin-left: 66px;

  display: flex;
  align-items: center;
  gap: 14px;

  color: var(--galaxy-panel-muted);

  font-family: 'Rajdhani', 'Inter', 'Noto Sans TC', sans-serif;
  letter-spacing: 0.08em;
}

.planet-update-row span {
  color: var(--galaxy-accent);
  font-size: 0.72rem;
  font-weight: 900;
}

.planet-update-row strong {
  color: #b8c8e8;
  font-size: 0.82rem;
  font-weight: 800;
}

.planet-header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
}

.add-note-to-planet-btn {
  height: 46px;
  padding: 0 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 11px;

  color: #ddecff;
  background:
    linear-gradient(135deg, rgba(80, 105, 255, 0.56), rgba(42, 64, 150, 0.72));

  border: 1px solid rgba(168, 194, 255, 0.5);
  border-radius: 6px;

  font-family: 'Rajdhani', 'Inter', 'Noto Sans TC', sans-serif;
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.08em;

  cursor: pointer;

  box-shadow:
    inset 0 0 18px rgba(255, 255, 255, 0.05),
    0 0 22px rgba(100, 130, 255, 0.18);

  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease;
}

.add-note-to-planet-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(220, 235, 255, 0.78);
  filter: brightness(1.08);

  box-shadow:
    inset 0 0 22px rgba(255, 255, 255, 0.08),
    0 0 28px rgba(110, 145, 255, 0.3);
}

.close-overlay-btn {
  width: 46px;
  height: 46px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: #d9e6ff;
  background: rgba(255, 255, 255, 0.055);

  border: 1px solid rgba(170, 200, 235, 0.2);
  border-radius: 6px;

  cursor: pointer;

  font-size: 1.1rem;

  transition:
    transform 0.22s ease,
    color 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.close-overlay-btn:hover {
  color: #ffffff;
  background: rgba(255, 80, 120, 0.12);
  border-color: rgba(255, 130, 160, 0.44);
  transform: rotate(90deg);
  box-shadow: 0 0 18px rgba(255, 90, 130, 0.16);
}

/* Content */

.planet-notes-zone {
  position: relative;
  z-index: 6;

  height: calc(100% - 154px);
  padding: 32px 38px 40px;

  overflow-y: auto;
  overflow-x: hidden;

  border: 1px solid rgba(135, 205, 255, 0.2);
  border-radius: 6px;

  background:
    radial-gradient(circle at 50% 20%, rgba(80, 170, 255, 0.045), transparent 24%),
    rgba(2, 8, 20, 0.24);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    inset 0 0 40px rgba(80, 160, 255, 0.035);
}

.planet-notes-zone::before {
  content: '';

  position: absolute;
  inset: 16px;

  border: 1px dashed rgba(155, 215, 255, 0.11);
  border-radius: 4px;

  pointer-events: none;
}

.planet-notes-zone.is-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.planet-notes-grid-mode,
.planet-notes-list-mode {
  position: relative;
  z-index: 2;
}

.featured-notes-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;

  margin-bottom: 28px;
}

.rest-notes-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.inner-note-card {
  position: relative;

  min-width: 0;

  color: var(--galaxy-panel-text);
  background:
    radial-gradient(circle at 78% 20%, rgba(100, 180, 255, 0.07), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
    var(--galaxy-card-bg);

  border: 1px solid var(--galaxy-card-border);
  border-radius: 6px;

  overflow: hidden;

  cursor: pointer;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.024),
    0 14px 36px rgba(0, 0, 0, 0.28),
    0 0 18px rgba(80, 170, 255, 0.06);

  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease;
}

.inner-note-card::before,
.inner-note-card::after {
  content: '';

  position: absolute;
  pointer-events: none;
}

.inner-note-card::before {
  inset: 9px;

  border: 1px solid rgba(140, 205, 255, 0.07);
  border-radius: 4px;
}

.inner-note-card::after {
  left: 22px;
  right: 28px;
  bottom: 22px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      var(--galaxy-accent),
      rgba(120, 200, 255, 0.1),
      transparent
    );

  opacity: 0.72;
}

.inner-note-card:hover {
  transform: translateY(-5px);
  border-color: var(--galaxy-card-border-hover);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 18px 44px rgba(0, 0, 0, 0.34),
    0 0 24px rgba(100, 190, 255, 0.16);
}

.featured-note-card {
  min-height: 155px;
  padding: 22px 24px;
}

.compact-note-card {
  min-height: 138px;
  padding: 22px 22px;
}

.note-card-tags-line {
  min-height: 18px;
  margin-bottom: 12px;

  color: rgba(155, 205, 255, 0.92);

  font-family: 'Rajdhani', 'Noto Sans TC', 'Inter', sans-serif;
  font-size: clamp(0.72rem, 0.75vw, 0.86rem);
  font-weight: 700;
  letter-spacing: 0.08em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inner-note-card h4 {
  margin: 0 0 15px;

  color: var(--galaxy-panel-heading);

  font-family: 'Rajdhani', 'Noto Sans TC', 'Inter', sans-serif;
  font-size: clamp(1.25rem, 1.6vw, 1.8rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0.02em;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
  text-overflow: ellipsis;
}

.compact-note-card h4 {
  font-size: clamp(1.05rem, 1.35vw, 1.42rem);
  line-height: 1.12;
}

.note-update-time {
  margin-top: 10px;

  color: rgba(214, 226, 255, 0.88);

  font-family: 'Rajdhani', 'Noto Sans TC', 'Inter', sans-serif;
  font-size: clamp(0.78rem, 0.95vw, 1.02rem);
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: 0.02em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-card-footer-line {
  position: absolute;
  right: 26px;
  bottom: 22px;

  width: 58px;
  height: 6px;

  background:
    repeating-linear-gradient(
      90deg,
      var(--galaxy-accent) 0 8px,
      transparent 8px 14px
    );

  opacity: 0.6;
}

/* List Mode */

.planet-notes-zone.is-list-view {
  padding: 18px 20px 28px;
}

.planet-notes-list-mode {
  width: 100%;
}

.note-list-header {
  height: 42px;
  padding: 0 18px;

  display: grid;
  grid-template-columns: minmax(240px, 1.35fr) minmax(220px, 1fr) 190px;
  gap: 18px;
  align-items: center;

  color: rgba(160, 190, 230, 0.78);
  border-bottom: 1px solid rgba(140, 205, 255, 0.16);

  font-size: 0.76rem;
  font-weight: 950;
  letter-spacing: 0.12em;
}

.note-list-row {
  min-height: 76px;
  padding: 12px 18px;

  display: grid;
  grid-template-columns: minmax(240px, 1.35fr) minmax(220px, 1fr) 190px;
  gap: 18px;
  align-items: center;

  color: var(--galaxy-panel-text);
  border-bottom: 1px solid rgba(140, 205, 255, 0.1);

  cursor: pointer;

  transition:
    background 0.18s ease,
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.note-list-row:hover {
  background:
    linear-gradient(
      90deg,
      rgba(105, 202, 255, 0.08),
      rgba(120, 140, 255, 0.045),
      transparent
    );

  border-color: rgba(140, 205, 255, 0.2);
  transform: translateX(3px);
  box-shadow: inset 3px 0 0 rgba(105, 202, 255, 0.72);
}

.note-list-name {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 14px;
}

.note-list-icon {
  width: 42px;
  height: 42px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--galaxy-accent);
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.18), transparent 34%),
    rgba(15, 31, 62, 0.72);

  border: 1px solid rgba(130, 205, 255, 0.22);
  border-radius: 10px;

  box-shadow:
    inset 0 0 16px rgba(120, 200, 255, 0.06),
    0 0 16px rgba(80, 170, 255, 0.08);
}

.note-list-title-wrap {
  min-width: 0;
}

.note-list-title-wrap small {
  display: block;

  margin-bottom: 4px;

  color: var(--galaxy-accent);
  font-family: 'Rajdhani', 'Inter', 'Noto Sans TC', sans-serif;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-list-title-wrap strong {
  display: block;

  color: var(--galaxy-panel-heading);

  font-size: 1rem;
  font-weight: 900;
  line-height: 1.25;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-list-preview {
  min-width: 0;

  color: #9fb0d0;

  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.5;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-list-time {
  color: rgba(210, 225, 255, 0.72);

  font-size: 0.82rem;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}

.inline-tag-trigger {
  width: 100%;
  max-width: 100%;

  padding: 0;

  display: inline-flex;
  align-items: center;
  gap: 6px;

  color: rgba(155, 205, 255, 0.92);
  background: transparent;
  border: none;

  font-family: 'Rajdhani', 'Noto Sans TC', 'Inter', sans-serif;
  font-size: inherit;
  font-weight: 750;
  letter-spacing: 0.08em;

  cursor: text;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inline-tag-trigger:hover {
  color: #ffffff;
  text-shadow: 0 0 12px rgba(105, 202, 255, 0.24);
}

.inline-tag-trigger i {
  font-size: 0.72rem;
}

.inline-tag-input {
  width: 100%;
  height: 34px;

  padding: 0 16px 0 34px;

  color: #ddecff;
  background:
    linear-gradient(
      135deg,
      rgba(105, 202, 255, 0.08),
      rgba(126, 94, 255, 0.08)
    ),
    rgba(5, 10, 24, 0.72);

  border: 1px solid rgba(150, 205, 255, 0.28);
  border-radius: 999px;

  outline: none;

  font-family: 'Rajdhani', 'Noto Sans TC', 'Inter', sans-serif;
  font-size: clamp(0.76rem, 0.85vw, 0.9rem);
  font-weight: 800;
  letter-spacing: 0.06em;

  caret-color: var(--galaxy-accent);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    inset 0 0 22px rgba(105, 202, 255, 0.055),
    0 0 0 1px rgba(126, 94, 255, 0.08),
    0 0 18px rgba(105, 202, 255, 0.08);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.inline-tag-input::placeholder {
  color: rgba(197, 205, 235, 0.56);
  font-weight: 800;
}

.inline-tag-input:focus {
  color: #ffffff;

  background:
    radial-gradient(circle at 12% 50%, rgba(105, 202, 255, 0.18), transparent 22%),
    linear-gradient(
      135deg,
      rgba(105, 202, 255, 0.12),
      rgba(126, 94, 255, 0.14)
    ),
    rgba(6, 12, 30, 0.9);

  border-color: rgba(160, 220, 255, 0.72);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    inset 0 0 28px rgba(105, 202, 255, 0.1),
    0 0 0 3px rgba(126, 94, 255, 0.16),
    0 0 22px rgba(105, 202, 255, 0.28),
    0 0 42px rgba(126, 94, 255, 0.18);
}

.note-card-tags-line {
  position: relative;
}

.note-card-tags-line:has(.inline-tag-input)::before {
  content: '+';

  position: absolute;
  left: 15px;
  top: 50%;
  z-index: 2;

  transform: translateY(-50%);

  color: var(--galaxy-accent);

  font-family: 'Rajdhani', 'Inter', sans-serif;
  font-size: 1.05rem;
  font-weight: 900;

  text-shadow:
    0 0 8px rgba(105, 202, 255, 0.5),
    0 0 18px rgba(126, 94, 255, 0.32);

  pointer-events: none;
}

.note-card-tags-line:has(.inline-tag-input)::after {
  content: '';

  position: absolute;
  left: 28px;
  top: 50%;
  z-index: 2;

  width: 1px;
  height: 18px;

  transform: translateY(-50%);

  background: linear-gradient(
    180deg,
    transparent,
    rgba(160, 220, 255, 0.72),
    transparent
  );

  box-shadow: 0 0 10px rgba(105, 202, 255, 0.42);

  pointer-events: none;
}

.inline-tag-input.list {
  height: 28px;
  max-width: 220px;
  padding-left: 10px;

  font-size: 0.7rem;
}

.inline-tag-trigger.list {
  font-size: 0.7rem;
  padding-bottom: 2px;
}

/* Empty State */

.galaxy-empty-state {
  position: relative;
  z-index: 2;

  width: 100%;
  min-height: 340px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22px;

  color: var(--galaxy-panel-muted);
  text-align: center;

  background: transparent;
  border: none;
  border-radius: 0;
}

.empty-state-icon {
  width: 74px;
  height: 74px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--galaxy-accent);

  border: 1px solid rgba(140, 210, 255, 0.22);
  border-radius: 10px;

  background:
    radial-gradient(circle at center, rgba(100, 190, 255, 0.16), transparent 62%),
    rgba(8, 18, 40, 0.68);

  box-shadow:
    inset 0 0 24px rgba(120, 200, 255, 0.08),
    0 0 24px rgba(80, 180, 255, 0.12);

  font-size: 1.45rem;
}

.empty-state p {
  margin: 0;

  color: var(--galaxy-panel-heading);

  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.06em;

  text-shadow: 0 0 18px rgba(160, 220, 255, 0.18);
}

.empty-add-note-btn {
  height: 52px;
  padding: 0 34px;

  display: inline-flex;
  align-items: center;
  gap: 11px;

  color: #ddecff;
  background:
    linear-gradient(135deg, rgba(50, 130, 255, 0.62), rgba(38, 78, 160, 0.82));

  border: 1px solid rgba(160, 220, 255, 0.48);
  border-radius: 6px;

  font-family: 'Rajdhani', 'Inter', 'Noto Sans TC', sans-serif;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.08em;

  cursor: pointer;

  box-shadow:
    inset 0 0 18px rgba(255, 255, 255, 0.05),
    0 0 24px rgba(90, 180, 255, 0.18);

  transition:
    transform 0.22s ease,
    filter 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.empty-add-note-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
  border-color: rgba(225, 245, 255, 0.74);
  box-shadow:
    inset 0 0 22px rgba(255, 255, 255, 0.08),
    0 0 30px rgba(90, 180, 255, 0.26);
}

/* Footer */

.planet-panel-footer {
  position: absolute;
  left: 64px;
  right: 64px;
  bottom: 28px;
  z-index: 8;

  height: 42px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 18px;

  color: var(--galaxy-panel-muted);

  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
    rgba(3, 8, 18, 0.66);

  border: 1px solid rgba(140, 205, 255, 0.18);
  border-radius: 4px;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.018),
    0 0 18px rgba(80, 170, 255, 0.055);
}

.planet-footer-stats {
  display: flex;
  align-items: center;
  gap: 24px;

  font-family: 'Rajdhani', 'Inter', 'Noto Sans TC', sans-serif;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.planet-footer-stats span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.planet-footer-stats i {
  color: var(--galaxy-accent);
}

.planet-view-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.planet-view-switch > span {
  margin-right: 8px;

  color: var(--galaxy-panel-muted);

  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.planet-view-switch button {
  width: 32px;
  height: 32px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: #91a5ce;
  background: rgba(255, 255, 255, 0.04);

  border: 1px solid rgba(150, 200, 255, 0.14);
  border-radius: 4px;

  cursor: pointer;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.planet-view-switch button:hover,
.planet-view-switch button.active {
  color: #ffffff;
  background: rgba(90, 140, 255, 0.22);
  border-color: rgba(170, 210, 255, 0.42);
  box-shadow: 0 0 16px rgba(100, 180, 255, 0.16);
}

/* RWD */

@media (max-width: 1180px) {
  .planet-content-box.galaxy-planet-panel {
    padding: 42px 36px 72px;
  }

  .featured-notes-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rest-notes-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .note-list-header,
  .note-list-row {
    grid-template-columns: minmax(220px, 1.2fr) minmax(180px, 1fr) 170px;
  }

  .planet-panel-footer {
    left: 36px;
    right: 36px;
  }
}

@media (max-width: 900px) {
  .planet-overlay {
    padding: 14px;
  }

  .planet-content-box.galaxy-planet-panel {
    width: 96vw;
    height: 90vh;
    padding: 34px 22px 78px;
  }

  .galaxy-planet-header {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
  }

  .planet-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .planet-title-input {
    min-width: 0;
    max-width: 100%;
    font-size: 2rem;
  }

  .planet-update-row {
    margin-left: 0;
  }

  .planet-notes-zone {
    height: calc(100% - 138px);
    padding: 24px 28px 34px;
  }

  .featured-notes-row,
  .rest-notes-grid {
    grid-template-columns: 1fr;
  }

  .planet-notes-zone.is-list-view {
    padding: 12px 12px 28px;
  }

  .note-list-header {
    display: none;
  }

  .note-list-row {
    min-height: 82px;
    padding: 14px 12px;

    grid-template-columns: 1fr;
    gap: 8px;
  }

  .note-list-time {
    text-align: left;
    padding-left: 56px;
  }

  .note-list-preview {
    padding-left: 56px;
  }

  .planet-panel-footer {
    left: 22px;
    right: 22px;
    bottom: 24px;
  }
}

@media (max-width: 620px) {
  .planet-panel-footer {
    height: auto;
    min-height: 54px;

    flex-direction: column;
    align-items: stretch;
    gap: 10px;

    padding: 10px 12px;
  }

  .planet-footer-stats {
    justify-content: space-between;
    gap: 12px;
  }

  .planet-view-switch {
    justify-content: flex-end;
  }

  .note-list-icon {
    width: 38px;
    height: 38px;
  }

  .note-list-title-wrap strong {
    font-size: 0.95rem;
  }

  .note-list-preview,
  .note-list-time {
    padding-left: 52px;
    font-size: 0.8rem;
  }
}
</style>