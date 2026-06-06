<template>
  <div id="app-container">
    <RouterView :key="$route.fullPath" />
  </div>
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #050508; /* 宇宙深空底色 */
  color: #ffffff;
}

body {
  width: 100vw;
  height: 100vh;
  overflow: hidden; /* 防止出現雙重滾動條，因為我們的畫布是滿版 */
}

#app-container {
  width: 100%;
  height: 100%;
}

/* 2. 頁面切換動畫 (Fade Transition) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 3. 自定義全域滾動條 (Webkit) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 108, 255, 0.4); /* 點燃主色調 */
}

/* 4. 共用按鈕基礎 (選配) */
button {
  font-family: inherit;
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.95);
}
</style>