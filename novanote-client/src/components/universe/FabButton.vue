<template>
  <div class="fab-container">
    <transition-group name="fab-items">
      <div v-if="isOpen" class="fab-menu" key="menu">
        <button class="sub-fab planet-fab" @click="emitAndClose('create-planet')">
          <span class="icon">🪐</span>
        </button>
        <button class="sub-fab note-fab" @click="emitAndClose('create-note')">
          <span class="icon">📝</span>
        </button>
      </div>
    </transition-group>

    <button 
      class="main-fab" 
      :class="{ 'is-open': isOpen }"
      @click="toggleMenu"
    >
      <div class="custom-icon">
        <div class="line horizontal"></div>
        <div class="line vertical"></div>
      </div>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const emit = defineEmits(['create-note', 'create-planet']);
const isOpen = ref(false);

const toggleMenu = () => { isOpen.value = !isOpen.value; };
const emitAndClose = (eventName) => {
  emit(eventName);
  isOpen.value = false;
};
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1000;
}

/* 主按鈕：尺寸從 60px 縮小到 52px */
.main-fab {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
  background: linear-gradient(135deg, var(--accent-color), #8d94ff);
  padding: 0;
  position: relative;
}

/* 只需要這裡旋轉一次 135 度 */
.main-fab.is-open {
  background: #3a3a3e;
  transform: rotate(135deg); 
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.custom-icon {
  position: relative;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 移除旋轉動畫，讓父層控制就好 */
}

.line {
  position: absolute;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.horizontal {
  width: 18px;
  height: 2px;
}

.vertical {
  width: 2px;
  height: 18px;
}

/* 修正重點：不要在這裡統一修改兩根線的寬高 */
.main-fab.is-open .line {
  background-color: #bbb;
}

/* 如果你想在變成 X 時讓線縮短一點，要分開寫 */
.main-fab.is-open .horizontal {
  width: 16px;
}
.main-fab.is-open .vertical {
  height: 16px;
}

/* --- 子選單 --- */
.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.sub-fab {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: #2a2a2e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);
  transition: all 0.2s;
}

.sub-fab:hover {
  transform: scale(1.1);
  background: #35353a;
}

.sub-fab .icon { font-size: 20px; }

/* 動畫 */
.fab-items-enter-active, .fab-items-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.fab-items-enter-from, .fab-items-leave-to {
  opacity: 0;
  transform: translateY(15px) scale(0.7);
}
</style>