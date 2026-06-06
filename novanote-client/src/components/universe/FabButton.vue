<template>
  <div class="fab-container">
    <transition-group name="fab-items">
      <div v-if="isOpen" class="fab-menu" key="menu">
        <button
          class="sub-fab planet-fab"
          type="button"
          title="建立星球"
          @click="emitAndClose('create-planet')"
        >
          <span class="sub-fab-frame"></span>
          <i class="fa-solid fa-folder-open"></i>
        </button>

        <button
          class="sub-fab note-fab"
          type="button"
          title="建立筆記"
          @click="emitAndClose('create-note')"
        >
          <span class="sub-fab-frame"></span>
          <i class="fa-solid fa-file-lines"></i>
        </button>
      </div>
    </transition-group>

    <button
      class="main-fab"
      :class="{ 'is-open': isOpen }"
      type="button"
      aria-label="新增"
      @click="toggleMenu"
    >
      <span class="fab-orbit"></span>
      <span class="fab-scan"></span>

      <div class="custom-icon">
        <div class="line horizontal"></div>
        <div class="line vertical"></div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['create-note', 'create-planet'])
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const emitAndClose = (eventName) => {
  emit(eventName)
  isOpen.value = false
}
</script>

<style scoped>
/* =========================
   Theme Variables
========================= */

.fab-container {
  --fab-main-bg:
    linear-gradient(
      135deg,
      rgba(80, 105, 255, 0.76),
      rgba(34, 47, 118, 0.92)
    );

  --fab-main-bg-hover:
    linear-gradient(
      135deg,
      rgba(105, 202, 255, 0.82),
      rgba(84, 92, 255, 0.92)
    );

  --fab-main-bg-open:
    linear-gradient(
      135deg,
      rgba(20, 28, 58, 0.96),
      rgba(7, 12, 28, 0.96)
    );

  --fab-main-text: #f4f8ff;
  --fab-accent: #8fd0ff;
  --fab-accent-2: #9f8cff;
  --fab-border: rgba(170, 210, 255, 0.42);
  --fab-border-strong: rgba(220, 240, 255, 0.72);

  --fab-sub-bg:
    linear-gradient(
      145deg,
      rgba(15, 24, 52, 0.92),
      rgba(6, 10, 24, 0.92)
    );

  --fab-sub-bg-hover:
    linear-gradient(
      145deg,
      rgba(35, 54, 112, 0.96),
      rgba(10, 20, 48, 0.96)
    );

  --fab-sub-text: #a9c8ff;
  --fab-sub-text-hover: #ffffff;
  --fab-sub-border: rgba(140, 190, 255, 0.28);

  --fab-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.035),
    0 0 20px rgba(105, 150, 255, 0.28),
    0 16px 38px rgba(0, 0, 0, 0.38);

  --fab-shadow-soft:
    0 0 0 1px rgba(255, 255, 255, 0.025),
    0 0 14px rgba(105, 150, 255, 0.16),
    0 12px 28px rgba(0, 0, 0, 0.28);

  position: fixed;
  right: 40px;
  bottom: 40px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  z-index: 1000;
}

:global(html[data-theme='light']) .fab-container {
  --fab-main-bg:
    linear-gradient(
      135deg,
      rgba(100, 115, 255, 0.92),
      rgba(74, 96, 205, 0.96)
    );

  --fab-main-bg-hover:
    linear-gradient(
      135deg,
      rgba(62, 152, 255, 0.92),
      rgba(105, 115, 255, 0.96)
    );

  --fab-main-bg-open:
    linear-gradient(
      135deg,
      rgba(238, 243, 255, 0.96),
      rgba(218, 228, 250, 0.96)
    );

  --fab-main-text: #ffffff;
  --fab-accent: #2b78ff;
  --fab-accent-2: #7667ff;
  --fab-border: rgba(82, 112, 220, 0.36);
  --fab-border-strong: rgba(55, 80, 180, 0.56);

  --fab-sub-bg:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.92),
      rgba(232, 239, 255, 0.92)
    );

  --fab-sub-bg-hover:
    linear-gradient(
      145deg,
      rgba(238, 244, 255, 0.96),
      rgba(218, 228, 255, 0.96)
    );

  --fab-sub-text: #4b5e9c;
  --fab-sub-text-hover: #2b46ff;
  --fab-sub-border: rgba(82, 112, 220, 0.24);

  --fab-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.5),
    0 0 22px rgba(80, 115, 255, 0.18),
    0 16px 34px rgba(45, 60, 110, 0.22);

  --fab-shadow-soft:
    0 0 0 1px rgba(255, 255, 255, 0.5),
    0 0 14px rgba(80, 115, 255, 0.12),
    0 12px 26px rgba(45, 60, 110, 0.16);
}

/* =========================
   Main FAB
========================= */

.main-fab {
  position: relative;

  width: 54px;
  height: 54px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  color: var(--fab-main-text);
  background: var(--fab-main-bg);

  border: 1px solid var(--fab-border);

  clip-path: polygon(
    14px 0,
    calc(100% - 14px) 0,
    100% 14px,
    100% calc(100% - 14px),
    calc(100% - 14px) 100%,
    14px 100%,
    0 calc(100% - 14px),
    0 14px
  );

  cursor: pointer;

  box-shadow: var(--fab-shadow);

  overflow: hidden;

  transition:
    transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    color 0.22s ease;
}

.main-fab::before {
  content: '';

  position: absolute;
  inset: 6px;

  border: 1px solid rgba(220, 240, 255, 0.16);

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

  pointer-events: none;
}

.main-fab::after {
  content: '';

  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 7px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(210, 235, 255, 0.78),
      transparent
    );

  box-shadow: 0 0 10px rgba(140, 205, 255, 0.4);

  opacity: 0.8;
}

.fab-orbit {
  position: absolute;
  inset: -8px;

  border: 1px solid rgba(140, 190, 255, 0.2);
  border-radius: 999px;

  opacity: 0;
  transform: scale(0.7) rotate(0deg);

  pointer-events: none;

  transition:
    opacity 0.22s ease,
    transform 0.38s ease;
}

.fab-orbit::before {
  content: '';

  position: absolute;
  top: 5px;
  left: 50%;

  width: 5px;
  height: 5px;

  border-radius: 999px;

  background: var(--fab-accent);
  box-shadow:
    0 0 8px var(--fab-accent),
    0 0 16px rgba(105, 202, 255, 0.4);
}

.fab-scan {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 38%,
      rgba(255, 255, 255, 0.24) 50%,
      transparent 62%,
      transparent 100%
    );

  transform: translateX(-120%);
  transition: transform 0.65s ease;

  pointer-events: none;
}

.main-fab:hover {
  transform: translateY(-3px);
  background: var(--fab-main-bg-hover);
  border-color: var(--fab-border-strong);
  box-shadow: var(--fab-shadow);
}

.main-fab:hover .fab-orbit {
  opacity: 1;
  transform: scale(1) rotate(140deg);
}

.main-fab:hover .fab-scan {
  transform: translateX(120%);
}

.main-fab.is-open {
  background: var(--fab-main-bg-open);
  color: var(--fab-accent);
  transform: rotate(135deg);
  border-color: var(--fab-border-strong);
}

.main-fab.is-open:hover {
  transform: rotate(135deg) translateY(-1px);
}

/* =========================
   Plus Icon
========================= */

.custom-icon {
  position: relative;
  z-index: 2;

  width: 20px;
  height: 20px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.line {
  position: absolute;

  background: currentColor;
  border-radius: 999px;

  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.32),
    0 0 14px rgba(140, 205, 255, 0.22);

  transition:
    width 0.2s ease,
    height 0.2s ease,
    opacity 0.2s ease;
}

.horizontal {
  width: 18px;
  height: 2px;
}

.vertical {
  width: 2px;
  height: 18px;
}

.main-fab.is-open .horizontal {
  width: 16px;
}

.main-fab.is-open .vertical {
  height: 16px;
}

/* =========================
   Sub Menu
========================= */

.fab-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* 子按鈕 */
.sub-fab {
  position: relative;

  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--fab-sub-text);
  background: var(--fab-sub-bg);

  border: 1px solid var(--fab-sub-border);

  clip-path: polygon(
    11px 0,
    calc(100% - 11px) 0,
    100% 11px,
    100% calc(100% - 11px),
    calc(100% - 11px) 100%,
    11px 100%,
    0 calc(100% - 11px),
    0 11px
  );

  cursor: pointer;

  box-shadow: var(--fab-shadow-soft);

  overflow: hidden;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.sub-fab::before {
  content: '';

  position: absolute;
  inset: 0;

  background:
    radial-gradient(circle at 50% 20%, rgba(105, 202, 255, 0.16), transparent 48%),
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 42%,
      rgba(255, 255, 255, 0.14) 50%,
      transparent 58%,
      transparent 100%
    );

  transform: translateX(-120%);
  opacity: 0;

  transition:
    transform 0.55s ease,
    opacity 0.18s ease;
}

.sub-fab-frame {
  position: absolute;
  inset: 5px;

  border: 1px solid rgba(190, 225, 255, 0.12);

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

  pointer-events: none;
}

.sub-fab::after {
  content: '';

  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 6px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--fab-accent),
      transparent
    );

  opacity: 0.48;

  box-shadow: 0 0 8px rgba(105, 202, 255, 0.24);
}

.sub-fab i {
  position: relative;
  z-index: 2;

  font-size: 1rem;
  line-height: 1;

  text-shadow:
    0 0 10px rgba(105, 202, 255, 0.25),
    0 0 18px rgba(160, 140, 255, 0.16);
}

.sub-fab:hover {
  color: var(--fab-sub-text-hover);
  background: var(--fab-sub-bg-hover);
  border-color: var(--fab-border-strong);

  transform: translateY(-3px) scale(1.04);

  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.035),
    0 0 20px rgba(105, 202, 255, 0.24),
    0 16px 34px rgba(0, 0, 0, 0.34);
}

.sub-fab:hover::before {
  opacity: 1;
  transform: translateX(120%);
}

.sub-fab:active,
.main-fab:active {
  transform: scale(0.96);
}

.main-fab.is-open:active {
  transform: rotate(135deg) scale(0.96);
}

/* =========================
   Animation
========================= */

.fab-items-enter-active,
.fab-items-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-items-enter-from,
.fab-items-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.78);
}

.fab-items-enter-to,
.fab-items-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* =========================
   RWD
========================= */

@media (max-width: 768px) {
  .fab-container {
    right: 24px;
    bottom: 28px;
  }

  .main-fab {
    width: 50px;
    height: 50px;
  }

  .sub-fab {
    width: 44px;
    height: 44px;
  }
}
</style>