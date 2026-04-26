<template>
  <div 
    class="floating-card"
    :style="cardStyle"
    @mousedown="onStartDrag"
    @contextmenu.prevent="onRightClick"
  >
    <div class="card-tags" v-if="note.tags && note.tags.length > 0">
      <span 
        v-for="tag in note.tags" 
        :key="tag" 
        class="mini-tag"
        @mousedown.stop
        @click.stop="onTagClick(tag)"
      >
        #{{ tag }}
      </span>
    </div>

    <div class="card-content">
      <h4 class="title">{{ note.title || '無標題' }}</h4>
      <div v-html="note.content" class="content-preview"></div>
    </div>
    
    <div class="card-glow"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useNotesStore } from '../../stores/notes';

const props = defineProps({
  note: { type: Object, required: true },
  canvasScale: { type: Number, default: 1 }
});

const emit = defineEmits(['contextmenu', 'edit', 'filter-tag']);
const notesStore = useNotesStore();

const cardStyle = computed(() => ({
  left: (props.note.x_pos * 100) + '%',
  top: (props.note.y_pos * 100) + '%',
  transition: 'box-shadow 0.3s, transform 0.2s, opacity 0.4s, filter 0.4s'
}));

const onTagClick = (tag) => emit('filter-tag', tag);
const onRightClick = (event) => emit('contextmenu', event, props.note);

const onStartDrag = (event) => {
  if (event.button !== 0) return;
  event.stopPropagation();

  const el = event.currentTarget;
  const startX = event.clientX;
  const startY = event.clientY;
  const initialLeft = el.offsetLeft;
  const initialTop = el.offsetTop;
  let moved = false;

  const onMouseMove = (e) => {
    const deltaX = (e.clientX - startX) / props.canvasScale;
    const deltaY = (e.clientY - startY) / props.canvasScale;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      moved = true;
      el.style.transition = 'none';
      el.style.zIndex = '2000';
      el.style.left = (initialLeft + deltaX) + 'px';
      el.style.top = (initialTop + deltaY) + 'px';
      el.style.transform = 'scale(1.05) rotate(1deg)';
    }
  };

  const onMouseUp = async (e) => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    el.style.zIndex = '';
    el.style.transform = '';

    // 如果只是點擊，沒有移動
    if (!moved) {
      emit('edit', props.note);
      return;
    }

    // --- 🟢 碰撞偵測邏輯 ---
    const targets = document.elementsFromPoint(e.clientX, e.clientY);
    let targetPlanetId = null;
    
    for (const target of targets) {
      const planetEl = target.closest('.PlanetNode');
      if (planetEl) {
        targetPlanetId = planetEl.dataset.id;
        break;
      }
    }

    if (targetPlanetId) {
      console.log(`🚀 成功偵測到星球 ID: ${targetPlanetId}`);
      try {
        await notesStore.moveNoteToPlanet(props.note.id, targetPlanetId);
      } catch (err) {
        console.error("歸類失敗", err);
      }
    } else {
      // --- 🔵 若沒碰到星球，則更新宇宙座標 ---
      const parent = el.offsetParent;
      if (parent) {
        const finalX = el.offsetLeft / parent.offsetWidth;
        const finalY = el.offsetTop / parent.offsetHeight;
        console.log("📍 更新卡片宇宙位置:", finalX, finalY);
        await notesStore.updateNotePosition(props.note.id, finalX, finalY);
      }
    }

    // 恢復動畫效果
    el.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
  }; // 🔴 確保 onMouseUp 在這裡結束

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>

<style scoped>
.floating-card {
  position: absolute;
  width: 180px;
  min-height: 110px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 15px;
  cursor: grab;
  user-select: none;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
  z-index: 10; 
}

.floating-card:active { cursor: grabbing; }

.floating-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(100, 108, 255, 0.5);
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.mini-tag {
  font-size: 0.65rem;
  background: rgba(100, 108, 255, 0.2);
  color: #a5a9ff;
  padding: 1px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-tag:hover {
  background: #646cff;
  color: white;
}

.title {
  margin: 0 0 6px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #efefff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-preview {
  font-size: 0.85rem;
  color: #aaa;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 5px;
  height: 5px;
  background: #646cff;
  border-radius: 50%;
  box-shadow: 0 0 8px #646cff;
  opacity: 0.6;
}

/* 高亮與變暗效果 */
:global(.floating-card.highlight) {
  opacity: 1 !important;
  border-color: #646cff !important;
  box-shadow: 0 0 30px rgba(100, 108, 255, 0.6) !important;
  transform: scale(1.1) !important;
  z-index: 500 !important;
  filter: none !important;
}

:global(.floating-card.dim) {
  opacity: 0.15 !important;
  filter: grayscale(1) blur(2px) brightness(0.6) !important;
  transform: scale(0.9) !important;
  pointer-events: none !important;
  z-index: 1 !important;
}
</style>