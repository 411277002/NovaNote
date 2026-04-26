<template>
  <div class="landing-container">
    <div class="starfield-namespace">
      <div class="stars-parallax layer-bg"></div>
      <div class="stars-parallax layer-mid"></div>
      <div class="stars-parallax layer-blue"></div>
      <div class="stars-parallax layer-fg"></div>
    </div>
    
    <div class="aurora-borealis">
      <div class="aurora-beam beam-1"></div>
      <div class="aurora-beam beam-2"></div>
    </div>

    <div class="nebula-overlay"></div>

    <main class="hero-section">
      <div class="hero-content">
        <div class="brand-header">
          <h1 class="main-title">NOVANOTE</h1>
        </div>

        <p class="hero-tagline">MAPPING THE GALAXY OF YOUR THOUGHTS</p>

        <div class="cta-wrapper">
          <button class="launch-btn" @click="showAuth = true">
            <div class="btn-scanner"></div>
            <span class="btn-text">LAUNCH INTERFACE</span>
          </button>
          <p class="btn-hint">CLICK TO ACCESS THE GALAXY</p>
        </div>

        <div class="footer-metadata">
          <div class="meta-item">VER: 3.0.415</div>
          <div class="meta-item">ENCRYPTION: AES-256</div>
          <div class="meta-item">COORD: 22.62, 120.30</div>
        </div>
      </div>
    </main>

    <transition name="modal-fade">
      <AuthModal 
        v-if="showAuth" 
        @close="showAuth = false" 
        class="auth-modal-overlay"
      />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AuthModal from '../components/auth/AuthModal.vue';

const router = useRouter();
const authStore = useAuthStore();
const showAuth = ref(false);

onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/universe');
  }
});
</script>

<style scoped>
/* --- 基礎容器 --- */
.landing-container {
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  font-family: 'Inter', -apple-system, sans-serif;
}

/* 粒子系統 (保持不變) */
.starfield-namespace {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.stars-parallax { position: absolute; width: 1px; height: 1px; background: transparent; }
.layer-bg { box-shadow: 15vw 85vh #fff, 85vw 15vh #fff, 50vw 50vh #fff, 10vw 10vh #fff, 90vw 90vh #fff, 20vw 30vh #fff, 70vw 60vh #fff, 40vw 80vh #fff, 60vw 20vh #fff, 30vw 70vh #fff, 80vw 40vh #fff, 5vw 95vh #fff, 95vw 5vh #fff, 45vw 15vh #fff, 55vw 85vh #fff, 12vw 62vh #fff, 88vw 38vh #fff, 28vw 12vh #fff, 72vw 88vh #fff, 38vw 52vh #fff, 62vw 48vh #fff; animation: animStar 200s linear infinite, twinkle 5s infinite; opacity: 0.3; }
.layer-mid { width: 2px; height: 2px; box-shadow: 25vw 75vh #fff, 75vw 25vh #fff, 50vw 10vh #fff, 90vw 50vh #fff, 10vw 90vh #fff, 30vw 20vh #fff, 60vw 80vh #fff, 80vw 30vh #fff, 20vw 60vh #fff, 45vw 95vh #fff, 5vw 45vh #fff; animation: animStar 100s linear infinite; opacity: 0.5; }
.layer-blue { width: 1px; height: 1px; box-shadow: 18vw 82vh #646cff, 82vw 18vh #646cff, 48vw 52vh #646cff, 12vw 12vh #646cff, 92vw 92vh #646cff, 22vw 32vh #646cff, 72vw 62vh #646cff; animation: animStar 150s linear infinite; opacity: 0.4; }
.layer-fg { width: 3px; height: 3px; box-shadow: 10vw -10vh #fff, 30vw -50vh #fff, 60vw -30vh #fff, 80vw -70vh #fff, 95vw -20vh #fff; animation: animStarFG 30s linear infinite; opacity: 0.8; filter: blur(1px); }
@keyframes animStar { from { transform: translateY(0); } to { transform: translateY(-2000px); } }
@keyframes animStarFG { from { transform: translateY(-50vh); } to { transform: translateY(150vh); } }
@keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.1; } }

/* 🔴 重點：CSS 極光特效 */
.aurora-borealis {
  position: absolute;
  inset: 0;
  z-index: 1; /* 高於恆星，低於內容 */
  opacity: 0.5;
  mix-blend-mode: screen; /* 混合模式，讓光暈更自然 */
  pointer-events: none;
}

.aurora-beam {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px); /* 關鍵：高模糊度營造虛幻感 */
  opacity: 0.1; /* 🔴 保持極低透明度，不喧賓奪主 */
}

/* 極光束 1：電光藍 */
.beam-1 {
  top: -20%;
  left: -10%;
  width: 80vw;
  height: 80vh;
  background: #00d2ff;
  animation: auroraFlow1 30s ease-in-out infinite alternate;
}

/* 極光束 2：神秘紫 */
.beam-2 {
  bottom: -20%;
  right: -10%;
  width: 90vw;
  height: 90vh;
  background: #a855f7;
  animation: auroraFlow2 40s ease-in-out infinite alternate-reverse;
}

/* 極光流動動畫 1 */
@keyframes auroraFlow1 {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(10vw, 10vh) rotate(5deg) scale(1.1); }
  100% { transform: translate(-5vw, 15vh) rotate(-3deg) scale(1); }
}

/* 極光流動動畫 2 */
@keyframes auroraFlow2 {
  0% { transform: translate(0, 0) rotate(0deg) scale(1); }
  50% { transform: translate(-10vw, -10vh) rotate(-5deg) scale(1.05); }
  100% { transform: translate(5vw, -15vh) rotate(3deg) scale(1); }
}

/* nebula (保持不變) */
.nebula-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(100, 108, 255, 0.05) 0%, transparent 70%);
  z-index: 2; /* 位於極光之上，提供核心基調 */
  pointer-events: none;
}

/* --- 剩餘內容樣式保持不變 --- */
.hero-section { position: relative; z-index: 10; text-align: center; }
.main-title { font-size: clamp(3rem, 8vw, 7rem); font-weight: 800; font-style: italic; letter-spacing: 14px; color: #fff; margin: 0; text-transform: uppercase; filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4)); }
.hero-tagline { color: rgba(255, 255, 255, 0.3); font-size: 0.8rem; letter-spacing: 8px; margin: 60px 0; }
.divider { color: #646cff; margin: 0 10px; }
.launch-btn { background: transparent; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 50px; padding: 20px 60px; position: relative; cursor: pointer; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); overflow: hidden; }
.btn-text { color: #fff; letter-spacing: 5px; font-size: 0.9rem; font-weight: 600; position: relative; z-index: 2; }
.btn-scanner { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: 0.6s; }
.launch-btn:hover { background: #fff; box-shadow: 0 0 50px rgba(255, 255, 255, 0.3); transform: translateY(-5px); }
.launch-btn:hover .btn-text { color: #000; }
.launch-btn:hover .btn-scanner { left: 100%; }
.btn-hint { margin-top: 15px; font-size: 0.6rem; color: rgba(255, 255, 255, 0.2); letter-spacing: 2px; }
.footer-metadata { display: flex; justify-content: center; gap: 40px; margin-top: 120px; opacity: 0.2; }
.meta-item { font-size: 0.6rem; font-family: monospace; letter-spacing: 2px; color: #fff; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.auth-modal-overlay { z-index: 9999; }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
</style>