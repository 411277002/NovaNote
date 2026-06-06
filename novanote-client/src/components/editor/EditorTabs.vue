<template>
  <div class="editor-tabs-wrapper" v-if="tabs.length > 0">
    <div class="editor-tabs-scroll">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="editor-tab"
        :class="{ active: String(tab.id) === String(activeTabId) }"
        type="button"
        @click="selectTab(tab)"
      >
        <span class="tab-dot"></span>

        <span class="tab-title">
          {{ tab.title || '未命名文件' }}
        </span>

        <span
          class="tab-close"
          title="關閉分頁"
          @click.stop="closeTab(tab)"
        >
          ×
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  activeTabId: {
    type: [String, Number, null],
    default: null
  }
})

const emit = defineEmits(['select-tab', 'close-tab'])

const selectTab = (tab) => {
  emit('select-tab', tab)
}

const closeTab = (tab) => {
  emit('close-tab', tab)
}
</script>

<style scoped>
.editor-tabs-wrapper {
  position: sticky;
  top: 0;
  z-index: 2600;

  width: 100%;
  height: 38px;

  display: flex;
  align-items: center;

  background: var(--editor-header-bg);
  border-bottom: 1px solid var(--border-color);

  padding: 6px 48px 5px;

  overflow: hidden;
  box-sizing: border-box;
}

.editor-tabs-scroll {
  width: 100%;
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 8px;

  overflow-x: auto;
  overflow-y: hidden;

  padding-bottom: 0;
}

.editor-tab {
  height: 28px;
  min-width: 88px;
  max-width: 180px;

  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 0 8px 0 10px;

  border: 1px solid var(--border-color);
  border-radius: 999px;

  background: var(--button-bg);
  color: var(--text-color);

  cursor: pointer;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.82rem;

  flex-shrink: 0;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.editor-tab:hover {
  transform: translateY(-1px);
  background: var(--button-hover-bg);
  border-color: var(--accent-color);
}

.editor-tab.active {
  background: var(--accent-soft);
  border-color: var(--accent-color);
  color: var(--heading-color);

  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 0 14px var(--accent-soft);
}

.tab-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;
  flex-shrink: 0;

  background: var(--accent-color);
  box-shadow: 0 0 8px var(--accent-color);
}

.tab-title {
  flex: 1;
  min-width: 0;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  text-align: left;
}

.tab-close {
  width: 18px;
  height: 18px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: var(--muted-text);
  font-size: 1rem;
  line-height: 1;

  flex-shrink: 0;

  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.tab-close:hover {
  background: var(--danger-bg);
  color: var(--danger-color);
}

.editor-tabs-scroll::-webkit-scrollbar {
  height: 3px;
}

.editor-tabs-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 999px;
}

.editor-tabs-scroll::-webkit-scrollbar-track {
  background: transparent;
}

@media (max-width: 720px) {
  .editor-tabs-wrapper {
    padding: 6px 18px 5px;
  }

  .editor-tab {
    min-width: 82px;
    max-width: 140px;
  }
}
</style>