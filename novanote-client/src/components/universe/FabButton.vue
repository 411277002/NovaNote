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
.fab-container {
  position: fixed;
  right: 40px;
  bottom: 40px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;

  z-index: 1000;

  font-family: 'Orbitron', 'Rajdhani', 'Noto Sans TC', sans-serif;
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

  color: #f3f5ff;
  background:
    radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.12), transparent 34%),
    linear-gradient(180deg, rgba(70, 72, 128, 0.96) 0%, rgba(35, 39, 78, 0.98) 100%);

  border: 1px solid rgba(122, 129, 212, 0.36);

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
  overflow: hidden;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.02),
    0 10px 22px rgba(0, 0, 0, 0.34);

  transition:
    transform 0.22s ease,
    background 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    color 0.22s ease;
}

.main-fab::before {
  content: '';

  position: absolute;
  inset: 6px;

  border: 1px solid rgba(170, 178, 255, 0.16);

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
      rgba(190, 196, 255, 0.72),
      transparent
    );

  opacity: 0.72;
}

/* =========================
   Main FAB Effects
========================= */

.fab-orbit {
  position: absolute;
  inset: -8px;

  border: 1px solid var(--fab-ring);
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

  background: var(--link-color);
  box-shadow:
    0 0 8px var(--link-color),
    0 0 16px rgba(81, 186, 252, 0.4);
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
  transform: translateY(-2px);

  background:
    radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(82, 84, 145, 0.98) 0%, rgba(42, 47, 92, 0.98) 100%);

  border-color: rgba(148, 155, 235, 0.42);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 0 12px rgba(118, 126, 220, 0.14),
    0 12px 24px rgba(0, 0, 0, 0.36);
}

.main-fab:hover .fab-orbit {
  opacity: 1;
  transform: scale(1) rotate(140deg);
}

.main-fab:hover .fab-scan {
  transform: translateX(120%);
}

.main-fab.is-open {
  color: #d8dcff;
  background:
    radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(58, 61, 110, 0.98) 0%, rgba(28, 32, 62, 0.98) 100%);

  border-color: rgba(148, 155, 235, 0.42);
  transform: rotate(135deg);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3),
    0 0 10px rgba(118, 126, 220, 0.1),
    0 12px 24px rgba(0, 0, 0, 0.36);
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
    0 0 14px rgba(143, 124, 255, 0.22);

  transition:
    width 0.2s ease,
    height 0.2s ease,
    opacity 0.2s ease;
}

.horizontal {
  width: 15px;
  height: 1.8px;
}

.vertical {
  width: 1.8px;
  height: 15px;
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

.sub-fab {
  position: relative;

  width: 48px;
  height: 48px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #d8dcff;
  background:
    radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(56, 60, 108, 0.96) 0%, rgba(25, 29, 58, 0.98) 100%);

  border: 1px solid rgba(122, 129, 212, 0.28);

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
  overflow: hidden;

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.24),
    0 8px 18px rgba(0, 0, 0, 0.28);

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
    radial-gradient(circle at 50% 20%, var(--accent-soft), transparent 48%),
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

  border: 1px solid rgba(255, 255, 255, 0.12);

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
      var(--accent-color),
      transparent
    );

  opacity: 0.48;
  box-shadow: 0 0 8px rgba(143, 124, 255, 0.24);
}

.sub-fab i {
  position: relative;
  z-index: 2;

  font-size: 1rem;
  line-height: 1;

  text-shadow:
    0 0 10px rgba(143, 124, 255, 0.25),
    0 0 18px rgba(81, 186, 252, 0.16);
}

.sub-fab:hover {
  color: #ffffff;
  background:
    radial-gradient(circle at 50% 16%, rgba(255, 255, 255, 0.1), transparent 34%),
    linear-gradient(180deg, rgba(70, 74, 130, 0.98) 0%, rgba(33, 38, 76, 0.98) 100%);

  border-color: rgba(148, 155, 235, 0.38);

  transform: translateY(-2px);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    inset 0 -1px 0 rgba(0, 0, 0, 0.26),
    0 10px 22px rgba(0, 0, 0, 0.32);
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
   Individual Sub FAB
========================= */

.planet-fab i {
  color: var(--accent-color);
}

.note-fab i {
  color: var(--accent-color);
}

.planet-fab:hover i,
.note-fab:hover i {
  color: var(--fab-sub-text-hover);
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
   Light Theme Fine Tune
========================= */

:global(html[data-theme='light']) .main-fab {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.52),
    0 0 22px rgba(143, 124, 255, 0.18),
    0 16px 34px rgba(45, 60, 110, 0.22);
}

:global(html[data-theme='light']) .main-fab.is-open {
  background:
    radial-gradient(circle at 32% 18%, var(--accent-soft), transparent 34%),
    linear-gradient(135deg, #ffffff, #eef2ff);
}

:global(html[data-theme='light']) .sub-fab {
  background:
    radial-gradient(circle at 50% 20%, var(--accent-soft), transparent 48%),
    var(--fab-sub-bg);

  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.52),
    0 0 14px rgba(143, 124, 255, 0.12),
    0 12px 26px rgba(45, 60, 110, 0.16);
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