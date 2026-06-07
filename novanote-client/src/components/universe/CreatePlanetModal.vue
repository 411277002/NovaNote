<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" @mousedown.stop>
      <h3>誕生新星球</h3>
      <p class="modal-subtitle">建立一個新的知識星系節點</p>

      <div class="modal-field">
        <label>星球名稱</label>
        <input
          v-model="form.name"
          class="modal-input"
          placeholder="命名這顆星體..."
        />
      </div>

      <div class="modal-field">
        <label>星球地貌</label>
        <select v-model="form.texture_type" class="modal-select">
          <option value="rocky">Rocky · 岩石行星</option>
          <option value="gas">Gas · 氣體巨星</option>
          <option value="ringed">Ringed · 帶環行星</option>
          <option value="ice">Ice · 冰晶星球</option>
          <option value="lava">Lava · 熔岩星球</option>
          <option value="ocean">Ocean · 海洋星球</option>
        </select>
      </div>

      <div class="modal-field">
        <label>星系色調</label>

        <div class="planet-color-panel">
            <div class="preset-color-dots">
            <button
                v-for="color in presetColors"
                :key="color.value"
                type="button"
                class="preset-dot-btn"
                :class="{ active: form.color.toLowerCase() === color.value.toLowerCase() }"
                :title="color.name"
                @click="selectPresetColor(color.value)"
            >
                <span
                class="preset-dot"
                :style="{ backgroundColor: color.value }"
                ></span>
            </button>
            </div>

            <div class="custom-color-row">
            <span class="custom-color-label">自訂</span>

            <div class="custom-color-actions">
                <span
                    class="current-color-preview"
                    :style="{ backgroundColor: form.color }"
                ></span>

                <label class="custom-color-toggle" title="自訂顏色">
                    <i class="fa-solid fa-plus"></i>

                    <input
                    v-model="form.color"
                    type="color"
                    class="hidden-color-input"
                    @input="handleCustomColorInput"
                    />
                </label>
            </div>
            </div>
        </div>
        </div>

      <div class="modal-actions">
        <button class="cancel-btn" type="button" @click="$emit('close')">取消</button>
        <button class="confirm-btn" type="button" @click="onCreate">誕生</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  initial: {
    type: Object,
    default: () => ({
      name: '',
      texture_type: 'rocky',
      color: '#646cff'
    })
  }
})

const emit = defineEmits(['create', 'close'])

const defaultColor = '#646cff'

const presetColors = [
  { name: '深空紫', value: '#646cff' },
  { name: '星雲紫', value: '#8f7cff' },
  { name: '極光藍', value: '#5bb8ff' },
  { name: '銀河青', value: '#2dd4bf' },
  { name: '冰晶藍', value: '#93c5fd' },
  { name: '星霧白', value: '#d8d8e8' },
  { name: '星塵金', value: '#facc15' },
  { name: '熔岩橘', value: '#fb923c' },
  { name: '玫瑰粉', value: '#f472b6' },
  { name: '紅矮星', value: '#ef4444' },
  { name: '森林綠', value: '#22c55e' },
  { name: '暗物質', value: '#111827' }
]

const form = reactive({
  name: props.initial.name || '',
  texture_type: props.initial.texture_type || 'rocky',
  color: props.initial.color || defaultColor
})

const selectPresetColor = (color) => {
  form.color = color
}

const handleCustomColorInput = (event) => {
  form.color = event.target.value
}

const onCreate = () => {
  if (!form.name || !String(form.name).trim()) {
    alert('請先為這顆星球命名')
    return
  }

  emit('create', {
    name: String(form.name).trim(),
    texture_type: form.texture_type,
    color: form.color
  })
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
   Modal Card
========================= */

.modal-card {
  position: relative;

  width: min(520px, 94vw);
  padding: 34px 38px 32px;

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

  overflow: hidden;
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

.modal-card > * {
  position: relative;
  z-index: 2;
}

/* =========================
   Header
========================= */

.modal-card h3 {
  margin: 0;

  text-align: center;

  color: var(--profile-heading);

  font-size: 1.72rem;
  font-weight: 950;
  letter-spacing: 0.04em;

  text-shadow:
    0 0 12px rgba(255, 255, 255, 0.14),
    0 0 26px rgba(143, 124, 255, 0.2);
}

.modal-subtitle {
  margin: 10px 0 28px;

  text-align: center;

  color: var(--profile-muted);

  font-size: 0.94rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

/* =========================
   Fields
========================= */

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 9px;

  margin-bottom: 20px;
}

.modal-field label {
  color: var(--profile-heading);

  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.modal-input,
.modal-select {
  width: 100%;
  min-height: 52px;

  padding: 0 16px;

  color: var(--profile-text);
  background:
    radial-gradient(circle at 12% 0%, var(--profile-accent-soft), transparent 42%),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 14px;

  outline: none;

  font-family: inherit;
  font-size: 0.96rem;
  font-weight: 750;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.018),
    inset 0 0 18px rgba(143, 124, 255, 0.035);

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
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
   Color Palette Panel
========================= */

.planet-color-panel {
  padding: 16px;

  background:
    radial-gradient(circle at 12% 0%, var(--profile-accent-soft), transparent 42%),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
  border-radius: 16px;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.018),
    inset 0 0 18px rgba(143, 124, 255, 0.035);

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.planet-color-panel:hover {
  border-color: var(--profile-accent-border);

  box-shadow:
    0 0 18px rgba(143, 124, 255, 0.12),
    inset 0 0 18px rgba(143, 124, 255, 0.04);
}

.preset-color-dots {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px 12px;

  padding: 2px 0 16px;

  border-bottom: 1px solid var(--profile-panel-border);
}

.preset-dot-btn {
  width: 34px;
  height: 34px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  background: transparent;
  border: none;
  border-radius: 999px;

  cursor: pointer;

  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.preset-dot-btn:hover {
  transform: translateY(-2px) scale(1.05);
}

.preset-dot {
  width: 28px;
  height: 28px;

  display: block;

  border-radius: 999px;

  border: 1px solid rgba(255, 255, 255, 0.28);

  box-shadow:
    inset 0 0 8px rgba(255, 255, 255, 0.18),
    0 0 10px rgba(0, 0, 0, 0.22);

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.preset-dot-btn.active .preset-dot {
  border-color: var(--profile-heading);

  box-shadow:
    0 0 0 3px var(--profile-panel-bg),
    0 0 0 5px var(--accent-color),
    0 0 18px rgba(143, 124, 255, 0.32),
    inset 0 0 8px rgba(255, 255, 255, 0.22);

  transform: scale(1.03);
}

.custom-color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-top: 14px;
}

.custom-color-label {
  color: var(--profile-heading);

  font-size: 0.94rem;
  font-weight: 950;
  letter-spacing: 0.04em;
}

.custom-color-actions {
  position: relative;

  display: flex;
  align-items: center;
  gap: 12px;
}

.current-color-preview {
  width: 32px;
  height: 32px;

  border-radius: 999px;

  border: 1px solid rgba(255, 255, 255, 0.28);

  box-shadow:
    0 0 12px rgba(143, 124, 255, 0.18),
    inset 0 0 8px rgba(255, 255, 255, 0.16);
}

.custom-color-toggle {
  position: relative;

  width: 34px;
  height: 34px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: var(--accent-color);
  background:
    radial-gradient(circle at 50% 30%, var(--profile-accent-soft), transparent 58%),
    var(--tag-bg);

  border: 1px solid var(--profile-accent-border);
  border-radius: 999px;

  cursor: pointer;

  font-size: 0.9rem;

  overflow: hidden;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.custom-color-toggle:hover,
.custom-color-toggle.active {
  color: var(--profile-heading);
  background: var(--profile-accent-soft);

  border-color: var(--accent-border);

  transform: translateY(-1px);

  box-shadow:
    0 0 14px rgba(143, 124, 255, 0.22);
}

.hidden-color-input {
  position: absolute;
  inset: 0;

  width: 100%;
  height: 100%;

  opacity: 0;
  cursor: pointer;

  border: none;
  padding: 0;
}

/* =========================
   Actions
========================= */

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;

  margin-top: 30px;
}

.cancel-btn,
.confirm-btn {
  position: relative;

  min-height: 52px;

  padding: 0 18px;

  border-radius: 14px;

  cursor: pointer;

  font-family: inherit;
  font-size: 0.96rem;
  font-weight: 950;
  letter-spacing: 0.03em;

  overflow: hidden;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease,
    filter 0.18s ease;
}

.cancel-btn {
  color: var(--profile-text);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
    var(--profile-panel-bg-soft);

  border: 1px solid var(--profile-panel-border);
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

.confirm-btn {
  color: var(--profile-button-text);
  background: var(--profile-button-bg);

  border: 1px solid var(--profile-accent-border);

  box-shadow:
    0 0 0 1px rgba(143, 124, 255, 0.18),
    0 0 22px rgba(143, 124, 255, 0.28),
    0 12px 28px rgba(0, 0, 0, 0.26);
}

.confirm-btn::before {
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

.confirm-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);

  background: var(--profile-button-bg-hover);

  box-shadow:
    0 0 0 1px var(--profile-accent-border),
    0 0 30px rgba(143, 124, 255, 0.38),
    0 16px 34px rgba(0, 0, 0, 0.32);
}

.confirm-btn:hover::before {
  transform: translateX(120%);
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
    padding: 30px 22px 24px;
  }

  .modal-card h3 {
    font-size: 1.42rem;
  }

  .modal-actions {
    grid-template-columns: 1fr;
  }
}
</style>