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
  z-index: 3000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background:
    radial-gradient(circle at 20% 18%, rgba(143, 124, 255, 0.1), transparent 28%),
    radial-gradient(circle at 82% 76%, rgba(81, 186, 252, 0.06), transparent 26%),
    rgba(2, 5, 14, 0.76);

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
}

.planet-content-box.galaxy-planet-panel {
  position: relative;

  width: min(1100px, 88vw);
  height: min(680px, 82vh);

  padding: 42px 48px 64px;

  color: var(--profile-text);
  background:
    radial-gradient(circle at 48% 20%, var(--profile-accent-soft), transparent 22%),
    radial-gradient(circle at 70% 84%, rgba(81, 186, 252, 0.05), transparent 24%),
    var(--profile-panel-bg);

  border: 1px solid var(--profile-panel-border);
  border-radius: 8px;

  overflow: hidden;

  box-shadow: var(--profile-shadow-lg);
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
    inset 5px 0 14px rgba(255, 255, 255, 0.035),
    inset -5px 0 14px rgba(255, 255, 255, 0.035),
    inset 0 5px 16px rgba(143, 124, 255, 0.045),
    inset 0 -5px 16px rgba(143, 124, 255, 0.045);
}

.galaxy-panel-frame {
  z-index: 2;
  border-radius: 6px;
}

.frame-outer {
  inset: 16px;
  border: 1px solid var(--profile-panel-border);
}

.frame-inner {
  inset: 26px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.galaxy-panel-grid {
  inset: 0;
  z-index: 0;
  background-image:
    linear-gradient(rgba(143, 124, 255, 0.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.024) 1px, transparent 1px);
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
      rgba(143, 124, 255, 0.045) 49%,
      rgba(255, 255, 255, 0.12) 50%,
      rgba(81, 186, 252, 0.04) 51%,
      transparent 58%,
      transparent 100%
    );
  transform: translateX(-100%);
  animation: galaxyScan 7s linear infinite;
}

@keyframes galaxyScan {
  0% { transform: translateX(-100%); opacity: 0; }
  18% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
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
  background: linear-gradient(90deg, var(--profile-accent-border), var(--accent-color));
  box-shadow: 0 0 12px rgba(143, 124, 255, 0.22);
}

.corner-tl { top: 22px; left: 22px; }
.corner-tr { top: 22px; right: 22px; }
.corner-bl { bottom: 22px; left: 22px; }
.corner-br { right: 22px; bottom: 22px; }

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
.corner-tr::before { top: 0; }
.corner-bl::before,
.corner-br::before { bottom: 0; }
.corner-tl::after,
.corner-bl::after { left: 0; }
.corner-tr::after,
.corner-br::after { right: 0; }

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

  color: var(--accent-color);
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.12), transparent 34%),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-accent-border);
  border-radius: 10px;

  box-shadow:
    inset 0 0 18px var(--profile-accent-soft),
    0 0 20px rgba(143, 124, 255, 0.1);

  font-size: 1.3rem;
}

.planet-title-input {
  min-width: 320px;
  max-width: 620px;

  padding: 0;

  color: var(--profile-heading);
  background: transparent;
  border: none;
  outline: none;

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: clamp(1.5rem, 3.2vw, 3rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.08em;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.14),
    0 0 28px rgba(143, 124, 255, 0.12);
}

.planet-title-input:hover,
.planet-title-input:focus {
  color: var(--accent-text);
}

.planet-title-input::placeholder {
  color: var(--profile-muted-soft);
}

.planet-title-saving-hint {
  padding: 5px 9px;

  color: var(--accent-color);
  border: 1px solid var(--profile-accent-border);
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

  color: var(--profile-muted);
  letter-spacing: 0.08em;
}

.planet-update-row span {
  color: var(--accent-color);
  font-size: 0.72rem;
  font-weight: 900;
}

.planet-update-row strong {
  color: var(--profile-muted);
  font-size: 0.82rem;
  font-weight: 800;
}

.planet-header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
}

.add-note-to-planet-btn,
.empty-add-note-btn {
  height: 46px;
  padding: 0 22px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 11px;

  color: var(--profile-button-text);
  background: var(--profile-button-bg);

  border: 1px solid var(--profile-accent-border);
  border-radius: 6px;

  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 900;
  letter-spacing: 0.08em;

  cursor: pointer;

  box-shadow:
    inset 0 0 18px rgba(255, 255, 255, 0.04),
    0 0 22px rgba(143, 124, 255, 0.18);

  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease;
}

.add-note-to-planet-btn:hover,
.empty-add-note-btn:hover {
  transform: translateY(-2px);
  border-color: var(--accent-border);
  filter: brightness(1.05);
  box-shadow:
    inset 0 0 22px rgba(255, 255, 255, 0.06),
    0 0 28px rgba(143, 124, 255, 0.24);
}

.close-overlay-btn {
  width: 46px;
  height: 46px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--profile-text);
  background: var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
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
  color: var(--danger-color);
  background: var(--danger-bg);
  border-color: rgba(255, 119, 119, 0.42);
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

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  background:
    radial-gradient(circle at 50% 20%, var(--profile-accent-soft), transparent 24%),
    rgba(2, 8, 20, 0.24);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.02),
    inset 0 0 40px rgba(143, 124, 255, 0.04);
}

.planet-notes-zone::before {
  content: '';
  position: absolute;
  inset: 16px;
  border: 1px dashed rgba(165, 140, 255, 0.12);
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

  color: var(--profile-text);
  background:
    radial-gradient(circle at 78% 20%, var(--profile-accent-soft), transparent 30%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  overflow: hidden;
  cursor: pointer;

  box-shadow: var(--profile-shadow-sm);

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
  border: 1px solid rgba(165, 140, 255, 0.08);
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
      var(--accent-color),
      rgba(81, 186, 252, 0.1),
      transparent
    );
  opacity: 0.72;
}

.inner-note-card:hover {
  transform: translateY(-5px);
  border-color: var(--profile-accent-border);
  box-shadow: var(--profile-shadow-md);
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
  position: relative;
  min-height: 18px;
  margin-bottom: 12px;

  color: var(--tag-text);

  font-size: clamp(0.72rem, 0.75vw, 0.86rem);
  font-weight: 700;
  letter-spacing: 0.08em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inner-note-card h4 {
  margin: 0 0 15px;

  color: var(--profile-heading);

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

  color: var(--profile-muted);

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
      var(--accent-color) 0 8px,
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

  color: var(--profile-muted);
  border-bottom: 1px solid var(--profile-panel-border);

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

  color: var(--profile-text);
  border-bottom: 1px solid var(--profile-panel-border);

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
      rgba(143, 124, 255, 0.1),
      rgba(81, 186, 252, 0.045),
      transparent
    );
  border-color: var(--profile-accent-border);
  transform: translateX(3px);
  box-shadow: inset 3px 0 0 var(--accent-color);
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

  color: var(--accent-color);
  background: var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 10px;
}

.note-list-title-wrap {
  min-width: 0;
}

.note-list-title-wrap small {
  display: block;

  margin-bottom: 4px;

  color: var(--accent-color);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-list-title-wrap strong {
  display: block;

  color: var(--profile-heading);

  font-size: 1rem;
  font-weight: 900;
  line-height: 1.25;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-list-preview {
  min-width: 0;

  color: var(--profile-muted);

  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.5;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-list-time {
  color: var(--profile-muted);

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

  color: var(--tag-text);
  background: transparent;
  border: none;

  font-family: inherit;
  font-size: inherit;
  font-weight: 750;
  letter-spacing: 0.08em;

  cursor: text;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inline-tag-trigger:hover {
  color: var(--profile-heading);
  text-shadow: 0 0 12px rgba(143, 124, 255, 0.24);
}

.inline-tag-trigger i {
  font-size: 0.72rem;
}

.inline-tag-input {
  width: 100%;
  height: 34px;

  padding: 0 16px 0 34px;

  color: var(--profile-text);
  background:
    linear-gradient(
      135deg,
      rgba(143, 124, 255, 0.08),
      rgba(81, 186, 252, 0.06)
    ),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-accent-border);
  border-radius: 999px;

  outline: none;

  font-family: inherit;
  font-size: clamp(0.76rem, 0.85vw, 0.9rem);
  font-weight: 800;
  letter-spacing: 0.06em;

  caret-color: var(--accent-color);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    0 0 18px rgba(143, 124, 255, 0.08);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.inline-tag-input::placeholder {
  color: var(--profile-muted-soft);
  font-weight: 800;
}

.inline-tag-input:focus {
  color: var(--profile-heading);
  border-color: var(--accent-border);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    0 0 0 3px var(--profile-accent-soft),
    0 0 22px rgba(143, 124, 255, 0.2);
}

.note-card-tags-line:has(.inline-tag-input)::before {
  content: '+';

  position: absolute;
  left: 15px;
  top: 50%;
  z-index: 2;

  transform: translateY(-50%);

  color: var(--accent-color);

  font-size: 1.05rem;
  font-weight: 900;

  text-shadow:
    0 0 8px rgba(143, 124, 255, 0.5),
    0 0 18px rgba(81, 186, 252, 0.25);

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
    var(--profile-accent-border),
    transparent
  );

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

  color: var(--profile-muted);
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

  color: var(--accent-color);
  background: var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 10px;

  box-shadow:
    inset 0 0 24px var(--profile-accent-soft),
    0 0 24px rgba(143, 124, 255, 0.12);

  font-size: 1.45rem;
}

.empty-state p {
  margin: 0;

  color: var(--profile-heading);

  font-size: 1.5rem;
  font-weight: 900;
  letter-spacing: 0.06em;

  text-shadow: 0 0 18px rgba(143, 124, 255, 0.18);
}

.empty-add-note-btn {
  height: 52px;
  padding: 0 34px;
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

  color: var(--profile-muted);

  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01)),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 4px;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.018),
    0 0 18px rgba(143, 124, 255, 0.06);
}

.planet-footer-stats {
  display: flex;
  align-items: center;
  gap: 24px;

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
  color: var(--accent-color);
}

.planet-view-switch {
  display: flex;
  align-items: center;
  gap: 8px;
}

.planet-view-switch > span {
  margin-right: 8px;

  color: var(--profile-muted);

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

  color: var(--profile-muted);
  background: rgba(255, 255, 255, 0.04);

  border: 1px solid var(--profile-panel-border);
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
  color: var(--profile-heading);
  background: var(--profile-menu-hover-bg);
  border-color: var(--profile-accent-border);
  box-shadow: 0 0 16px rgba(143, 124, 255, 0.16);
}

/* Scrollbar */

.planet-notes-zone::-webkit-scrollbar {
  width: 8px;
}

.planet-notes-zone::-webkit-scrollbar-thumb {
  background: var(--profile-accent-border);
  border-radius: 999px;
}

.planet-notes-zone::-webkit-scrollbar-track {
  background: transparent;
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

  .note-list-time,
  .note-list-preview {
    text-align: left;
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
