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

  background: var(--color-base-200, var(--editor-header-bg));
  border-bottom: 1px solid var(--surface-border, var(--border-color));

  padding: 6px 48px 5px;

  overflow: hidden;
  box-sizing: border-box;
}

.editor-tabs-scroll {
  width: 100%;
  min-width: 0;

  display: flex;
  align-items: flex-end;
  gap: 7px;

  overflow-x: auto;
  overflow-y: hidden;

  padding-bottom: 0;
}

.editor-tab {
  position: relative;
  height: 28px;
  min-width: 88px;
  max-width: 180px;

  display: inline-flex;
  align-items: center;
  gap: 7px;

  padding: 0 8px 0 10px;

  border: 1px solid rgba(216, 222, 233, 0.1);
  border-bottom-color: rgba(15, 19, 28, 0.14);
  border-radius: 12px 12px 8px 8px;

  background: var(--color-base-300, var(--button-bg));
  color: var(--color-base-content, var(--text-color));

  cursor: pointer;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.82rem;

  flex-shrink: 0;
  box-shadow:
    inset 0 1px 0 rgba(236, 239, 244, 0.07),
    0 2px 5px rgba(15, 19, 28, 0.14);

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.editor-tab:hover {
  transform: translateY(-2px);
  background: var(--color-neutral, var(--button-hover-bg));
  border-color: rgba(136, 192, 208, 0.24);
  box-shadow:
    inset 0 1px 0 rgba(236, 239, 244, 0.08),
    0 4px 8px rgba(15, 19, 28, 0.18);
}

.editor-tab.active {
  z-index: 2;
  height: 31px;
  transform: translateY(0);
  background: var(--color-base-100, #2e3440);
  border-color: rgba(136, 192, 208, 0.25);
  border-bottom-color: var(--color-base-100, #2e3440);
  color: var(--color-base-content, var(--heading-color));
  box-shadow:
    inset 0 1px 0 rgba(236, 239, 244, 0.08),
    0 4px 9px rgba(15, 19, 28, 0.24);
}

.tab-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;
  flex-shrink: 0;

  background: var(--color-primary, var(--accent-color));
  box-shadow: none;
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

  border-radius: var(--radius-field);

  color: var(--muted-text);
  font-size: 1rem;
  line-height: 1;

  flex-shrink: 0;

  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.tab-close:hover {
  background: rgba(216, 222, 233, 0.12);
  color: var(--color-base-content, var(--danger-color));
}

.editor-tab:focus-visible {
  outline: 2px solid rgba(136, 192, 208, 0.55);
  outline-offset: 2px;
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
