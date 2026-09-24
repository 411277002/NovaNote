<template>
  <div class="universe-background" aria-hidden="true">
    <div class="universe-nebula"></div>
    <div
      v-for="layer in layers"
      :key="layer.name"
      class="particle-layer"
      :class="`particle-layer--${layer.name}`"
      :style="layerStyle(layer.depth)"
    >
      <i
        v-for="particle in layer.particles"
        :key="particle.id"
        class="background-particle"
        :class="`background-particle--${particle.color}`"
        :style="particleStyle(particle)"
      ></i>
    </div>
    <div class="universe-center-calm"></div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive } from 'vue'

const randomGenerator = (initialSeed) => {
  let seed = initialSeed
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const createParticles = (count, seed, sizeRange, opacityRange) => {
  const random = randomGenerator(seed)
  return Array.from({ length: count }, (_, id) => {
    const region = random()
    let x
    let y

    if (region < 0.65) {
      const leftSide = random() < 0.5
      x = leftSide ? random() * 34 : 66 + random() * 34
      y = random() * 100
    } else if (region < 0.9) {
      x = random() * 100
      y = random() < 0.5 ? random() * 20 : 80 + random() * 20
    } else {
      x = random() * 100
      y = random() * 100
      if (x > 34 && x < 66 && y > 28 && y < 72) {
        x = x < 50 ? x * 0.62 : 100 - (100 - x) * 0.62
      }
    }

    const tone = random()
    const color = tone < 0.78 ? 'blue' : tone < 0.98 ? 'ivory' : 'gold'
    return {
      id,
      x,
      y,
      size: sizeRange[0] + random() * (sizeRange[1] - sizeRange[0]),
      opacity: opacityRange[0] + random() * (opacityRange[1] - opacityRange[0]),
      blur: random() * 0.16,
      color
    }
  })
}

const layers = [
  { name: 'far', depth: 0.14, particles: createParticles(1200, 811, [0.38, 0.72], [0.045, 0.13]) },
  { name: 'mid', depth: 0.3, particles: createParticles(600, 1733, [0.55, 0.98], [0.065, 0.16]) },
  { name: 'near', depth: 0.48, particles: createParticles(180, 2909, [0.72, 1.2], [0.085, 0.19]) }
]

const parallax = reactive({ x: 0, y: 0 })
const layerStyle = (depth) => ({
  transform: `translate3d(${parallax.x * depth}px, ${parallax.y * depth}px, 0)`
})

const particleStyle = (particle) => ({
  left: `${particle.x}%`,
  top: `${particle.y}%`,
  width: `${particle.size}px`,
  height: `${particle.size}px`,
  opacity: particle.opacity,
  filter: `blur(${particle.blur}px)`
})

let pendingPointer = null
let frameId = 0
let reducedMotionQuery

const handlePointerMove = (event) => {
  pendingPointer = event
  if (frameId) return
  frameId = requestAnimationFrame(() => {
    frameId = 0
    if (!pendingPointer) return
    parallax.x = ((pendingPointer.clientX / window.innerWidth) - 0.5) * 3
    parallax.y = ((pendingPointer.clientY / window.innerHeight) - 0.5) * 2
    pendingPointer = null
  })
}

const resetParallax = () => {
  pendingPointer = null
  parallax.x = 0
  parallax.y = 0
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (reducedMotionQuery.matches) return
  window.addEventListener('pointermove', handlePointerMove, { passive: true })
  window.addEventListener('blur', resetParallax)
})

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId)
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('blur', resetParallax)
})
</script>

<style scoped>
.universe-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 50% 52%,
      rgba(20, 43, 82, 0.3) 0%,
      rgba(10, 16, 38, 0.18) 38%,
      #050816 75%
    );
  contain: layout paint;
}

.universe-nebula {
  position: absolute;
  inset: -12%;
  background:
    radial-gradient(ellipse 38% 23% at 0% 8%, rgba(37, 74, 122, 0.2), transparent 74%),
    radial-gradient(ellipse 43% 28% at 100% 91%, rgba(37, 74, 122, 0.16), transparent 74%),
    radial-gradient(ellipse 19% 36% at 2% 62%, rgba(20, 43, 82, 0.2), transparent 82%),
    radial-gradient(ellipse 20% 34% at 98% 34%, rgba(20, 43, 82, 0.17), transparent 82%);
  filter: blur(44px);
  opacity: 0.56;
  animation: nebula-drift 72s ease-in-out infinite alternate;
}

@keyframes nebula-drift {
  from { transform: translate3d(-0.6%, -0.4%, 0) scale(1); }
  to { transform: translate3d(0.6%, 0.4%, 0) scale(1.035); }
}

.particle-layer {
  position: absolute;
  inset: 0;
  will-change: transform;
  pointer-events: none;
  transition: transform 360ms ease-out;
}

.particle-layer--far { z-index: 1; }
.particle-layer--mid { z-index: 2; }
.particle-layer--near { z-index: 3; }

.background-particle {
  position: absolute;
  display: block;
  border-radius: 50%;
}

.background-particle--blue {
  background: #5d7ea8;
  box-shadow: 0 0 3px rgba(93, 126, 168, 0.26);
}

.background-particle--ivory {
  background: #f8f6ee;
  box-shadow: 0 0 3px rgba(248, 246, 238, 0.25);
}

.background-particle--gold {
  background: #d4b06a;
  box-shadow: 0 0 3px rgba(212, 176, 106, 0.2);
}

.universe-center-calm {
  position: absolute;
  inset: 0;
  z-index: 4;
  background: radial-gradient(ellipse at 50% 48%, rgba(10, 16, 38, 0.2) 0%, rgba(10, 16, 38, 0.1) 34%, transparent 72%);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .particle-layer { transition: none; }
  .universe-nebula { animation: none; }
}

@media (max-width: 700px) {
  .particle-layer--near { display: none; }
  .particle-layer--mid { opacity: 0.78; }
  .universe-nebula { opacity: 0.42; }
}
</style>
