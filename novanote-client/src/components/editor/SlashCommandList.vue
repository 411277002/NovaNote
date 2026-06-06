<template>
  <div class="slash-menu" :class="{ dark: theme === 'dark' }">
    <button
      v-for="(item, index) in items"
      :key="item.title"
      class="slash-item"
      :class="{ active: index === selectedIndex }"
      type="button"
      @click="selectItem(index)"
    >
      <span class="slash-icon">
        <i class="fa-solid" :class="item.icon"></i>
      </span>

      <span class="slash-content">
        <strong>{{ item.title }}</strong>
        <small>{{ item.description }}</small>
      </span>
    </button>

    <div v-if="items.length === 0" class="slash-empty">
      找不到符合的指令
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  command: {
    type: Function,
    required: true
  },
  theme: {
    type: String,
    default: 'light'
  }
})

const selectedIndex = ref(0)

const selectItem = (index) => {
  const item = props.items[index]

  if (item) {
    props.command(item)
  }
}

const onKeyDown = (event) => {
  if (!props.items.length) return false

  if (event.key === 'ArrowUp') {
    event.preventDefault()

    selectedIndex.value =
      (selectedIndex.value + props.items.length - 1) % props.items.length

    return true
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()

    selectedIndex.value =
      (selectedIndex.value + 1) % props.items.length

    return true
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    selectItem(selectedIndex.value)

    return true
  }

  return false
}

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  },
  {
    deep: true
  }
)

onMounted(() => {
  window.addEventListener('keydown', onKeyDown, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown, true)
})
</script>

<style scoped>
.slash-menu {
  width: 300px;
  max-height: 360px;
  padding: 8px;

  overflow-y: auto;

  border-radius: 10px;
  border: 1px solid var(--slash-border, rgba(160, 170, 190, 0.24));

  background: var(--slash-bg, #ffffff);

  box-shadow:
    var(--slash-shadow, 0 18px 44px rgba(30, 40, 60, 0.18)),
    var(--slash-inner-shadow, inset 0 0 0 1px rgba(255, 255, 255, 0.7));

  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  z-index: 9999;
}

.slash-item {
  width: 100%;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 10px;

  border: 1px solid transparent;
  border-radius: 12px;

  background: transparent;
  color: var(--slash-item-text, #1f2430);

  cursor: pointer;
  text-align: left;
  font-family: inherit;

  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    transform 0.16s ease;
}

.slash-item:hover,
.slash-item.active {
  background: var(--slash-item-hover-bg, #eef5ff);
  border-color: var(--slash-item-hover-border, #cfe2ff);
}

.slash-icon {
  width: 36px;
  height: 36px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  flex-shrink: 0;

  border-radius: 12px;

  background: var(--slash-icon-bg, #e9f2ff);
  color: var(--slash-icon-color, #2f74c0);

  font-size: 0.95rem;

  transition:
    background 0.16s ease,
    color 0.16s ease;
}

.slash-icon i {
  color: inherit;
}

.slash-content {
  min-width: 0;
}

.slash-content strong {
  display: block;

  color: var(--slash-title-color, #151922);
  font-size: 0.9rem;
  font-weight: 900;
  line-height: 1.25;
}

.slash-content small {
  display: block;
  margin-top: 2px;

  color: var(--slash-desc-color, #7d8495);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.25;
}

.slash-empty {
  padding: 24px 12px;
  text-align: center;

  color: var(--slash-empty-color, #8c93a5);
  font-size: 0.86rem;
  font-weight: 800;
}

/* =========================
   Scrollbar
========================= */

.slash-menu::-webkit-scrollbar {
  width: 8px;
}

.slash-menu::-webkit-scrollbar-track {
  background: transparent;
}

.slash-menu::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--slash-scrollbar, rgba(130, 145, 170, 0.35));
}

.slash-menu::-webkit-scrollbar-thumb:hover {
  background: var(--slash-scrollbar-hover, rgba(130, 145, 170, 0.55));
}

/* =========================
   Theme Class Fallback
========================= */

.slash-menu.dark,
.slash-menu.theme-dark {
  --slash-bg: rgba(18, 20, 32, 0.98);
  --slash-border: rgba(255, 255, 255, 0.12);
  --slash-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
  --slash-inner-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);

  --slash-item-text: #f5f7ff;
  --slash-item-hover-bg: rgba(126, 94, 255, 0.18);
  --slash-item-hover-border: rgba(165, 140, 255, 0.42);

  --slash-icon-bg: rgba(126, 94, 255, 0.18);
  --slash-icon-color: #cfc4ff;

  --slash-title-color: #f7f8ff;
  --slash-desc-color: #a6aec4;
  --slash-empty-color: #a6aec4;

  --slash-scrollbar: rgba(160, 175, 210, 0.24);
  --slash-scrollbar-hover: rgba(160, 175, 210, 0.42);
}

.slash-menu.light,
.slash-menu.theme-light {
  --slash-bg: rgba(255, 255, 255, 0.98);
  --slash-border: rgba(160, 170, 190, 0.24);
  --slash-shadow: 0 18px 44px rgba(30, 40, 60, 0.18);
  --slash-inner-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.7);

  --slash-item-text: #1f2430;
  --slash-item-hover-bg: #eef5ff;
  --slash-item-hover-border: #cfe2ff;

  --slash-icon-bg: #e9f2ff;
  --slash-icon-color: #2f74c0;

  --slash-title-color: #151922;
  --slash-desc-color: #7d8495;
  --slash-empty-color: #8c93a5;

  --slash-scrollbar: rgba(130, 145, 170, 0.35);
  --slash-scrollbar-hover: rgba(130, 145, 170, 0.55);
}
</style>