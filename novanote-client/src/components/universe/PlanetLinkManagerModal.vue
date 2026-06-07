<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card planet-link-manager" @mousedown.stop>
      <h3>管理星球連結</h3>

      <div class="link-create-box">
        <div class="modal-field">
          <label>來源星球</label>
          <div class="readonly-source">{{ sourcePlanet?.name || '未命名星球' }}</div>
        </div>

        <div class="modal-field">
          <label>目標星球</label>
          <select v-model="form.target_id" class="modal-select">
            <option value="">請選擇要連結的星球</option>
            <option v-for="p in selectableTargets" :key="p.id" :value="p.id">{{ p.name || '未命名星球' }}</option>
          </select>
        </div>

        <div class="modal-field">
          <label>連結名稱（選填）</label>
          <input v-model="form.display_text" class="modal-input" placeholder="例如：相關主題、延伸概念、前置知識..." />
        </div>

        <button class="create-link-btn" type="button" @click="onCreateLink">＋ 新增星球連結</button>
      </div>

      <div class="link-list-header">
        <span>既有連結</span>
        <span class="link-count">{{ currentLinks.length }}</span>
      </div>

      <div v-if="currentLinks.length === 0" class="empty-link-state">這顆星球目前沒有連到其他星球</div>

      <div v-for="link in currentLinks" :key="link.id" class="planet-link-row">
        <div class="planet-link-info">
          <span class="planet-link-icon"><i class="fa-solid fa-satellite"></i></span>
          <div>
            <div class="planet-link-name">{{ getPlanetLinkTargetName(link) }}</div>
            <div class="planet-link-desc">{{ link.display_text || '星球關聯' }}</div>
          </div>
        </div>

        <button class="remove-link-btn" type="button" @click="$emit('remove-link', link)">移除</button>
      </div>

      <div class="modal-actions">
        <button class="cancel-btn" type="button" @click="$emit('close')">關閉</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  sourcePlanet: Object,
  planets: { type: Array, default: () => [] },
  links: { type: Array, default: () => [] }
})

const emit = defineEmits(['create-link', 'remove-link', 'close'])

const form = reactive({ target_id: '', display_text: '' })

const selectableTargets = computed(() => {
  if (!props.sourcePlanet) return props.planets || []
  return (props.planets || []).filter(p => String(p.id) !== String(props.sourcePlanet.id))
})

const currentLinks = computed(() => {
  if (!props.sourcePlanet) return []
  const idStr = String(props.sourcePlanet.id)
  return (props.links || []).filter(link => {
    const s = String(link.source_type || 'note')
    const t = String(link.target_type || 'note')
    const isPlanetToPlanet = s === 'planet' && t === 'planet'
    if (!isPlanetToPlanet) return false
    return String(link.source_id) === idStr || String(link.target_id) === idStr
  })
})

const getPlanetLinkTargetName = (link) => {
  if (!props.sourcePlanet) return '未知星球'
  const currentId = String(props.sourcePlanet.id)
  const otherPlanetId = String(link.source_id) === currentId ? link.target_id : link.source_id
  const planet = (props.planets || []).find(p => String(p.id) === String(otherPlanetId))
  return planet?.name || '未知星球'
}

const onCreateLink = () => {
  if (!props.sourcePlanet) { alert('找不到來源星球'); return }
  if (!form.target_id) { alert('請選擇目標星球'); return }
  if (String(form.target_id) === String(props.sourcePlanet.id)) { alert('星球不能連結自己'); return }

  emit('create-link', { target_id: form.target_id, display_text: String(form.display_text || '').trim() })

  form.target_id = ''
  form.display_text = ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 28px;

  background:
    radial-gradient(circle at 24% 18%, var(--profile-accent-soft), transparent 34%),
    radial-gradient(circle at 78% 72%, rgba(81, 186, 252, 0.07), transparent 36%),
    rgba(2, 4, 14, 0.76);

  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  z-index: 3000;

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
}

/* =========================
   Main Modal Card
========================= */

.modal-card {
  position: relative;

  width: min(620px, 94vw);
  max-height: 86vh;

  padding: 34px 36px 30px;

  color: var(--profile-text);
  background:
    radial-gradient(circle at 18% 0%, var(--profile-accent-soft), transparent 28%),
    radial-gradient(circle at 86% 20%, rgba(81, 186, 252, 0.06), transparent 30%),
    var(--profile-panel-bg);

  border: 1px solid var(--profile-panel-border);
  border-radius: 24px;

  clip-path: polygon(
    18px 0,
    calc(100% - 18px) 0,
    100% 18px,
    100% calc(100% - 18px),
    calc(100% - 18px) 100%,
    18px 100%,
    0 calc(100% - 18px),
    0 18px
  );

  box-shadow:
    var(--profile-shadow-lg),
    0 0 34px rgba(143, 124, 255, 0.14);

  overflow-y: auto;
  overflow-x: hidden;

  scrollbar-width: thin;
  scrollbar-color: var(--profile-accent-border) transparent;
}

.modal-card::before {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(rgba(143, 124, 255, 0.024) 1px, transparent 1px),
    linear-gradient(90deg, rgba(143, 124, 255, 0.024) 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 255, 255, 0.13) 1px, transparent 1.5px);

  background-size:
    32px 32px,
    32px 32px,
    86px 86px;

  opacity: 0.44;
  pointer-events: none;
}

.modal-card::after {
  content: '';

  position: absolute;
  top: 18px;
  right: 18px;

  width: 38px;
  height: 38px;

  border-top: 2px solid var(--profile-accent-border);
  border-right: 2px solid var(--profile-accent-border);

  filter:
    drop-shadow(0 0 8px rgba(143, 124, 255, 0.42))
    drop-shadow(0 0 16px rgba(81, 186, 252, 0.14));

  pointer-events: none;
}

.planet-link-manager > * {
  position: relative;
  z-index: 2;
}

/* =========================
   Header
========================= */

.modal-card h3 {
  margin: 0 0 20px 0;

  text-align: center;

  color: var(--profile-heading);

  font-size: 1.7rem;
  font-weight: 950;
  letter-spacing: 0.04em;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.14),
    0 0 26px rgba(143, 124, 255, 0.2);
}

/* =========================
   Create Link Box
========================= */

.link-create-box {
  display: flex;
  flex-direction: column;
  gap: 16px;

  margin-top: 16px;
  padding: 24px;

  background:
    radial-gradient(circle at 16% 0%, var(--profile-accent-soft), transparent 32%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 18px;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.025),
    0 0 18px rgba(143, 124, 255, 0.08);
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 9px;

  margin-bottom: 0;
}

.modal-field label {
  color: var(--profile-heading);

  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

/* =========================
   Inputs
========================= */

.readonly-source,
.modal-input,
.modal-select {
  width: 100%;
  min-height: 48px;

  padding: 0 15px;

  color: var(--profile-text);
  background:
    radial-gradient(circle at 12% 0%, var(--profile-accent-soft), transparent 42%),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 12px;

  outline: none;

  font-family: inherit;
  font-size: 0.94rem;
  font-weight: 750;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.018),
    inset 0 0 18px rgba(143, 124, 255, 0.035);

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.readonly-source {
  display: flex;
  align-items: center;

  color: var(--profile-heading);
  font-weight: 900;
}

.modal-input::placeholder {
  color: var(--profile-muted-soft);
}

.modal-input:focus,
.modal-select:focus {
  border-color: var(--profile-accent-border);

  box-shadow:
    0 0 0 3px var(--profile-accent-soft),
    0 0 20px rgba(143, 124, 255, 0.16),
    inset 0 0 18px rgba(143, 124, 255, 0.05);
}

.modal-select {
  cursor: pointer;
}

.modal-select option {
  color: var(--profile-text);
  background: var(--surface-bg);
}

/* =========================
   Create Button
========================= */

.create-link-btn {
  position: relative;

  width: 100%;
  min-height: 52px;

  margin-top: 4px;
  padding: 0 18px;

  color: var(--profile-button-text);
  background: var(--profile-button-bg);

  border: 1px solid var(--profile-accent-border);
  border-radius: 14px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.98rem;
  font-weight: 950;
  letter-spacing: 0.03em;

  box-shadow:
    0 0 0 1px rgba(143, 124, 255, 0.18),
    0 0 22px rgba(143, 124, 255, 0.28),
    0 12px 28px rgba(0, 0, 0, 0.26);

  overflow: hidden;

  transition:
    transform 0.18s ease,
    filter 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.create-link-btn::before {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.24) 50%,
      transparent 60%,
      transparent 100%
    );

  transform: translateX(-120%);
  transition: transform 0.58s ease;

  pointer-events: none;
}

.create-link-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);

  background: var(--profile-button-bg-hover);

  box-shadow:
    0 0 0 1px var(--profile-accent-border),
    0 0 30px rgba(143, 124, 255, 0.38),
    0 16px 34px rgba(0, 0, 0, 0.32);
}

.create-link-btn:hover::before {
  transform: translateX(120%);
}

/* =========================
   Existing Links
========================= */

.link-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin: 24px 0 12px;

  color: var(--profile-heading);

  font-size: 0.95rem;
  font-weight: 950;
  letter-spacing: 0.04em;
}

.link-count {
  min-width: 30px;
  height: 26px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 9px;

  color: var(--tag-text);
  background:
    radial-gradient(circle at 50% 30%, var(--profile-accent-soft), transparent 58%),
    var(--tag-bg);

  border: 1px solid var(--tag-border);
  border-radius: 8px;

  font-size: 0.78rem;
  font-weight: 950;

  box-shadow:
    inset 0 0 10px rgba(143, 124, 255, 0.06);
}

.empty-link-state {
  min-height: 92px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 22px 18px;

  text-align: center;

  color: var(--profile-muted);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.012)),
    var(--profile-panel-bg-soft);

  border: 1px dashed var(--profile-panel-border);
  border-radius: 16px;

  font-size: 0.94rem;
  font-weight: 800;
}

/* =========================
   Link Rows
========================= */

.planet-link-row {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding: 14px 14px;
  margin-top: 10px;

  color: var(--profile-text);
  background:
    radial-gradient(circle at 12% 50%, var(--profile-accent-soft), transparent 34%),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 14px;

  overflow: hidden;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.planet-link-row::before {
  content: '';

  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;

  width: 3px;

  background: var(--accent-color);
  border-radius: 999px;

  box-shadow:
    0 0 10px rgba(143, 124, 255, 0.56);
}

.planet-link-row:hover {
  transform: translateX(3px);

  border-color: var(--profile-accent-border);

  background:
    radial-gradient(circle at 12% 50%, var(--profile-accent-soft), transparent 36%),
    var(--profile-menu-hover-bg);

  box-shadow:
    0 0 20px rgba(143, 124, 255, 0.14),
    inset 0 0 18px rgba(143, 124, 255, 0.035);
}

.planet-link-info {
  display: flex;
  align-items: center;
  gap: 13px;

  min-width: 0;
}

.planet-link-icon {
  width: 42px;
  height: 42px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  color: var(--accent-color);
  background:
    radial-gradient(circle at 50% 30%, var(--profile-accent-soft), transparent 58%),
    var(--tag-bg);

  border: 1px solid var(--tag-border);
  border-radius: 12px;

  font-size: 1.05rem;

  box-shadow:
    inset 0 0 14px rgba(143, 124, 255, 0.08),
    0 0 14px rgba(143, 124, 255, 0.12);
}

.planet-link-name {
  max-width: 340px;

  color: var(--profile-heading);

  font-size: 0.98rem;
  font-weight: 950;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.planet-link-desc {
  max-width: 340px;

  margin-top: 4px;

  color: var(--profile-muted);

  font-size: 0.82rem;
  font-weight: 750;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================
   Remove Button
========================= */

.remove-link-btn {
  flex-shrink: 0;

  min-height: 36px;
  padding: 0 13px;

  color: var(--danger-color);
  background: var(--danger-bg);

  border: 1px solid rgba(255, 119, 119, 0.3);
  border-radius: 10px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 900;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.remove-link-btn:hover {
  color: #ffc4cc;
  background: rgba(255, 90, 150, 0.14);

  border-color: var(--danger-color);

  transform: translateY(-1px);

  box-shadow:
    0 0 16px rgba(255, 100, 140, 0.16);
}

/* =========================
   Footer Actions
========================= */

.modal-actions {
  display: flex;
  justify-content: flex-end;

  margin-top: 22px;
}

.cancel-btn {
  min-width: 112px;
  min-height: 42px;

  padding: 0 18px;

  color: var(--profile-text);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 12px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 900;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.cancel-btn:hover {
  color: var(--profile-heading);

  border-color: var(--profile-accent-border);

  background:
    radial-gradient(circle at 12% 50%, var(--profile-accent-soft), transparent 36%),
    var(--profile-menu-hover-bg);

  transform: translateY(-1px);

  box-shadow:
    0 0 18px rgba(143, 124, 255, 0.12);
}

/* =========================
   Scrollbar
========================= */

.modal-card::-webkit-scrollbar {
  width: 8px;
}

.modal-card::-webkit-scrollbar-track {
  background: transparent;
}

.modal-card::-webkit-scrollbar-thumb {
  background:
    linear-gradient(
      180deg,
      var(--profile-accent-border),
      rgba(81, 186, 252, 0.18)
    );

  border-radius: 999px;
}

/* =========================
   Responsive
========================= */

@media (max-width: 640px) {
  .modal-overlay {
    padding: 18px;
  }

  .modal-card {
    width: min(100%, 94vw);
    padding: 28px 22px 24px;
  }

  .modal-card h3 {
    font-size: 1.38rem;
  }

  .link-create-box {
    padding: 18px;
  }

  .planet-link-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .planet-link-info {
    width: 100%;
  }

  .planet-link-name,
  .planet-link-desc {
    max-width: 100%;
  }

  .remove-link-btn {
    align-self: flex-end;
  }

  .modal-actions {
    justify-content: stretch;
  }

  .cancel-btn {
    width: 100%;
  }
}
</style>