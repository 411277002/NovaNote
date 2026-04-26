<template>
  <div 
    class="space-canvas-viewport" 
    @mousedown.self="startPan"
    @wheel="handleWheel"
  >
    <div class="nebula-container" :style="nebulaStyle">
      <div class="nebula blue"></div>
      <div class="nebula purple"></div>
    </div>

    <div class="stars-parallax" :style="parallaxStyle">
      <div class="star-layer tiny"></div>
      <div class="star-layer medium"></div>
      <div class="star-layer large"></div>
    </div>

    <div class="canvas-content" :style="canvasStyle">
      <slot></slot>
    </div>

    <div class="coords-info">
      Space Explorer | Zoom: {{ (scale * 100).toFixed(0) }}%
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const scale = ref(1);
const offset = reactive({ x: 0, y: 0 });
const isDragging = ref(false);

const canvasStyle = computed(() => ({
  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale.value})`,
  transformOrigin: '0 0',
  transition: isDragging.value ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)'
}));

// 粒子視差：移動量為內容的 15%
const parallaxStyle = computed(() => ({
  transform: `translate(${offset.x * 0.15}px, ${offset.y * 0.15}px) scale(${1 + (scale.value - 1) * 0.3})`,
  transition: isDragging.value ? 'none' : 'transform 0.2s linear'
}));

// 星雲視差：移動量極小，產生極遠距離感
const nebulaStyle = computed(() => ({
  transform: `translate(${offset.x * 0.05}px, ${offset.y * 0.05}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.5s ease-out'
}));

const handleWheel = (e) => {
  e.preventDefault();
  const delta = -e.deltaY * 0.001;
  scale.value = Math.min(Math.max(scale.value + delta, 0.3), 2.5);
};

const startPan = (e) => {
  if (e.button !== 0) return;
  isDragging.value = true;
  const startX = e.clientX - offset.x;
  const startY = e.clientY - offset.y;

  const onMouseMove = (mE) => {
    offset.x = mE.clientX - startX;
    offset.y = mE.clientY - startY;
  };

  const onMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};
</script>

<style scoped>
.space-canvas-viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  /* 極深色背景 */
  background: #020205;
  cursor: grab;
}

.space-canvas-viewport:active { cursor: grabbing; }

/* ============================================================
   🌌 星雲效果 (Nebula)
   ============================================================ */
.nebula-container {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.4;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
}

.nebula.blue {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #1e3a8a, transparent 70%);
  top: 20%; left: 10%;
  animation: float 20s infinite alternate;
}

.nebula.purple {
  width: 700px; height: 700px;
  background: radial-gradient(circle, #4c1d95, transparent 70%);
  bottom: 10%; right: 15%;
  animation: float 25s infinite alternate-reverse;
}

/* ============================================================
   ✨ 粒子星群 (Stars)
   ============================================================ */
.stars-parallax {
  position: absolute;
  inset: -100%;
  width: 300%;
  height: 300%;
  pointer-events: none;
}

.star-layer {
  position: absolute;
  inset: 0;
  background: transparent;
}

/* 使用 box-shadow 生成隨機且大量的星星 */
.star-layer.tiny {
  background-image: radial-gradient(1px 1px at 10% 20%, #fff 100%, transparent);
  background-size: 200px 200px;
  opacity: 0.3;
}

.star-layer.medium {
  background-image: radial-gradient(1.5px 1.5px at 50% 50%, #fff 100%, transparent);
  background-size: 350px 350px;
  opacity: 0.5;
  animation: twinkle 4s infinite ease-in-out;
}

.star-layer.large {
  background-image: radial-gradient(2px 2px at 80% 10%, #646cff 100%, transparent);
  background-size: 500px 500px;
  opacity: 0.2;
}

/* ============================================================
   動畫與內容
   ============================================================ */
@keyframes float {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(50px, 100px) scale(1.1); }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}

.canvas-content {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 10;
}

:deep(.canvas-content > *) { pointer-events: auto; }

.coords-info {
  position: fixed;
  bottom: 25px;
  left: 300px;
  color: rgba(255, 255, 255, 0.4);
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  letter-spacing: 1px;
  text-transform: uppercase;
  pointer-events: none;
}
</style>