<template>
  <div
    class="landing-container"
    :style="{ '--landing-bg-image': `url(${landingBg})` }"
  >
    <!-- 背景圖層 -->
    <div class="landing-bg"></div>

    <!-- 額外粒子層：讓背景更有宇宙漂浮感 -->
    <div class="particle-field">
      <div class="particles layer-1"></div>
      <div class="particles layer-2"></div>
      <div class="particles layer-3"></div>
    </div>

    <!-- 掃描 / HUD 光線 -->
    <div class="hud-overlay">
      <div class="center-glow"></div>
    </div>

    <!-- 暗角，讓文字更清楚 -->
    <div class="vignette-layer"></div>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthModal from '../components/auth/AuthModal.vue'

import landingBg from '../assets/Home.png'

const router = useRouter()
const authStore = useAuthStore()
const showAuth = ref(false)

onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/universe')
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800;900&family=Rajdhani:wght@500;600;700&family=Noto+Sans+TC:wght@500;700;900&display=swap');
/* =========================
   Base
========================= */

.landing-container {
  position: relative;

  width: 100vw;
  height: 100vh;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background: #02040a;

  font-family:
    'Rajdhani',
    'Noto Sans TC',
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;

  color: #ffffff;

  isolation: isolate;
}

/* =========================
   Background Image
========================= */

.landing-bg {
  position: absolute;
  inset: 0;
  z-index: 0;

  background-image: var(--landing-bg-image);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  transform: scale(1.035);

  filter:
    brightness(0.78)
    contrast(1.08)
    saturate(1.08);

  animation: bgDrift 24s ease-in-out infinite alternate;
}

.landing-bg::before {
  content: '';

  position: absolute;
  inset: 0;

  background:
    radial-gradient(circle at 50% 46%, rgba(105, 145, 255, 0.1), transparent 24%),
    radial-gradient(circle at 20% 20%, rgba(80, 150, 255, 0.08), transparent 28%),
    radial-gradient(circle at 78% 74%, rgba(168, 85, 247, 0.09), transparent 30%),
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.18),
      rgba(0, 0, 0, 0.04) 42%,
      rgba(0, 0, 0, 0.36)
    );

  pointer-events: none;
}

@keyframes bgDrift {
  from {
    transform: scale(1.035) translate3d(0, 0, 0);
  }

  to {
    transform: scale(1.06) translate3d(-0.6vw, -0.4vh, 0);
  }
}

/* =========================
   Particle System
========================= */

.particle-field {
  position: absolute;
  inset: 0;
  z-index: 1;

  pointer-events: none;
  overflow: hidden;
}

.particles {
  position: absolute;
  left: 0;
  top: 0;

  width: 1px;
  height: 1px;

  border-radius: 50%;
  background: transparent;
}

.layer-1 {
  box-shadow:
    8vw 18vh rgba(255, 255, 255, 0.8),
    16vw 72vh rgba(150, 190, 255, 0.65),
    22vw 42vh rgba(255, 255, 255, 0.55),
    34vw 15vh rgba(125, 175, 255, 0.7),
    41vw 86vh rgba(255, 255, 255, 0.6),
    54vw 24vh rgba(170, 210, 255, 0.75),
    63vw 66vh rgba(255, 255, 255, 0.55),
    76vw 34vh rgba(118, 190, 255, 0.78),
    84vw 82vh rgba(255, 255, 255, 0.55),
    92vw 19vh rgba(150, 190, 255, 0.7),
    12vw 91vh rgba(255, 255, 255, 0.45),
    47vw 52vh rgba(145, 195, 255, 0.55),
    70vw 12vh rgba(255, 255, 255, 0.48),
    88vw 54vh rgba(150, 190, 255, 0.58);

  opacity: 0.62;

  animation:
    particleDriftSlow 90s linear infinite,
    particleTwinkle 5.5s ease-in-out infinite;
}

.layer-2 {
  width: 2px;
  height: 2px;

  box-shadow:
    10vw 34vh rgba(160, 210, 255, 0.7),
    18vw 52vh rgba(255, 255, 255, 0.72),
    29vw 78vh rgba(125, 165, 255, 0.64),
    36vw 29vh rgba(255, 255, 255, 0.68),
    52vw 74vh rgba(125, 205, 255, 0.75),
    68vw 28vh rgba(255, 255, 255, 0.65),
    73vw 61vh rgba(130, 170, 255, 0.7),
    89vw 40vh rgba(255, 255, 255, 0.64),
    94vw 77vh rgba(140, 210, 255, 0.72);

  opacity: 0.48;

  filter: blur(0.2px);

  animation:
    particleDriftMid 62s linear infinite,
    particleTwinkle 4.2s ease-in-out infinite;
}

.layer-3 {
  width: 3px;
  height: 3px;

  box-shadow:
    14vw 24vh rgba(140, 180, 255, 0.55),
    26vw 68vh rgba(255, 255, 255, 0.5),
    58vw 38vh rgba(105, 190, 255, 0.5),
    82vw 27vh rgba(255, 255, 255, 0.58),
    91vw 63vh rgba(155, 120, 255, 0.46);

  opacity: 0.38;

  filter: blur(1px);

  animation:
    particleDriftFast 34s linear infinite,
    particlePulse 3.8s ease-in-out infinite;
}

@keyframes particleDriftSlow {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(-20px, -140px, 0);
  }
}

@keyframes particleDriftMid {
  from {
    transform: translate3d(0, 0, 0);
  }

  to {
    transform: translate3d(28px, -220px, 0);
  }
}

@keyframes particleDriftFast {
  from {
    transform: translate3d(0, 80px, 0);
  }

  to {
    transform: translate3d(-32px, -280px, 0);
  }
}

@keyframes particleTwinkle {
  0%,
  100% {
    opacity: 0.42;
  }

  48% {
    opacity: 0.78;
  }

  72% {
    opacity: 0.28;
  }
}

@keyframes particlePulse {
  0%,
  100% {
    opacity: 0.22;
    filter: blur(1px);
  }

  50% {
    opacity: 0.56;
    filter: blur(1.8px);
  }
}

/* =========================
   HUD / Scan Overlay
========================= */

.hud-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;

  pointer-events: none;
}

.center-glow {
  position: absolute;
  left: 50%;
  top: 48%;

  width: min(620px, 54vw);
  height: min(320px, 32vh);

  transform: translate(-50%, -50%);

  background:
    radial-gradient(circle, rgba(120, 150, 255, 0.22), transparent 66%);

  filter: blur(48px);
  opacity: 0.55;

  animation: centerGlowPulse 6s ease-in-out infinite;
}

@keyframes scanBreath {
  0%,
  100% {
    opacity: 0.42;
    transform: translateY(0);
  }

  50% {
    opacity: 0.86;
    transform: translateY(-8px);
  }
}

@keyframes centerGlowPulse {
  0%,
  100% {
    opacity: 0.38;
    transform: translate(-50%, -50%) scale(0.96);
  }

  50% {
    opacity: 0.68;
    transform: translate(-50%, -50%) scale(1.08);
  }
}

/* =========================
   Vignette
========================= */

.vignette-layer {
  position: absolute;
  inset: 0;
  z-index: 3;

  pointer-events: none;

  background:
    radial-gradient(circle at center, transparent 0 34%, rgba(0, 0, 0, 0.34) 78%, rgba(0, 0, 0, 0.72) 100%),
    linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.18),
      transparent 26%,
      transparent 70%,
      rgba(0, 0, 0, 0.34)
    );
}

/* =========================
   Hero
========================= */

.hero-section {
  position: relative;
  z-index: 10;

  width: 100%;
  padding: 0 24px;

  text-align: center;
}

.hero-content {
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-header {
  position: relative;
  transform: translateY(36px);
}

.main-title {
  margin: 0;

  color: #ffffff;

  font-family:
    'Orbitron',
    'Rajdhani',
    sans-serif;

  font-size: clamp(3.6rem, 8vw, 8.4rem);
  font-weight: 900;
  font-style: normal;
  line-height: 0.95;
  letter-spacing: clamp(10px, 1.35vw, 22px);

  text-transform: uppercase;

  transform: skewX(-8deg);

  text-shadow:
    0 0 8px rgba(255, 255, 255, 0.48),
    0 0 22px rgba(165, 175, 255, 0.42),
    0 0 52px rgba(100, 125, 255, 0.22),
    0 0 92px rgba(80, 105, 255, 0.12);

  filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.2));
}

.main-title::after {
  content: '';

  position: absolute;
  left: 50%;
  bottom: -22px;

  width: 68%;
  height: 1px;

  transform: translateX(-50%);

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(170, 190, 255, 0.4),
      transparent
    );

  opacity: 0.42;
}

.hero-tagline {
  margin: 72px 0 0;

  color: rgba(225, 230, 255, 0.42);

  font-family:
    'Rajdhani',
    'Noto Sans TC',
    sans-serif;

  font-size: clamp(0.78rem, 1vw, 1rem);
  font-weight: 700;
  letter-spacing: clamp(6px, 0.75vw, 11px);

  text-transform: uppercase;

  text-shadow: 0 0 14px rgba(125, 150, 255, 0.14);
}

.cta-wrapper {
  margin-top: 70px;
}

.launch-btn {
  position: relative;

  min-width: min(430px, 82vw);
  height: 74px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0 64px;

  overflow: hidden;

  color: #ffffff;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.045),
      rgba(255, 255, 255, 0.012)
    ),
    rgba(8, 13, 30, 0.5);

  border: 1px solid rgba(140, 170, 255, 0.42);
  border-radius: 0;

  clip-path: polygon(
    18px 0,
    calc(100% - 18px) 0,
    100% 18px,
    100% calc(100% - 18px),
    calc(100% - 18px) 100%,
    18px 100%,
    0 calc(100% - 18px),
    0 18px
  );

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  cursor: pointer;

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    inset 0 0 26px rgba(120, 150, 255, 0.08),
    0 0 18px rgba(105, 135, 255, 0.12),
    0 0 44px rgba(90, 120, 255, 0.08);

  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    background 0.28s ease,
    box-shadow 0.28s ease;
}

.launch-btn::before {
  content: '';

  position: absolute;
  inset: 6px;

  border: 1px solid rgba(180, 205, 255, 0.12);

  clip-path: polygon(
    14px 0,
    calc(100% - 14px) 0,
    100% 14px,
    100% calc(100% - 14px),
    calc(100% - 14px) 100%,
    14px 100%,
    0 calc(100% - 14px),
    0 14px
  );

  pointer-events: none;
}

.launch-btn::after {
  content: '';

  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 0;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(160, 190, 255, 0.5),
      rgba(255, 255, 255, 0.72),
      rgba(160, 190, 255, 0.5),
      transparent
    );

  box-shadow:
    0 0 12px rgba(145, 175, 255, 0.42),
    0 0 26px rgba(100, 130, 255, 0.2);

  opacity: 0.72;

  pointer-events: none;
}

.btn-scanner {
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 38%,
      rgba(255, 255, 255, 0.2) 49%,
      rgba(160, 190, 255, 0.14) 52%,
      transparent 64%,
      transparent 100%
    );

  transform: translateX(-120%);

  transition: transform 0.75s ease;
}

.launch-btn:hover {
  transform: translateY(-4px);

  border-color: rgba(205, 225, 255, 0.78);

  background:
    linear-gradient(
      180deg,
      rgba(95, 120, 255, 0.2),
      rgba(18, 28, 64, 0.54)
    ),
    rgba(8, 13, 30, 0.62);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.06),
    inset 0 0 32px rgba(120, 150, 255, 0.14),
    0 0 24px rgba(150, 180, 255, 0.28),
    0 0 64px rgba(100, 130, 255, 0.18);
}

.launch-btn:hover .btn-scanner {
  transform: translateX(120%);
}

.btn-text {
  position: relative;
  z-index: 2;

  color: #ffffff;

  font-family:
    'Rajdhani',
    'Noto Sans TC',
    sans-serif;

  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 6px;

  text-transform: uppercase;
}

.btn-hint {
  margin: 18px 0 0;

  color: rgba(230, 235, 255, 0.22);

  font-family:
    'Rajdhani',
    'Noto Sans TC',
    sans-serif;

  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 3.5px;

  text-transform: uppercase;
}

.footer-metadata {
  margin-top: 118px;

  display: flex;
  justify-content: center;
  gap: 48px;

  opacity: 0.24;
}

.meta-item {
  color: #ffffff;

  font-family:
    'Orbitron',
    'Rajdhani',
    monospace;

  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 2.6px;
}

/* =========================
   Modal Transition
========================= */

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.auth-modal-overlay {
  z-index: 9999;
}

/* =========================
   RWD
========================= */

@media (max-width: 768px) {
  .landing-bg {
    background-position: center;
    transform: scale(1.08);
  }

  .main-title {
    font-size: clamp(3rem, 15vw, 5rem);
    letter-spacing: 7px;
    transform: skewX(-6deg);
  }

  .hero-tagline {
    max-width: 86vw;
    margin-top: 56px;

    line-height: 1.9;
    letter-spacing: 4px;
  }

  .cta-wrapper {
    margin-top: 54px;
  }

  .launch-btn {
    min-width: min(340px, 84vw);
    height: 66px;
    padding: 0 34px;
  }

  .btn-text {
    font-size: 0.78rem;
    letter-spacing: 4px;
  }

  .footer-metadata {
    margin-top: 84px;
    gap: 16px;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-bg,
  .layer-1,
  .layer-2,
  .layer-3,
  .center-glow {
    animation: none !important;
  }
}
</style>