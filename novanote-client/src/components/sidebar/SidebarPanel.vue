<template>
  <aside class="sidebar-panel" :class="{ 'is-collapsed': isCollapsed }">
    <button class="toggle-btn" @click="isCollapsed = !isCollapsed">
      {{ isCollapsed ? '→' : '←' }}
    </button>

    <div class="sidebar-content" v-show="!isCollapsed">
      <header class="sidebar-header">
        <h3>星系導航</h3>
      </header>

      <div class="search-wrapper">
        <input 
          v-model="searchQuery" 
          @input="handleInput"
          type="text" 
          placeholder="搜尋卡片或星球..." 
          class="search-input"
        />
        <span v-if="searchQuery" class="clear-icon" @click="searchQuery = ''">×</span>
      </div>

      <section class="sidebar-section">
        <h4 class="section-title">我的星球</h4>
        <ul class="item-list">
          <li 
            v-for="planet in planetsStore.planets" 
            :key="planet.id" 
            class="planet-item nav-item" 
            :class="getSearchStatus(planet.name)" 
            @click="$emit('select-planet', planet)"
          >
            <span class="planet-icon">🪐</span>
            <span class="name">{{ planet.name }}</span>
            <span class="count">{{ getNoteCount(planet.id) }}</span>
          </li>
        </ul>
      </section>

      <section class="sidebar-section">
        <h4 class="section-title">漂浮碎片</h4>
        <ul class="item-list">
          <li 
            v-for="note in notesStore.floatingNotes" 
            :key="note.id" 
            class="note-item nav-item"
            :class="getSearchStatus(note.title || '無標題')"
            @click="$emit('select-note', note)"
          >
            <span class="note-icon">📝</span>
            <span class="name">{{ note.title || '無標題' }}</span>
          </li>
        </ul>
      </section>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { useNotesStore } from '../../stores/notes';
import { usePlanetsStore } from '../../stores/planets';

const notesStore = useNotesStore();
const planetsStore = usePlanetsStore();
const isCollapsed = ref(false);

const searchQuery = ref('');

const props = defineProps(['searchQuery']);
const emit = defineEmits(['update:searchQuery', 'select-planet', 'select-note']);

// 當輸入時，通知父層更新
const handleInput = (e) => {
  emit('update:searchQuery', e.target.value);
};

const getNoteCount = (planetId) => {
  return notesStore.allNotes.filter(n => n.planet_id === planetId).length;
};

const getSearchStatus = (title) => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return ''; 
  
  const isMatch = title.toLowerCase().includes(query);
  return isMatch ? 'highlight' : 'dim';
};
</script>

<style scoped>
/* ============================================================
   1. 側邊欄基礎佈局
   ============================================================ */
.sidebar-panel {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 260px;
  /* 使用變數控制背景與文字 */
  background: var(--sidebar-bg);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
              background-color 0.3s, 
              color 0.3s;
  z-index: 100;
  color: var(--text-color);
}

.sidebar-panel.is-collapsed {
  width: 0;
}

/* 收納按鈕 */
.toggle-btn {
  position: absolute;
  right: -30px;
  top: 20px;
  width: 30px;
  height: 60px;
  background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-left: none;
  border-radius: 0 8px 8px 0;
  color: var(--text-color);
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.toggle-btn:hover {
  opacity: 1;
}

.sidebar-content {
  padding: 80px 20px 20px;
  height: 100%;
  overflow-y: auto;
}

/* ============================================================
   2. 標題與搜尋框
   ============================================================ */
.sidebar-header h3 {
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--accent-color);
  letter-spacing: 2px;
}

.sidebar-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 0.8rem;
  color: #888; /* 固定灰色，在深淺模式皆可讀 */
  text-transform: uppercase;
  margin-bottom: 15px;
  letter-spacing: 1px;
}

.search-wrapper {
  position: relative;
  margin: 15px 0 25px;
  padding: 0 5px;
}

.search-input {
  width: 100%;
  background: var(--search-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 10px 15px;
  color: var(--text-color);
  font-size: 0.85rem;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 12px rgba(100, 108, 255, 0.2);
}

.clear-icon {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
  font-size: 1.2rem;
  transition: color 0.2s;
}

.clear-icon:hover {
  color: var(--accent-color);
}

/* ============================================================
   3. 導覽項目與搜尋狀態 (高亮/變暗)
   ============================================================ */
.item-list {
  list-style: none;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: var(--item-hover);
}

/* 🟢 搜尋狀態 B: 搜到了 - 高亮且向右偏移 */
.nav-item.highlight {
  background: var(--accent-color) !important;
  color: white !important; /* 搜到時強制白色文字 */
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  opacity: 1 !important;
}

.nav-item.highlight .name, 
.nav-item.highlight .count {
  color: var(--text-color);
}

/* 🔴 搜尋狀態 A: 沒搜到 - 變暗且無視點擊 */
.nav-item.dim {
  opacity: 0.15 !important;
  filter: grayscale(100%) blur(0.5px);
  transform: scale(0.96);
  pointer-events: none;
}

/* 圖示與文字 */
.planet-icon, .note-icon {
  margin-right: 12px;
  font-size: 1.1rem;
}

.name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.count {
  font-size: 0.75rem;
  background: var(--item-hover);
  padding: 2px 8px;
  border-radius: 10px;
  color: #888;
}

/* 捲軸樣式 (美化) */
.sidebar-content::-webkit-scrollbar {
  width: 4px;
}
.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
</style>