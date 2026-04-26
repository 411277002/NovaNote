<template>
  <div 
    class="PlanetNode" 
    :data-id="planet.id"
    :style="planetStyle"
    @mousedown="startDrag"
    @click="handleClick($event)"
  >
    <svg v-if="planet.texture_type === 'ringed'" class="planet-ring" viewBox="0 0 140 140">
      <ellipse 
        cx="70" cy="70" rx="65" ry="20" 
        class="ring-shape"
        :style="{ stroke: planet.color + 'aa' }"
      />
    </svg>

    <div 
      class="planet-body" 
      :class="textureClass"
      :style="bodyStyle"
    >
      <div class="planet-glow" :style="glowStyle"></div>
      <div class="planet-surface-overlay"></div>
    </div>

    <span class="planet-name">{{ planet.name }}</span>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue';
import { usePlanetsStore } from '../../stores/planets';

const props = defineProps({
  planet: { type: Object, required: true },
  // 接收父組件傳來的縮放比例，確保移動與縮放同步
  canvasScale: { type: Number, default: 1 }
});

const emit = defineEmits(['click']);
const planetsStore = usePlanetsStore();

const isDragging = ref(false);
const hasMoved = ref(false);

// 樣式計算：根據 texture_type 切換 CSS class
const textureClass = computed(() => {
  const type = props.planet.texture_type ? String(props.planet.texture_type).toLowerCase() : 'rocky';
  return `texture-${type}`;
});

// 外層容器位置與動態
const planetStyle = computed(() => ({
  left: `${props.planet.x_pos * 100}%`,
  top: `${props.planet.y_pos * 100}%`,
  zIndex: isDragging.value ? 1000 : 10,
  cursor: isDragging.value ? 'grabbing' : 'grab',
  transition: isDragging.value ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  transform: `translate(-50%, -50%) ${isDragging.value ? 'scale(1.15)' : 'scale(1)'}`
}));

const bodyStyle = computed(() => ({
  '--planet-color': props.planet.color || '#646cff'
}));

const glowStyle = computed(() => ({
  boxShadow: `0 0 45px var(--planet-color)`
}));

// --- 拖拽邏輯 ---
const startDrag = (e) => {
  if (e.button !== 0) return; // 僅限左鍵
  
  e.preventDefault();
  e.stopPropagation();

  isDragging.value = true;
  hasMoved.value = false;

  const startX = e.clientX;
  const startY = e.clientY;
  const initialX = props.planet.x_pos;
  const initialY = props.planet.y_pos;

  const onMouseMove = (moveEvent) => {
    // 考慮畫布縮放比例進行座標換算 (dx/dy 為 0~1 的比例)
    const dx = (moveEvent.clientX - startX) / (window.innerWidth * props.canvasScale);
    const dy = (moveEvent.clientY - startY) / (window.innerHeight * props.canvasScale);
    
    // 判斷是否真正移動（過濾微小顫抖）
    if (Math.abs(dx * 1000) > 1 || Math.abs(dy * 1000) > 1) {
      hasMoved.value = true;
      props.planet.x_pos = initialX + dx;
      props.planet.y_pos = initialY + dy;
    }
  };

  const onMouseUp = async () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    if (hasMoved.value) {
      // 同步位置到後端
      await planetsStore.updatePlanetPosition(
        props.planet.id, 
        props.planet.x_pos, 
        props.planet.y_pos
      );
    }
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

// --- 點擊邏輯 ---
const handleClick = (e) => {
  // 🔴 關鍵修正：確保接收到真正的 event 物件再執行 stopPropagation
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }

  // 只有在沒有移動的情況下才判定為「開啟星球」
  if (!hasMoved.value) {
    emit('click', props.planet);
  }
};

onBeforeUnmount(() => {
  // 組件卸載時清理監聽器
  document.removeEventListener('mousemove', null);
  document.removeEventListener('mouseup', null);
});
</script>

<style scoped>
/* 核心樣式 */
.PlanetNode {
  position: absolute;
  width: 140px; 
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  background: transparent !important;
}

.planet-body {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  z-index: 5;
  box-shadow: inset -10px -10px 20px rgba(0, 0, 0, 0.4);
  background-color: var(--planet-color);
  transition: background 0.3s ease;
}

/* 紋理樣式 */
.texture-gas {
  background-image: repeating-linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 8px,
    transparent 8px,
    transparent 16px
  ) !important;
}

.texture-rocky {
  background-image: radial-gradient(circle at 30% 30%, transparent 0%, rgba(0, 0, 0, 0.3) 100%) !important;
}

.texture-ringed {
  background-image: radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.2) 0%, transparent 70%) !important;
}

.planet-name {
  position: absolute;
  bottom: -5px;
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.planet-ring {
  position: absolute;
  width: 150px;
  height: 150px;
  pointer-events: none;
  transform: rotate(-20deg);
  z-index: 1;
}

.ring-shape {
  fill: none;
  stroke-width: 5;
  opacity: 0.6;
}

.planet-surface-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
  pointer-events: none;
}

.planet-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  z-index: -1;
  opacity: 0.4;
  filter: blur(15px);
  pointer-events: none;
}

.planet-glow, .planet-ring, .planet-surface-overlay {
  pointer-events: none !important; /* 🟢 讓偵測光束穿透裝飾層 */
}
</style>