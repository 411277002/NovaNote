<template>
  <div 
    class="universe-container"
    @mousedown="onCanvasMouseDown"
    @mouseup="onCanvasMouseUp"
  >
    <SidebarPanel 
      v-model:search-query="searchQuery"
      @mousedown.stop
      @select-planet="openPlanet" 
      @select-note="enterEditor" 
    />

    <nav class="universe-nav" @mousedown.stop>
      <div class="logo">NovaNote</div>
      <div class="theme-switcher-wrapper">
        <button class="theme-toggle-btn" @click="toggleTheme">
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
        </button>
      </div>
      <div class="user-info">
        <span>探索者：{{ authStore.user?.username }}</span>
        <button @click="handleLogout" class="logout-btn">登出</button>
      </div>
    </nav>

    <SpaceCanvas ref="canvasRef">
      <PlanetNode 
        v-for="planet in planetsStore.planets" 
        :key="'p-' + planet.id"
        :planet="planet"
        :canvas-scale="currentScale"
        :class="getSearchStatus(planet.name)"
        @mousedown.stop
        @click="openPlanet"
        @contextmenu="handleContextMenu($event, planet, 'planet')"
      />

      <NoteCard 
        v-for="note in notesStore.floatingNotes" 
        :key="'n-' + note.id"
        :note="note"
        :canvas-scale="currentScale"
        :class="getSearchStatus(note.title || '無標題', note.tags)"
        @mousedown.stop
        @edit="enterEditor"
        @filter-tag="handleTagFilter"
        @contextmenu="handleContextMenu($event, note, 'note')"
      />
    </SpaceCanvas>

    <FabButton 
      @mousedown.stop
      @create-note="handleCreateNote"
      @create-planet="showPlanetModal = true"
    />

    <div v-if="showPlanetModal" class="modal-overlay" @click.self="showPlanetModal = false">
      <div class="modal-card" @mousedown.stop>
        <h3>誕生新星球</h3>
        <div class="modal-field">
          <label>星球名稱</label>
          <input v-model="newPlanet.name" class="modal-input" placeholder="命名這顆星體..." />
        </div>
        <div class="modal-field">
          <label>星球地貌 (樣式)</label>
          <select v-model="newPlanet.texture_type" class="modal-select">
            <option value="rocky">🪨 岩石行星 (Rocky)</option>
            <option value="gas">☁️ 氣體巨星 (Gas)</option>
            <option value="ringed">🪐 帶環行星 (Ringed)</option>
          </select>
        </div>
        <div class="modal-field">
          <label>星系色調</label>
          <div class="color-picker-wrapper">
            <input type="color" v-model="newPlanet.color" />
            <span>{{ newPlanet.color }}</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showPlanetModal = false">取消</button>
          <button class="confirm-btn" @click="handleCreatePlanet">誕生</button>
        </div>
      </div>
    </div>

    <div v-if="selectedPlanet" class="planet-overlay" @click.self="closePlanet">
      <div class="planet-content-box" :style="{ borderColor: selectedPlanet.color }" @mousedown.stop>
        <header class="planet-header">
          <h2 :style="{ color: selectedPlanet.color }">🪐 {{ selectedPlanet.name }}</h2>
          <button class="close-overlay-btn" @click="closePlanet">✕</button>
        </header>

        <div class="notes-grid">
          <div v-for="note in notesInPlanet" 
               :key="note.id" 
               class="inner-note-card"
               @click="enterEditor(note)"
               @contextmenu.prevent="handleContextMenu($event, note, 'note')">
            <h4>{{ note.title }}</h4>
            <div v-html="note.content" class="note-summary"></div>
            <div class="inner-tags" v-if="note.tags?.length">
              <span v-for="tag in note.tags" :key="tag" class="mini-tag">#{{ tag }}</span>
            </div>
          </div>
          <div v-if="notesInPlanet.length === 0" class="empty-state">此星球尚無靈感軌道...</div>
        </div>
      </div>
    </div>

    <div v-if="contextMenu.show" 
         class="custom-context-menu" 
         :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
         @click.stop>
      <button v-if="contextMenu.type === 'note' && contextMenu.target?.planet_id" 
              @click="handleLeavePlanet" 
              class="menu-option">🚀 離開星球 (回到宇宙)</button>
      <button @click="confirmDelete" class="delete-option">🗑️ 抹除這個{{ contextMenu.type === 'note' ? '靈感' : '星球' }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useNotesStore } from '../stores/notes';
import { usePlanetsStore } from '../stores/planets';

import SidebarPanel from '../components/sidebar/SidebarPanel.vue';
import SpaceCanvas from '../components/universe/SpaceCanvas.vue';
import PlanetNode from '../components/universe/PlanetNode.vue';
import NoteCard from '../components/universe/NoteCard.vue';
import FabButton from '../components/universe/FabButton.vue';

const authStore = useAuthStore();
const notesStore = useNotesStore();
const planetsStore = usePlanetsStore();
const router = useRouter();

// --- 實例引用 ---
const canvasRef = ref(null);

// --- 狀態控制 ---
const showPlanetModal = ref(false);
const selectedPlanet = ref(null);
const activeFilterTag = ref(null); 
const searchQuery = ref('');
const isDark = ref(true);
const startPos = reactive({ x: 0, y: 0 });

const contextMenu = reactive({ show: false, x: 0, y: 0, target: null, type: '' });
const newPlanet = reactive({ name: '', color: '#646cff', texture_type: 'rocky' });

// 🔴 重要：獲取當前畫布縮放率，傳遞給子組件做座標校正
const currentScale = computed(() => canvasRef.value?.scale || 1);

// 獲取當前星球內的靈感筆記
const notesInPlanet = computed(() => {
  if (!selectedPlanet.value) return [];
  // 🔴 這裡改用 allNotes
  return notesStore.allNotes?.filter(n => n.planet_id == selectedPlanet.value.id) || [];
});

// --- 核心邏輯 ---

// 背景點擊監聽（用於區分拖拽與點擊清空搜尋）
const onCanvasMouseDown = (e) => {
  startPos.x = e.clientX;
  startPos.y = e.clientY;
};

const onCanvasMouseUp = (e) => {
  const diffX = Math.abs(e.clientX - startPos.x);
  const diffY = Math.abs(e.clientY - startPos.y);
  if (diffX < 5 && diffY < 5) {
    activeFilterTag.value = null;
    searchQuery.value = '';
  }
};

// 搜尋與標籤過濾狀態計算
const getSearchStatus = (title, tags = []) => {
  const query = searchQuery.value?.trim().toLowerCase();
  const filter = activeFilterTag.value?.trim();

  if (filter) {
    const isMatch = tags && tags.some(t => String(t).trim() === filter);
    return isMatch ? 'highlight' : 'dim';
  }
  
  if (!query) return '';
  
  const titleMatch = title.toLowerCase().includes(query);
  const tagMatch = tags && tags.some(t => String(t).toLowerCase().includes(query));
  
  return (titleMatch || tagMatch) ? 'highlight' : 'dim';
};

const handleTagFilter = (tag) => {
  activeFilterTag.value = (activeFilterTag.value === tag) ? null : tag;
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('nova-theme', theme);
};

const handleCreatePlanet = async () => {
  if (!newPlanet.name) return alert('請先為這顆星球命名');
  try {
    await planetsStore.createPlanet({ 
      ...newPlanet, 
      user_id: authStore.user.id, 
      x_pos: 0.5, 
      y_pos: 0.5 
    });
    showPlanetModal.value = false;
    // 重設表單
    Object.assign(newPlanet, { name: '', texture_type: 'rocky', color: '#646cff' });
  } catch (err) { console.error("星球誕生失敗:", err); }
};

// 路由與資料操作
const handleLogout = () => { authStore.logout(); router.push('/'); };
const handleCreateNote = () => router.push('/editor/new');
const enterEditor = (note) => { router.push(`/editor/${note.id || note}`); };
const openPlanet = (planet) => {
  selectedPlanet.value = planet;
  const allNotes = notesStore.allNotes || []; 
};
const closePlanet = () => { selectedPlanet.value = null; };
const closeMenu = () => { contextMenu.show = false; };

const handleContextMenu = (e, item, type) => {
  e.preventDefault();
  Object.assign(contextMenu, { show: true, x: e.clientX, y: e.clientY, target: item, type });
};

const confirmDelete = async () => {
  const { target, type } = contextMenu;
  if (confirm(`確定要抹除「${type === 'note' ? target.title : target.name}」嗎？`)) {
    try {
      if (type === 'note') {
        await notesStore.deleteNote(target.id);
      } else {
        await planetsStore.deletePlanet(target.id);
      }
      contextMenu.show = false;
    } catch (err) { console.error(err); }
  }
};

const handleLeavePlanet = async () => {
  try { 
    await notesStore.moveNoteToPlanet(contextMenu.target.id, null); 
    contextMenu.show = false; 
  } catch (err) { console.error(err); }
};

// --- 生命週期 ---
onMounted(() => {
  const savedTheme = localStorage.getItem('nova-theme');
  if (savedTheme === 'light') {
    isDark.value = false;
    document.documentElement.setAttribute('data-theme', 'light');
  }
  notesStore.refreshData();
  planetsStore.fetchPlanets();
  window.addEventListener('click', closeMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeMenu);
});
</script>

<style scoped>
/* 1. 搜尋狀態樣式：控制子組件的縮放與濾鏡 */
:deep(.PlanetNode), :deep(.floating-card) {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  opacity: 1;
  filter: none;
  transform: scale(1);
  pointer-events: auto;
}

:deep(.dim) {
  opacity: 0.15 !important;
  filter: grayscale(1) blur(2px) brightness(0.7) !important;
  transform: scale(0.9) !important;
  pointer-events: none;
}

:deep(.highlight) {
  opacity: 1 !important;
  filter: drop-shadow(0 0 15px #646cff) !important;
  transform: scale(1.1) !important;
  z-index: 500 !important;
  position: relative;
}

/* 2. 佈局容器 */
.universe-container {
  width: 100vw;
  height: 100vh;
  background-color: #020205 !important; 
  overflow: hidden;
  position: relative;
}

.universe-nav {
  position: fixed;
  top: 0; width: 100%; padding: 25px 40px;
  display: flex; justify-content: space-between; align-items: center;
  z-index: 150; color: white !important; pointer-events: none;
}

.theme-switcher-wrapper, .logo, .user-info { pointer-events: auto; }
.logo { font-size: 1.5rem; font-weight: bold; letter-spacing: 2px; color: #646cff; }

/* 3. 元素與按鈕樣式 */
.theme-toggle-btn {
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2); padding: 8px 16px;
  border-radius: 20px; cursor: pointer; color: white; transition: 0.3s;
}
.theme-toggle-btn:hover { transform: scale(1.1); background: rgba(255, 255, 255, 0.2); }

.logout-btn {
  background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2);
  color: white; padding: 6px 15px; border-radius: 8px; cursor: pointer; margin-left: 10px;
}

/* 4. 彈窗與 Overlay */
.modal-overlay, .planet-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px); display: flex; justify-content: center; align-items: center; z-index: 3000;
}

.modal-card { 
  background: var(--sidebar-bg); padding: 30px; border-radius: 20px; 
  width: 360px; color: var(--text-color); border: 1px solid var(--border-color);
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.planet-content-box {
  width: 80%; height: 80%; background: var(--sidebar-bg); 
  color: var(--text-color); border-radius: 30px; border: 1px solid var(--border-color); 
  padding: 40px; overflow-y: auto; position: relative;
}

.planet-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;
}

.close-overlay-btn {
  background: none; border: none; color: var(--text-color); font-size: 1.5rem; cursor: pointer;
}

/* 5. 內部卡片網格 */
.notes-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;
}

.inner-note-card {
  background: var(--search-bg); padding: 22px; border-radius: 18px;
  border: 1px solid var(--border-color); cursor: pointer; transition: 0.3s;
}
.inner-note-card:hover { transform: translateY(-5px); border-color: #646cff; }

/* 6. 右鍵選單 */
.custom-context-menu {
  position: fixed; background: var(--sidebar-bg);
  border: 1px solid var(--border-color);
  border-radius: 10px; z-index: 9999; min-width: 190px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5); padding: 8px;
}

.menu-option, .delete-option {
  width: 100%; padding: 10px 14px; border: none; background: none; 
  text-align: left; cursor: pointer; border-radius: 8px; font-size: 0.9rem;
  color: var(--text-color); display: flex; align-items: center; gap: 10px;
}
.delete-option { color: #ff5a5a; font-weight: bold; }
.menu-option:hover, .delete-option:hover { background: var(--item-hover); }

.mini-tag { 
  font-size: 0.7rem; background: #646cff; color: white; 
  padding: 2px 8px; border-radius: 5px; margin-right: 6px; 
}

@keyframes menuShow {
  from { opacity: 0; transform: translateY(-5px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 7. Modal 內部組件樣式 */
.modal-card h3 { margin-bottom: 25px; text-align: center; letter-spacing: 1px; }
.modal-field { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
.modal-input, .modal-select {
  width: 100%; background: var(--search-bg); border: 1px solid var(--border-color);
  color: var(--text-color); padding: 12px; border-radius: 12px; outline: none;
}
.modal-input:focus { border-color: #646cff; }
.color-picker-wrapper {
  display: flex; align-items: center; gap: 15px; background: var(--search-bg);
  padding: 8px 15px; border-radius: 12px; border: 1px solid var(--border-color);
}
.modal-actions { display: flex; gap: 12px; margin-top: 30px; }
.modal-actions button { flex: 1; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: bold; border: none; }
.cancel-btn { background: rgba(255,255,255,0.05); color: var(--text-color); border: 1px solid var(--border-color) !important; }
.confirm-btn { background: #646cff; color: white; }
</style>