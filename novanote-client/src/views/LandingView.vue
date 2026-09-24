<template>
  <div class="landing-container" :style="{ '--landing-bg-image': `url(${landingBg})` }">
    <div class="landing-bg" aria-hidden="true"></div>
    <div class="particle-field" aria-hidden="true">
      <div class="particles layer-1"></div>
      <div class="particles layer-2"></div>
      <div class="particles layer-3"></div>
    </div>
    <div class="hud-overlay" aria-hidden="true"><div class="center-glow"></div></div>
    <div class="vignette-layer" aria-hidden="true"></div>

    <header class="site-header">
      <a class="brand-lockup" href="/" aria-label="NovaNote 首頁">
        <span class="brand-orbit" aria-hidden="true"><span></span></span>
        <span>NovaNote</span>
      </a>
      <nav class="main-nav" aria-label="主要導覽">
        <a href="#product">Product</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
      </nav>
      <div class="header-actions">
        <button class="sign-in-link" type="button" @click="openAuth('register')">Sign In</button>
        <button class="header-cta" type="button" @click="openAuth('login')">Get Started</button>
      </div>
    </header>

    <main id="product" class="cover-main">
      <section class="cover-copy">
        <p class="eyebrow">IDEAS ORBIT FURTHER</p>
        <h1><span>Nova</span>Note</h1>
        <p class="cover-subtitle">Spatial Knowledge, Beautifully Organized.</p>
        <p class="cover-description">NovaNote helps you capture ideas, connect knowledge,<br class="desktop-break" /> and see the bigger picture — in a space designed<br class="desktop-break" /> for deeper thinking.</p>
        <button class="cover-cta" type="button" @click="openAuth('login')">
          <span>Get Started</span><span class="cta-arrow" aria-hidden="true">→</span>
        </button>
      </section>

      <ParticleGlobe class="planet-stage" />
    </main>

    <transition name="modal-fade">
      <AuthModal v-if="showAuth" :initial-mode="authMode" @close="showAuth = false" class="auth-modal-overlay" />
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthModal from '../components/auth/AuthModal.vue'
import ParticleGlobe from '../components/landing/ParticleGlobe.vue'

import landingBg from '../assets/Home.png'

const router = useRouter()
const authStore = useAuthStore()
const showAuth = ref(false)
const authMode = ref('login')

const openAuth = (mode) => {
  authMode.value = mode
  showAuth.value = true
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    router.push('/universe')
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Orbitron:wght@500;600;700;800;900&family=Rajdhani:wght@500;600;700&family=Noto+Sans+TC:wght@500;700;900&display=swap');
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

/* Cover page layout */
.landing-container { width: 100%; min-height: 100vh; height: 100svh; justify-content: flex-start; background: #070d1b; }
.landing-bg { filter: brightness(.42) contrast(1.12) saturate(.78); }
.landing-bg::before { background: linear-gradient(90deg, rgba(5,10,23,.9) 0%, rgba(5,10,23,.62) 48%, rgba(5,10,23,.28) 100%), linear-gradient(180deg,rgba(5,10,23,.28),transparent 48%,rgba(5,10,23,.42)); }
.site-header { position: absolute; z-index: 20; inset: 0 3.2% auto; height: 74px; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: center; border-bottom: 1px solid rgba(207,218,233,.12); color: #aab4c5; }
.brand-lockup { display: inline-flex; align-items: center; gap: 12px; width: max-content; color: #e6e1d1; text-decoration: none; font-family: Georgia,serif; font-size: 20px; letter-spacing: .12em; }
.brand-orbit { position: relative; width: 34px; height: 34px; border: 1px solid #d9c785; border-radius: 50%; transform: rotate(-25deg); }
.brand-orbit::after { content: ''; position: absolute; inset: 10px -5px; border: 1px solid rgba(217,199,133,.78); border-radius: 50%; }
.brand-orbit span { position:absolute; left:4px; top:6px; width:4px; height:4px; border-radius:50%; background:#edda9d; box-shadow:0 0 7px #edda9d; }
.main-nav,.header-actions { display:flex; align-items:center; justify-content:center; gap: clamp(22px,4vw,58px); }
.main-nav a,.sign-in-link { color:#aab4c5; text-decoration:none; font: 14px 'Rajdhani','Noto Sans TC',sans-serif; letter-spacing:.04em; transition:color .2s ease; }
.main-nav a:hover,.sign-in-link:hover { color:#f0dfa5; }
.header-actions { justify-content:flex-end; gap:28px; }
.sign-in-link { border:0; background:none; cursor:pointer; }
.header-cta { min-width:150px; height:42px; border:1px solid rgba(220,202,143,.78); border-radius:999px; background:rgba(10,17,32,.36); color:#e7dba9; font:14px 'Rajdhani','Noto Sans TC',sans-serif; letter-spacing:.06em; cursor:pointer; transition:background .2s ease,transform .2s ease; }
.header-cta:hover { background:rgba(220,202,143,.1); transform:translateY(-1px); }
.cover-main { position:relative; z-index:5; width:min(1320px,100%); min-height:100%; margin:0 auto; padding:74px clamp(34px,5.4vw,84px) 40px; display:grid; grid-template-columns:minmax(400px,.95fr) minmax(420px,1.05fr); align-items:center; }
.cover-copy { position:relative; z-index:3; padding-top:22px; }
.eyebrow { margin:0 0 20px; color:#d5c996; font:600 12px 'Rajdhani','Noto Sans TC',sans-serif; letter-spacing:.52em; }
.cover-copy h1 { margin:0 0 7px -4px; color:#eee9db; font:italic 500 clamp(76px,10vw,148px)/.95 'Cormorant Garamond',Georgia,serif; letter-spacing:-.085em; white-space:nowrap; text-shadow:0 6px 35px rgba(0,0,0,.2); }
.cover-copy h1 span { color:#d9c78f; }
.cover-subtitle { margin:18px 0 18px; color:#e2e4e8; font:clamp(19px,2.2vw,28px) 'Rajdhani','Noto Sans TC',sans-serif; letter-spacing:-.025em; }
.cover-description { margin:0; color:#9ca8ba; font:16px/1.55 'Rajdhani','Noto Sans TC',sans-serif; letter-spacing:.01em; }
.cover-cta { display:inline-flex; align-items:center; gap:17px; min-width:178px; height:48px; margin-top:28px; padding:0 25px; border:1px solid rgba(239,222,159,.82); border-radius:999px; background:linear-gradient(120deg,#d8c783,#f0dfa0); color:#10182a; font:600 15px 'Rajdhani','Noto Sans TC',sans-serif; cursor:pointer; box-shadow:0 8px 28px rgba(207,185,111,.16); transition:transform .2s ease,box-shadow .2s ease; }
.cover-cta:hover { transform:translateY(-2px); box-shadow:0 11px 32px rgba(207,185,111,.25); }
.cta-arrow { font-size:21px; line-height:1; }
.planet-stage { position:relative; width:min(46vw,590px); aspect-ratio:1; justify-self:center; perspective:1000px; isolation:isolate; }
@media (max-width:900px) { .site-header { inset-inline:4%; grid-template-columns:1fr auto; }.main-nav { display:none; }.cover-main { grid-template-columns:1fr 1fr; padding-inline:5%; }.cover-copy h1 { font-size:clamp(68px,10vw,108px); }.planet-stage { width:min(48vw,460px); } }
@media (max-width:640px) { .landing-container { min-height:100svh; height:auto; overflow-x:hidden; overflow-y:auto; }.site-header { position:relative; inset:auto; flex:none; height:66px; grid-template-columns:1fr auto; padding:0 2px; }.brand-lockup { font-size:17px; }.header-actions { gap:14px; }.header-cta { min-width:112px; height:38px; }.cover-main { height:calc(100svh - 66px); min-height:0; grid-template-columns:1fr; grid-template-rows:auto auto; gap:0; padding:5vh 8vw 2vh; align-content:start; overflow-y:auto; }.cover-copy { padding:0; }.eyebrow { font-size:10px; letter-spacing:.38em; }.cover-copy h1 { font-size:clamp(68px,18vw,108px); }.cover-subtitle { max-width:360px; font-size:20px; }.cover-description { max-width:440px; font-size:15px; }.desktop-break { display:none; }.cover-cta { margin-top:22px; }.planet-stage { width:min(64vw,300px); margin:8px auto 0; flex-shrink:0; }.landing-bg { background-position:58% center; }.footer-metadata { display:none; } }
@media (prefers-reduced-motion: reduce) { .landing-bg,.layer-1,.layer-2,.layer-3,.center-glow { animation:none !important; } }
</style>