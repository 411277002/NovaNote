<template>
  <aside
    v-if="note"
    class="card-preview-panel"
    @mousedown.stop
  >
    <div class="preview-header">
      <div class="preview-title-group">
        <span class="preview-type-icon">
          <i class="fa-solid fa-puzzle-piece"></i>
        </span>

        <div class="preview-title-text">
          <p class="preview-kicker">卡片預覽</p>
          <h2>{{ note.title || '無標題卡片' }}</h2>
        </div>
      </div>

      <button class="preview-close-btn" @click="$emit('close')">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <section class="preview-meta-grid">
      <div class="preview-meta-item">
        <span class="meta-label">所屬星球</span>
        <strong>{{ planetName || '漂浮碎片' }}</strong>
      </div>

      <div class="preview-meta-item">
        <span class="meta-label">標籤數</span>
        <strong>{{ note.tags?.length || 0 }}</strong>
      </div>

      <div class="preview-meta-item">
        <span class="meta-label">連結數</span>
        <strong>{{ linkedItems.length }}</strong>
      </div>
    </section>

    <section class="preview-section" v-if="note.tags?.length">
      <h3>標籤</h3>

      <div class="preview-tags">
        <button
          v-for="tag in note.tags"
          :key="tag"
          class="preview-tag"
          type="button"
          @click="$emit('filter-tag', tag)"
        >
          # {{ tag }}
        </button>
      </div>
    </section>

    <section class="preview-section" v-if="linkedItems.length">
      <h3>相關連結</h3>

      <div class="preview-link-list">
        <button
          v-for="item in linkedItems"
          :key="item.key"
          class="preview-link-item"
          type="button"
          @click="$emit('focus-linked-item', item)"
        >
          <span class="preview-link-icon">
            <i
              v-if="item.type === 'planet'"
              class="fa-solid fa-globe"
            ></i>
            <i
              v-else-if="item.type === 'note'"
              class="fa-solid fa-puzzle-piece"
            ></i>
            <i
              v-else
              class="fa-solid fa-link"
            ></i>
          </span>

          <span class="preview-link-name">
            {{ item.name }}
          </span>
        </button>
      </div>
    </section>

    <section class="preview-section" v-else>
      <h3>相關連結</h3>

      <div class="preview-empty compact">
        尚未與其他卡片或星球建立連結。
      </div>
    </section>

    <div class="preview-actions">
      <button class="secondary-preview-btn" @click="$emit('close')">
        關閉
      </button>

      <button class="primary-preview-btn" @click="$emit('open-editor', note)">
        <i class="fa-solid fa-pen-to-square"></i>
        開啟編輯
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  note: {
    type: Object,
    default: null
  },
  planetName: {
    type: String,
    default: ''
  },
  linkedItems: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'close',
  'open-editor',
  'filter-tag',
  'focus-linked-item'
])

const plainText = computed(() => {
  if (!props.note?.content) return ''

  const div = document.createElement('div')
  div.innerHTML = props.note.content

  const text = div.textContent || div.innerText || ''

  return text.trim().slice(0, 260)
})
</script>

<style scoped>
.card-preview-panel {
  position: fixed;
  right: 28px;
  top: 88px;
  bottom: 28px;

  width: min(410px, calc(100vw - 56px));

  display: flex;
  flex-direction: column;

  padding: 24px;

  color: var(--profile-text);
  background:
    radial-gradient(circle at 72% 12%, var(--profile-accent-soft), transparent 28%),
    radial-gradient(circle at 18% 82%, rgba(81, 186, 252, 0.055), transparent 30%),
    var(--profile-panel-bg);

  border: 1px solid var(--profile-panel-border);
  border-radius: 8px;

  box-shadow:
    var(--profile-shadow-lg),
    0 0 28px rgba(143, 124, 255, 0.12);

  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);

  overflow: hidden;

  z-index: 2800;
  animation: previewIn 0.22s ease;

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
}

/* 背景格線 */
.card-preview-panel::before {
  content: '';

  position: absolute;
  inset: 0;
  z-index: 0;

  background-image:
    linear-gradient(rgba(143, 124, 255, 0.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.026) 1px, transparent 1px);

  background-size: 32px 32px;

  pointer-events: none;
}

/* 掃描光 */
.card-preview-panel::after {
  content: '';

  position: absolute;
  inset: 0;
  z-index: 1;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 42%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 58%,
      transparent 100%
    );

  transform: translateX(-120%);

  animation: previewScan 7s linear infinite;
  pointer-events: none;
}

@keyframes previewScan {
  0% {
    transform: translateX(-120%);
    opacity: 0;
  }

  18% {
    opacity: 0.5;
  }

  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}

.card-preview-panel > * {
  position: relative;
  z-index: 5;
}

/* 四角 HUD 線條 */
.preview-header::before,
.preview-header::after,
.preview-actions::before,
.preview-actions::after {
  content: '';
  position: absolute;
  width: 28px;
  height: 2px;

  background:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.72),
      var(--accent-color)
    );

  box-shadow: 0 0 12px rgba(143, 124, 255, 0.34);
  pointer-events: none;
}

.preview-header::before {
  top: -12px;
  left: -10px;
}

.preview-header::after {
  top: -12px;
  right: -10px;
}

.preview-actions::before {
  bottom: -12px;
  left: -10px;
}

.preview-actions::after {
  bottom: -12px;
  right: -10px;
}

/* =========================
   Header
========================= */

.preview-header {
  position: relative;

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;

  margin-bottom: 22px;
  padding-bottom: 18px;

  border-bottom: 1px solid var(--profile-panel-border);
}

.preview-title-group {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 14px;
}

.preview-type-icon {
  position: relative;

  width: 46px;
  height: 46px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--accent-color);

  background:
    radial-gradient(circle at 50% 22%, var(--profile-accent-soft), transparent 58%),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  box-shadow:
    inset 0 0 18px rgba(143, 124, 255, 0.06),
    0 0 18px rgba(143, 124, 255, 0.18);

  clip-path: polygon(
    10px 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% calc(100% - 10px),
    calc(100% - 10px) 100%,
    10px 100%,
    0 calc(100% - 10px),
    0 10px
  );
}

.preview-type-icon::after {
  content: '';

  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 7px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--accent-color),
      transparent
    );

  opacity: 0.68;
}

.preview-title-text {
  min-width: 0;
}

.preview-kicker {
  margin: 0 0 5px;

  color: var(--profile-accent);

  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.preview-title-text h2 {
  margin: 0;

  color: var(--profile-heading);

  font-size: 1.22rem;
  line-height: 1.25;
  font-weight: 900;
  letter-spacing: 0.04em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.2),
    0 0 28px rgba(143, 124, 255, 0.2);
}

.preview-close-btn {
  width: 38px;
  height: 38px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--profile-text);
  background: var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  cursor: pointer;

  font-family: inherit;

  transition:
    transform 0.22s ease,
    background 0.22s ease,
    border-color 0.22s ease,
    color 0.22s ease,
    box-shadow 0.22s ease;
}

.preview-close-btn:hover {
  transform: rotate(90deg);
  color: #ffffff;
  background: var(--danger-bg);
  border-color: var(--danger-color);
  box-shadow: 0 0 18px rgba(255, 90, 130, 0.16);
}

/* =========================
   Meta
========================= */

.preview-meta-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  margin-bottom: 22px;
}

.preview-meta-item {
  position: relative;

  min-width: 0;

  padding: 12px 10px 11px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.035),
      rgba(255, 255, 255, 0.012)
    ),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  overflow: hidden;
}

.preview-meta-item::after {
  content: '';

  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 6px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      var(--accent-color),
      transparent
    );

  opacity: 0.45;
}

.meta-label {
  display: block;
  margin-bottom: 6px;

  color: var(--profile-muted);

  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preview-meta-item strong {
  display: block;

  color: var(--profile-heading);

  font-size: 0.82rem;
  font-weight: 900;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================
   Sections
========================= */

.preview-section {
  margin-bottom: 22px;
}

.preview-section h3 {
  position: relative;

  margin: 0 0 12px;
  padding-left: 12px;

  color: var(--profile-heading);

  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.preview-section h3::before {
  content: '';

  position: absolute;
  left: 0;
  top: 50%;

  width: 4px;
  height: 14px;

  transform: translateY(-50%);

  background: linear-gradient(180deg, var(--accent-color), var(--link-color));
  box-shadow: 0 0 10px rgba(143, 124, 255, 0.34);
  border-radius: 999px;
}

/* =========================
   Tags
========================= */

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  position: relative;

  padding: 6px 10px;

  color: var(--tag-text);
  background: var(--tag-bg);

  border: 1px solid var(--tag-border);
  border-radius: 4px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.04em;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.preview-tag:hover {
  color: var(--profile-heading);
  background: var(--profile-accent-soft);
  border-color: var(--profile-accent-border);
  box-shadow: 0 0 14px rgba(143, 124, 255, 0.2);
  transform: translateY(-1px);
}

/* =========================
   Empty
========================= */

.preview-empty {
  padding: 18px 16px;

  color: var(--profile-muted);
  text-align: center;
  line-height: 1.7;
  font-size: 0.88rem;
  font-weight: 750;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.035),
      rgba(255, 255, 255, 0.012)
    ),
    var(--profile-panel-bg-soft);

  border: 1px dashed var(--profile-panel-border);
  border-radius: 6px;
}

.preview-empty.compact {
  padding: 14px;
}

/* =========================
   Links
========================= */

.preview-link-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-link-item {
  position: relative;

  width: 100%;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 10px 12px;

  color: var(--profile-text);
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.035),
      rgba(255, 255, 255, 0.012)
    ),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 6px;

  cursor: pointer;
  text-align: left;

  font-family: inherit;

  overflow: hidden;

  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.preview-link-item::after {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 42%,
      rgba(255, 255, 255, 0.12) 50%,
      transparent 58%,
      transparent 100%
    );

  transform: translateX(-120%);
  opacity: 0;

  transition:
    transform 0.55s ease,
    opacity 0.18s ease;

  pointer-events: none;
}

.preview-link-item:hover {
  transform: translateY(-2px);
  border-color: var(--profile-accent-border);
  background: var(--profile-menu-hover-bg);
  box-shadow: 0 0 16px rgba(143, 124, 255, 0.18);
}

.preview-link-item:hover::after {
  opacity: 1;
  transform: translateX(120%);
}

.preview-link-icon {
  width: 30px;
  height: 30px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--accent-color);
  background: var(--profile-accent-soft);

  border: 1px solid var(--profile-accent-border);
  border-radius: 5px;

  box-shadow: inset 0 0 14px rgba(143, 124, 255, 0.04);
}

.preview-link-name {
  flex: 1;
  min-width: 0;

  font-weight: 850;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================
   Actions
========================= */

.preview-actions {
  position: relative;

  margin-top: auto;
  padding-top: 18px;

  display: flex;
  gap: 10px;

  border-top: 1px solid var(--profile-panel-border);
}

.secondary-preview-btn,
.primary-preview-btn {
  position: relative;

  flex: 1;
  height: 44px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  font-family: inherit;
  font-weight: 900;
  letter-spacing: 0.04em;

  border-radius: 6px;

  cursor: pointer;

  overflow: hidden;

  transition:
    transform 0.2s ease,
    filter 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.secondary-preview-btn {
  color: var(--profile-text);
  background: var(--profile-panel-bg-soft);
  border: 1px solid var(--profile-panel-border);
}

.secondary-preview-btn:hover {
  background: var(--profile-menu-hover-bg);
  border-color: var(--profile-accent-border);
  transform: translateY(-1px);
}

.primary-preview-btn {
  color: var(--profile-button-text);
  background: var(--profile-button-bg);

  border: 1px solid var(--profile-accent-border);

  box-shadow:
    inset 0 0 22px rgba(255, 255, 255, 0.08),
    0 0 22px rgba(143, 124, 255, 0.18);
}

.primary-preview-btn::after {
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
  transition: transform 0.7s ease;
}

.primary-preview-btn:hover {
  filter: brightness(1.06);
  transform: translateY(-2px);
  border-color: var(--accent-border);

  box-shadow:
    inset 0 0 26px rgba(255, 255, 255, 0.1),
    0 0 30px rgba(143, 124, 255, 0.26);
}

.primary-preview-btn:hover::after {
  transform: translateX(120%);
}

.primary-preview-btn > * {
  position: relative;
  z-index: 2;
}

/* =========================
   Animation / RWD
========================= */

@keyframes previewIn {
  from {
    opacity: 0;
    transform: translateX(22px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@media (max-width: 980px) {
  .card-preview-panel {
    left: 22px;
    right: 22px;
    width: auto;
  }
}

@media (max-width: 560px) {
  .card-preview-panel {
    top: 74px;
    bottom: 18px;
    left: 14px;
    right: 14px;

    width: auto;

    padding: 20px;
  }

  .preview-meta-grid {
    grid-template-columns: 1fr;
  }

  .preview-actions {
    flex-direction: column;
  }
}
</style>