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

  color: var(--preview-text);

  background:
    radial-gradient(circle at 72% 12%, rgba(105, 202, 255, 0.09), transparent 28%),
    radial-gradient(circle at 18% 82%, rgba(159, 140, 255, 0.08), transparent 30%),
    linear-gradient(
      145deg,
      var(--preview-bg-strong),
      var(--preview-bg)
    );

  border: 1px solid var(--preview-border);
  border-radius: 8px;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 34px rgba(105, 150, 255, 0.14),
    0 24px 70px rgba(0, 0, 0, 0.42);

  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);

  overflow: hidden;

  z-index: 2800;
  animation: previewIn 0.22s ease;

  --preview-bg: rgba(6, 10, 24, 0.94);
  --preview-bg-strong: rgba(13, 20, 42, 0.96);
  --preview-surface: rgba(10, 18, 40, 0.7);
  --preview-surface-soft: rgba(255, 255, 255, 0.045);
  --preview-surface-hover: rgba(36, 52, 105, 0.72);

  --preview-text: #dce9ff;
  --preview-heading: #f6f8ff;
  --preview-muted: #7f98c8;

  --preview-accent: #69caff;
  --preview-accent-2: #9f8cff;
  --preview-danger: #ff8fa8;

  --preview-border: rgba(150, 205, 255, 0.28);
  --preview-border-soft: rgba(140, 190, 255, 0.16);
  --preview-border-strong: rgba(210, 235, 255, 0.58);

  --preview-glow: rgba(105, 202, 255, 0.24);
}

:global(html[data-theme='light']) .card-preview-panel {
  --preview-bg: rgba(238, 244, 255, 0.92);
  --preview-bg-strong: rgba(248, 251, 255, 0.96);
  --preview-surface: rgba(255, 255, 255, 0.78);
  --preview-surface-soft: rgba(80, 115, 255, 0.055);
  --preview-surface-hover: rgba(226, 235, 255, 0.9);

  --preview-text: #26304f;
  --preview-heading: #10172f;
  --preview-muted: #687695;

  --preview-accent: #2b78ff;
  --preview-accent-2: #7667ff;
  --preview-danger: #d84768;

  --preview-border: rgba(72, 102, 180, 0.22);
  --preview-border-soft: rgba(72, 102, 180, 0.14);
  --preview-border-strong: rgba(60, 92, 190, 0.46);

  --preview-glow: rgba(80, 115, 255, 0.18);
}

/* 背景格線 */
.card-preview-panel::before {
  content: '';

  position: absolute;
  inset: 0;
  z-index: 0;

  background-image:
    linear-gradient(rgba(130, 190, 255, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(130, 190, 255, 0.028) 1px, transparent 1px);

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
      rgba(210, 235, 255, 0.12) 50%,
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
    opacity: 0.7;
  }

  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}

/* 四角 HUD 線條 */
.card-preview-panel > * {
  position: relative;
  z-index: 5;
}

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
      rgba(230, 244, 255, 0.88),
      var(--preview-accent)
    );
  box-shadow: 0 0 12px var(--preview-glow);
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

  border-bottom: 1px solid var(--preview-border-soft);
}

.preview-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.preview-type-icon {
  position: relative;

  width: 46px;
  height: 46px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--preview-accent);

  background:
    radial-gradient(circle at 50% 22%, rgba(105, 202, 255, 0.2), transparent 58%),
    rgba(10, 18, 40, 0.78);

  border: 1px solid var(--preview-border);
  border-radius: 6px;

  box-shadow:
    inset 0 0 18px rgba(105, 202, 255, 0.06),
    0 0 18px var(--preview-glow);

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
      var(--preview-accent),
      transparent
    );

  opacity: 0.68;
}

.preview-title-text {
  min-width: 0;
}

.preview-kicker {
  margin: 0 0 5px;

  color: var(--preview-accent);

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.preview-title-text h2 {
  margin: 0;

  color: var(--preview-heading);

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 1.22rem;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: 0.04em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.24),
    0 0 28px var(--preview-glow);
}

.preview-close-btn {
  width: 38px;
  height: 38px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--preview-text);
  background: var(--preview-surface-soft);

  border: 1px solid var(--preview-border-soft);
  border-radius: 6px;

  cursor: pointer;

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
  background: rgba(255, 80, 120, 0.12);
  border-color: rgba(255, 130, 160, 0.46);
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
      var(--preview-surface-soft),
      rgba(255, 255, 255, 0.012)
    ),
    var(--preview-surface);

  border: 1px solid var(--preview-border-soft);
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
      var(--preview-accent),
      transparent
    );

  opacity: 0.45;
}

.meta-label {
  display: block;
  margin-bottom: 6px;

  color: var(--preview-muted);

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preview-meta-item strong {
  display: block;

  color: var(--preview-heading);

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

  color: var(--preview-heading);

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
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

  background: linear-gradient(180deg, var(--preview-accent), var(--preview-accent-2));
  box-shadow: 0 0 10px var(--preview-glow);
  border-radius: 999px;
}

/* Tags */

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  position: relative;

  padding: 6px 10px;

  color: #a5d8ff;
  background: rgba(80, 160, 255, 0.08);

  border: 1px solid rgba(118, 196, 255, 0.22);
  border-radius: 4px;

  cursor: pointer;

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.preview-tag:hover {
  color: #ffffff;
  background: rgba(90, 180, 255, 0.2);
  border-color: rgba(170, 220, 255, 0.5);
  box-shadow: 0 0 14px var(--preview-glow);
  transform: translateY(-1px);
}

/* Empty */

.preview-empty {
  padding: 18px 16px;

  color: var(--preview-muted);
  text-align: center;
  line-height: 1.7;
  font-size: 0.88rem;

  background:
    linear-gradient(
      145deg,
      var(--preview-surface-soft),
      rgba(255, 255, 255, 0.012)
    );

  border: 1px dashed var(--preview-border-soft);
  border-radius: 6px;
}

.preview-empty.compact {
  padding: 14px;
}

/* Links */

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

  color: var(--preview-text);
  background:
    linear-gradient(
      145deg,
      var(--preview-surface-soft),
      rgba(255, 255, 255, 0.012)
    ),
    var(--preview-surface);

  border: 1px solid var(--preview-border-soft);
  border-radius: 6px;

  cursor: pointer;
  text-align: left;

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
  border-color: var(--preview-border-strong);
  background: var(--preview-surface-hover);
  box-shadow: 0 0 16px var(--preview-glow);
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

  color: var(--preview-accent);
  background: rgba(105, 202, 255, 0.1);

  border: 1px solid rgba(105, 202, 255, 0.18);
  border-radius: 5px;

  box-shadow: inset 0 0 14px rgba(105, 202, 255, 0.04);
}

.preview-link-name {
  flex: 1;
  min-width: 0;

  font-weight: 800;

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

  border-top: 1px solid var(--preview-border-soft);
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

  font-family: 'Rajdhani', 'Noto Sans TC', sans-serif;
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
  color: var(--preview-text);
  background: var(--preview-surface);
  border: 1px solid var(--preview-border-soft);
}

.secondary-preview-btn:hover {
  background: var(--preview-surface-hover);
  border-color: var(--preview-border-strong);
  transform: translateY(-1px);
}

.primary-preview-btn {
  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      rgba(90, 120, 255, 0.72),
      rgba(63, 95, 210, 0.86)
    );

  border: 1px solid rgba(185, 205, 255, 0.5);

  box-shadow:
    inset 0 0 22px rgba(255, 255, 255, 0.08),
    0 0 22px rgba(100, 130, 255, 0.18);
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
  filter: brightness(1.08);
  transform: translateY(-2px);
  border-color: rgba(225, 235, 255, 0.76);
  box-shadow:
    inset 0 0 26px rgba(255, 255, 255, 0.12),
    0 0 30px rgba(105, 150, 255, 0.28);
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