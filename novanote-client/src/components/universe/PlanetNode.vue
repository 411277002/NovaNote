<template>
  <div
    ref="nodeRef"
    class="PlanetNode"
    :class="{ dragging: isDragging }"
    :data-id="planet.id"
    :style="[planetStyle, bodyStyle]"
    @mousedown="startDrag"
  >
    <div class="planet-scan scan-one"></div>
    <div class="planet-scan scan-two"></div>
    <div class="planet-aura"></div>

    <!-- 後環：只有 ringed 星球顯示 -->
    <svg
      v-if="isRinged"
      class="planet-ring ring-behind"
      viewBox="0 0 190 190"
      aria-hidden="true"
    >
      <ellipse
        cx="95"
        cy="95"
        rx="82"
        ry="26"
        class="ring-ellipse ring-back-shadow"
      />
      <ellipse
        cx="95"
        cy="95"
        rx="78"
        ry="23"
        class="ring-ellipse ring-back-main"
      />
      <ellipse
        cx="95"
        cy="95"
        rx="63"
        ry="17"
        class="ring-ellipse ring-back-inner"
      />
    </svg>

    <!-- 星球本體 -->
    <div class="planet-body" :class="textureClass">
      <div class="planet-texture"></div>
      <div class="planet-cloud-layer"></div>
      <div class="planet-shadow-layer"></div>
      <div class="planet-atmosphere"></div>
      <div class="planet-shine"></div>
      <div class="planet-glint"></div>
    </div>

    <!-- 前環：只有 ringed 星球顯示 -->
    <svg
      v-if="isRinged"
      class="planet-ring ring-front-layer"
      viewBox="0 0 190 190"
      aria-hidden="true"
    >
      <path
        d="M 177 95 A 82 26 0 0 1 13 95"
        class="ring-front-path ring-front-main"
      />
      <path
        d="M 168 91 A 72 20 0 0 1 22 91"
        class="ring-front-path ring-front-highlight"
      />
    </svg>

    <span class="planet-name">{{ planet.name || '未命名星球' }}</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlanetsStore } from '../../stores/planets'

const props = defineProps({
  planet: {
    type: Object,
    required: true
  },
  canvasScale: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['click'])

const planetsStore = usePlanetsStore()

const nodeRef = ref(null)
const isDragging = ref(false)
const hasMoved = ref(false)

const supportedTypes = ['rocky', 'gas', 'ringed', 'ice', 'lava', 'ocean']

const getSafePosition = (value, fallback = 0.5) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const normalizedTexture = computed(() => {
  return String(props.planet.texture_type || 'rocky').toLowerCase()
})

const planetType = computed(() => {
  return supportedTypes.includes(normalizedTexture.value)
    ? normalizedTexture.value
    : 'rocky'
})

const isRinged = computed(() => {
  return planetType.value === 'ringed'
})

const textureClass = computed(() => {
  return `texture-${planetType.value}`
})

const planetStyle = computed(() => ({
  left: `${getSafePosition(props.planet.x_pos) * 100}%`,
  top: `${getSafePosition(props.planet.y_pos) * 100}%`,
  zIndex: isDragging.value ? 1000 : 10,
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

const hexToRgb = (hex) => {
  const fallback = '#7c8cff'
  const cleanHex = String(hex || fallback).replace('#', '')

  if (cleanHex.length !== 6) {
    return {
      r: 124,
      g: 140,
      b: 255
    }
  }

  const bigint = parseInt(cleanHex, 16)

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  }
}

const rgbToHex = (r, g, b) => {
  const toHex = (value) => {
    const safeValue = Math.max(0, Math.min(255, Math.round(value)))
    const hex = safeValue.toString(16)

    return hex.length === 1 ? `0${hex}` : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const mixColor = (hex, mixWith = '#ffffff', amount = 0.5) => {
  const c1 = hexToRgb(hex)
  const c2 = hexToRgb(mixWith)

  return rgbToHex(
    c1.r + (c2.r - c1.r) * amount,
    c1.g + (c2.g - c1.g) * amount,
    c1.b + (c2.b - c1.b) * amount
  )
}

const rgbaFromHex = (hex, alpha = 1) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const bodyStyle = computed(() => {
  const base = props.planet.color || '#7c8cff'

  return {
    '--planet-color': base,
    '--planet-light': mixColor(base, '#ffffff', 0.68),
    '--planet-soft': mixColor(base, '#ffffff', 0.42),
    '--planet-dark': mixColor(base, '#000000', 0.46),
    '--planet-deep': mixColor(base, '#000000', 0.72),

    '--planet-glow-color': rgbaFromHex(base, 0.36),
    '--planet-glow-color-2': rgbaFromHex(base, 0.22),
    '--planet-glow-color-3': rgbaFromHex(base, 0.11),

    '--ring-dark': rgbaFromHex(mixColor(base, '#000000', 0.56), 0.38),
    '--ring-mid': rgbaFromHex(mixColor(base, '#ffffff', 0.24), 0.72),
    '--ring-light': rgbaFromHex(mixColor(base, '#ffffff', 0.62), 0.94),
    '--ring-highlight': rgbaFromHex('#ffffff', 0.38),

    '--gas-light': mixColor(base, '#ffffff', 0.78),
    '--gas-soft': mixColor(base, '#d9e2ff', 0.58),
    '--gas-warm': mixColor(base, '#ffe1a6', 0.38),
    '--gas-mid': mixColor(base, '#8ea0ff', 0.2),
    '--gas-dark': mixColor(base, '#000000', 0.46),

    '--ice-light': mixColor(base, '#ffffff', 0.9),
    '--ice-mid': mixColor(base, '#dff7ff', 0.7),
    '--ice-deep': mixColor(base, '#265fa8', 0.54),

    '--lava-hot': mixColor(base, '#ffec9f', 0.68),
    '--lava-orange': mixColor(base, '#ff6b28', 0.52),
    '--lava-red': mixColor(base, '#ff2e1f', 0.36),
    '--lava-dark': mixColor(base, '#12030a', 0.8),

    '--ocean-light': mixColor(base, '#e5ffff', 0.7),
    '--ocean-mid': mixColor(base, '#35a9ff', 0.48),
    '--ocean-teal': mixColor(base, '#2dd4bf', 0.38),
    '--ocean-deep': mixColor(base, '#020b2b', 0.72)
  }
})

const startDrag = (event) => {
  if (event.button !== 0) return

  event.preventDefault()
  event.stopPropagation()

  const el = nodeRef.value
  if (!el) return

  const parent = el.offsetParent
  if (!parent) return

  isDragging.value = true
  hasMoved.value = false

  window.dispatchEvent(new CustomEvent('novanote:node-drag-start'))

  const startX = event.clientX
  const startY = event.clientY

  const initialLeft = el.offsetLeft
  const initialTop = el.offsetTop

  let latestEvent = event
  let rafId = null
  let lastLeft = initialLeft
  let lastTop = initialTop

  el.style.transition = 'none'
  el.style.zIndex = '2000'
  el.style.willChange = 'transform'
  el.classList.add('is-dragging')

  const applyMove = () => {
    rafId = null

    const deltaX = (latestEvent.clientX - startX) / props.canvasScale
    const deltaY = (latestEvent.clientY - startY) / props.canvasScale

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasMoved.value = true
    }

    if (!hasMoved.value) return

    const nextLeft = initialLeft + deltaX
    const nextTop = initialTop + deltaY

    const minLeft = 80
    const maxLeft = parent.offsetWidth - 80
    const minTop = 80
    const maxTop = parent.offsetHeight - 80

    lastLeft = Math.min(maxLeft, Math.max(minLeft, nextLeft))
    lastTop = Math.min(maxTop, Math.max(minTop, nextTop))

    el.style.setProperty('--drag-x', `${lastLeft - initialLeft}px`)
    el.style.setProperty('--drag-y', `${lastTop - initialTop}px`)
  }

  const onMouseMove = (moveEvent) => {
    latestEvent = moveEvent

    if (!rafId) {
      rafId = requestAnimationFrame(applyMove)
    }
  }

  const cleanup = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }

    isDragging.value = false
    el.classList.remove('is-dragging')

    el.style.zIndex = ''
    el.style.willChange = ''

    window.dispatchEvent(new CustomEvent('novanote:node-drag-end'))
  }

  const onMouseUp = async () => {
    cleanup()

    if (!hasMoved.value) {
      el.style.transition = ''
      el.style.removeProperty('--drag-x')
      el.style.removeProperty('--drag-y')

      emit('click', props.planet)
      return
    }

    const finalX = Math.min(
      0.995,
      Math.max(0.005, lastLeft / parent.offsetWidth)
    )

    const finalY = Math.min(
      0.995,
      Math.max(0.005, lastTop / parent.offsetHeight)
    )

    el.style.transition = ''
    el.style.removeProperty('--drag-x')
    el.style.removeProperty('--drag-y')

    props.planet.x_pos = finalX
    props.planet.y_pos = finalY

    try {
      await planetsStore.updatePlanetPosition(
        props.planet.id,
        finalX,
        finalY
      )
    } catch (err) {
      console.error('更新星球位置失敗:', err)
    }
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.PlanetNode {
  position: absolute;

  width: 178px;
  height: 178px;

  display: flex;
  align-items: center;
  justify-content: center;

  user-select: none;
  will-change: transform;
  backface-visibility: hidden;
  background: transparent !important;
  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    translateZ(0);

  transition:
    transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    opacity 0.25s ease,
    filter 0.25s ease;
}

.PlanetNode:hover .planet-body {
  transform: scale(1.08);
  filter: brightness(1.12) saturate(1.08);
}

.PlanetNode:hover .planet-aura {
  opacity: 0.95;
  transform: translate(-50%, -50%) scale(1.12);
}

.PlanetNode:hover .planet-scan {
  opacity: 0.68;
  border-color: rgba(190, 200, 255, 0.28);
}

.PlanetNode:hover .planet-name {
  opacity: 1;
  transform: translateY(-3px);
}

.PlanetNode.dragging {
  transition: none !important;
  filter: none !important;
  cursor: grabbing !important;
}

.PlanetNode.dragging .planet-body {
  transition: none !important;
  filter: brightness(1.06) saturate(1.04) !important;
  transform: scale(1.04) !important;
}

.PlanetNode.dragging .planet-scan,
.PlanetNode.dragging .planet-aura,
.PlanetNode.dragging .planet-glow {
  display: none !important;
}

.PlanetNode.dragging .planet-ring {
  filter: none !important;
}

/* =========================
   掃描圓圈與光暈
========================= */

.planet-scan {
  position: absolute;
  left: 50%;
  top: 50%;

  border-radius: 50%;
  border: 1px dashed rgba(160, 170, 255, 0.12);

  transform: translate(-50%, -50%);

  pointer-events: none;

  opacity: 0.36;

  transition:
    opacity 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease;
}

.scan-one {
  width: 122px;
  height: 122px;
}

.scan-two {
  width: 156px;
  height: 156px;
  opacity: 0.18;
}

.planet-aura {
  position: absolute;
  left: 50%;
  top: 50%;

  width: 118px;
  height: 118px;

  border-radius: 50%;

  transform: translate(-50%, -50%);

  background:
    radial-gradient(circle, var(--planet-glow-color) 0%, transparent 66%);

  filter: blur(20px);
  opacity: 0.62;

  pointer-events: none;

  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

/* =========================
   星球本體
========================= */

.planet-body {
  position: relative;

  width: 92px;
  height: 92px;

  border-radius: 50%;
  overflow: hidden;

  z-index: 8;

  background-color: var(--planet-color);

  box-shadow:
    inset -28px -30px 36px rgba(0, 0, 0, 0.62),
    inset 13px 11px 24px rgba(255, 255, 255, 0.3),
    0 0 18px rgba(190, 200, 255, 0.18),
    0 0 58px var(--planet-glow-color-3);

  transition:
    transform 0.28s ease,
    filter 0.28s ease,
    box-shadow 0.28s ease;
}

.planet-texture,
.planet-cloud-layer,
.planet-shadow-layer,
.planet-atmosphere,
.planet-shine,
.planet-glint {
  position: absolute;
  pointer-events: none;
}

.planet-texture {
  inset: 0;
  z-index: 2;
  border-radius: 50%;

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.planet-cloud-layer {
  inset: 0;
  z-index: 3;
  border-radius: 50%;
  opacity: 0.74;
  mix-blend-mode: screen;
}

.planet-shadow-layer {
  inset: -1px;
  z-index: 6;
  border-radius: 50%;

  background:
    radial-gradient(circle at 26% 22%, rgba(255, 255, 255, 0.18), transparent 0 25%, transparent 34%),
    radial-gradient(circle at 72% 76%, rgba(0, 0, 0, 0.78), transparent 0 51%, transparent 60%),
    linear-gradient(135deg, transparent 0%, transparent 42%, rgba(0, 0, 0, 0.46) 100%);

  mix-blend-mode: multiply;
}

.planet-atmosphere {
  inset: -4px;
  z-index: 7;
  border-radius: 50%;

  border: 1px solid rgba(220, 230, 255, 0.16);

  box-shadow:
    inset 0 0 14px rgba(255, 255, 255, 0.1),
    0 0 24px var(--planet-glow-color-2);
}

.planet-shine {
  top: 16px;
  left: 18px;

  width: 40px;
  height: 20px;

  z-index: 8;

  border-radius: 999px;

  background:
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0.5), transparent 72%);

  filter: blur(5px);
  transform: rotate(-28deg);

  opacity: 0.7;
}

.planet-glint {
  top: 26px;
  left: 36px;

  width: 7px;
  height: 7px;

  z-index: 9;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.9);

  box-shadow:
    0 0 8px rgba(255, 255, 255, 0.9),
    0 0 22px rgba(180, 190, 255, 0.65);

  opacity: 0.7;
}

/* =========================
   Rocky：霧面岩石 / 類月球
========================= */

.texture-rocky .planet-texture {
  background-image:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.62), transparent 0 15%, transparent 28%),
    radial-gradient(circle at 66% 68%, rgba(0, 0, 0, 0.34), transparent 0 12%, transparent 18%),
    radial-gradient(circle at 43% 58%, rgba(255, 255, 255, 0.14), transparent 0 7%, transparent 12%),
    radial-gradient(circle at 73% 34%, rgba(0, 0, 0, 0.24), transparent 0 9%, transparent 13%),
    url('/planets/rocky.webp'),
    linear-gradient(135deg, var(--planet-light), var(--planet-color) 48%, var(--planet-deep));
}

.texture-rocky .planet-cloud-layer {
  background:
    radial-gradient(ellipse at 40% 45%, rgba(255, 255, 255, 0.16), transparent 38%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.08), transparent 44%, rgba(0, 0, 0, 0.1));
  opacity: 0.5;
}

/* =========================
   Gas：木星條紋
========================= */

.texture-gas .planet-texture {
  background-image:
    radial-gradient(circle at 32% 22%, rgba(255, 255, 255, 0.5), transparent 0 19%, transparent 31%),
    radial-gradient(ellipse at 62% 52%, rgba(255, 255, 255, 0.2), transparent 0 9%, transparent 18%),
    url('/planets/gas.webp'),
    repeating-linear-gradient(
      180deg,
      var(--gas-light) 0px,
      var(--gas-light) 9px,
      var(--gas-soft) 9px,
      var(--gas-soft) 18px,
      var(--gas-warm) 18px,
      var(--gas-warm) 27px,
      var(--gas-mid) 27px,
      var(--gas-mid) 39px,
      var(--gas-dark) 39px,
      var(--gas-dark) 50px
    );
}

.texture-gas .planet-cloud-layer {
  background:
    linear-gradient(176deg, transparent 0 24%, rgba(255, 255, 255, 0.24) 25% 28%, transparent 29%),
    linear-gradient(184deg, transparent 0 55%, rgba(255, 255, 255, 0.18) 56% 59%, transparent 60%),
    radial-gradient(ellipse at 58% 56%, rgba(255, 255, 255, 0.2), transparent 18%);
  opacity: 0.72;
  filter: blur(0.5px);
}

/* =========================
   Ringed：紫藍帶環星球
========================= */

.texture-ringed .planet-texture {
  background-image:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.58), transparent 0 19%, transparent 32%),
    url('/planets/ringed.webp'),
    repeating-linear-gradient(
      168deg,
      rgba(255, 255, 255, 0.2) 0 8px,
      rgba(120, 128, 255, 0.2) 8px 18px,
      rgba(18, 26, 76, 0.22) 18px 32px
    ),
    linear-gradient(135deg, var(--planet-light), var(--planet-color) 50%, var(--planet-deep));
}

.texture-ringed .planet-cloud-layer {
  background:
    radial-gradient(ellipse at 44% 40%, rgba(255, 255, 255, 0.22), transparent 28%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.14), transparent 44%, rgba(0, 0, 0, 0.16));
  opacity: 0.6;
}

/* =========================
   Ice：冰霧星球
========================= */

.texture-ice .planet-body {
  box-shadow:
    inset -28px -30px 38px rgba(34, 48, 120, 0.52),
    inset 18px 14px 28px rgba(255, 255, 255, 0.66),
    0 0 28px rgba(185, 225, 255, 0.28),
    0 0 76px rgba(125, 170, 255, 0.14);
}

.texture-ice .planet-texture {
  background-image:
    radial-gradient(circle at 27% 22%, rgba(255, 255, 255, 0.9), transparent 0 16%, transparent 31%),
    url('/planets/ice.webp'),
    linear-gradient(34deg, transparent 0 36%, rgba(255, 255, 255, 0.42) 37% 40%, transparent 41% 100%),
    linear-gradient(116deg, transparent 0 43%, rgba(220, 245, 255, 0.34) 44% 47%, transparent 48% 100%),
    linear-gradient(135deg, #f8fcff 0%, var(--ice-light) 20%, var(--ice-mid) 54%, var(--ice-deep) 100%);
}

.texture-ice .planet-cloud-layer {
  background:
    radial-gradient(ellipse at 36% 30%, rgba(255, 255, 255, 0.3), transparent 26%),
    radial-gradient(ellipse at 64% 75%, rgba(120, 190, 255, 0.18), transparent 28%);
  opacity: 0.76;
}

/* =========================
   Lava：熔岩裂縫
========================= */

.texture-lava .planet-body {
  box-shadow:
    inset -30px -32px 40px rgba(0, 0, 0, 0.64),
    inset 14px 12px 24px rgba(255, 204, 128, 0.18),
    0 0 32px rgba(255, 98, 34, 0.24),
    0 0 76px rgba(255, 118, 40, 0.12);
}

.texture-lava .planet-texture {
  background-image:
    radial-gradient(circle at 28% 23%, rgba(255, 214, 124, 0.78), transparent 0 12%, transparent 26%),
    url('/planets/lava.webp'),
    linear-gradient(128deg, transparent 0 27%, rgba(255, 111, 48, 0.78) 28% 33%, rgba(255, 197, 91, 0.58) 34% 36%, transparent 37% 100%),
    linear-gradient(42deg, transparent 0 45%, rgba(255, 135, 54, 0.72) 46% 50%, rgba(255, 210, 110, 0.48) 51% 52%, transparent 53% 100%),
    linear-gradient(135deg, #4b2a4f 0%, #2a1c38 42%, var(--lava-dark) 100%);
}

.texture-lava .planet-cloud-layer {
  background:
    radial-gradient(circle at 34% 42%, rgba(255, 241, 145, 0.72), transparent 7%),
    radial-gradient(circle at 72% 63%, rgba(255, 111, 40, 0.52), transparent 14%),
    radial-gradient(circle at 48% 76%, rgba(255, 140, 50, 0.28), transparent 16%);
  filter: blur(1.5px);
  opacity: 0.88;
}

/* =========================
   Ocean：藍白雲層星球
========================= */

.texture-ocean .planet-body {
  box-shadow:
    inset -28px -30px 38px rgba(0, 0, 0, 0.54),
    inset 16px 14px 26px rgba(255, 255, 255, 0.34),
    0 0 30px rgba(90, 130, 255, 0.25),
    0 0 76px rgba(80, 170, 255, 0.12);
}

.texture-ocean .planet-texture {
  background-image:
    radial-gradient(circle at 26% 22%, rgba(255, 255, 255, 0.72), transparent 0 16%, transparent 31%),
    url('/planets/ocean.webp'),
    linear-gradient(164deg, transparent 0 28%, rgba(255, 255, 255, 0.34) 29% 32%, transparent 33% 100%),
    linear-gradient(150deg, transparent 0 52%, rgba(178, 214, 255, 0.34) 53% 56%, transparent 57% 100%),
    linear-gradient(135deg, var(--ocean-light) 0%, var(--ocean-mid) 36%, var(--ocean-teal) 58%, var(--ocean-deep) 100%);
}

.texture-ocean .planet-cloud-layer {
  background:
    linear-gradient(24deg, transparent 0 40%, rgba(255, 255, 255, 0.24) 41% 43%, transparent 44% 100%),
    linear-gradient(168deg, transparent 0 58%, rgba(205, 230, 255, 0.2) 59% 61%, transparent 62% 100%),
    radial-gradient(ellipse at 62% 32%, rgba(210, 255, 248, 0.34), transparent 16%),
    radial-gradient(ellipse at 38% 68%, rgba(255, 255, 255, 0.14), transparent 20%);
  filter: blur(0.8px);
  opacity: 0.78;
}

/* =========================
   星環
========================= */

.planet-ring {
  position: absolute;
  left: 50%;
  top: 50%;

  width: 188px;
  height: 188px;

  transform: translate(-50%, -50%) rotate(-18deg);

  overflow: visible;
  pointer-events: none !important;
}

.ring-behind {
  z-index: 5;
  opacity: 0.82;

  filter:
    drop-shadow(0 0 7px var(--planet-glow-color-2))
    blur(0.08px);
}

.ring-front-layer {
  z-index: 11;

  filter:
    drop-shadow(0 0 8px var(--planet-glow-color))
    blur(0.08px);
}

.ring-ellipse,
.ring-front-path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ring-back-shadow {
  stroke: var(--ring-dark);
  stroke-width: 12;
  opacity: 0.52;
}

.ring-back-main {
  stroke: var(--ring-mid);
  stroke-width: 6;
  opacity: 0.8;
}

.ring-back-inner {
  stroke: var(--ring-highlight);
  stroke-width: 2;
  opacity: 0.28;
}

.ring-front-main {
  stroke: var(--ring-light);
  stroke-width: 6.4;
  opacity: 0.96;
}

.ring-front-highlight {
  stroke: var(--ring-highlight);
  stroke-width: 2.4;
  opacity: 0.68;
}

/* =========================
   名稱
========================= */

.planet-name {
  position: absolute;
  bottom: -9px;

  max-width: 136px;
  padding: 6px 15px;

  color: #ffffff !important;

  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.03em;

  background:
    radial-gradient(circle at 50% 0%, rgba(165, 140, 255, 0.16), transparent 58%),
    rgba(6, 8, 18, 0.86) !important;

  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  border-radius: 999px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: none;
  z-index: 30;

  border: 1px solid rgba(255, 255, 255, 0.16) !important;

  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.32),
    0 0 12px rgba(145, 120, 255, 0.14),
    inset 0 0 10px rgba(255, 255, 255, 0.04);

  opacity: 0.96;

  transition:
    opacity 0.25s ease,
    transform 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.planet-scan,
.planet-aura,
.planet-ring,
.planet-texture,
.planet-cloud-layer,
.planet-shadow-layer,
.planet-atmosphere,
.planet-shine,
.planet-glint {
  pointer-events: none !important;
}

/* =========================
   搜尋 / 標籤高亮狀態
========================= */

:global(.PlanetNode.highlight) {
  opacity: 1 !important;
  z-index: 600 !important;
}

:global(.PlanetNode.highlight .planet-body) {
  transform: scale(1.14) !important;
  filter: brightness(1.16) saturate(1.18) !important;
}

:global(.PlanetNode.primary-highlight) {
  opacity: 1 !important;
  z-index: 760 !important;
}

:global(.PlanetNode.primary-highlight .planet-body) {
  transform: scale(1.18) !important;
  filter: brightness(1.2) saturate(1.22) !important;

  box-shadow:
    inset -22px -25px 30px rgba(0, 0, 0, 0.46),
    inset 11px 10px 22px rgba(255, 255, 255, 0.24),
    0 0 20px rgba(255, 255, 255, 0.42),
    0 0 48px var(--planet-glow-color),
    0 0 90px var(--planet-glow-color-2) !important;
}

:global(.PlanetNode.primary-highlight .planet-name) {
  opacity: 1 !important;
  border-color: rgba(255, 255, 255, 0.36) !important;
  background: rgba(18, 22, 42, 0.86) !important;

  box-shadow:
    0 0 14px rgba(255, 255, 255, 0.22),
    0 10px 28px rgba(0, 0, 0, 0.34) !important;
}

:global(.PlanetNode.primary-highlight .planet-scan) {
  opacity: 0.92 !important;
  transform: translate(-50%, -50%) scale(1.12) !important;
  border-color: rgba(255, 255, 255, 0.32) !important;
}

:global(.PlanetNode.primary-highlight .planet-ring) {
  filter:
    drop-shadow(0 0 7px rgba(255, 255, 255, 0.26))
    drop-shadow(0 0 16px var(--planet-glow-color)) !important;
}

:global(.PlanetNode.related-highlight) {
  opacity: 1 !important;
  z-index: 560 !important;
}

:global(.PlanetNode.related-highlight .planet-body) {
  transform: scale(1.09) !important;
  filter: brightness(1.12) saturate(1.12) !important;

  box-shadow:
    inset -22px -25px 30px rgba(0, 0, 0, 0.46),
    inset 11px 10px 22px rgba(255, 255, 255, 0.24),
    0 0 18px rgba(124, 190, 255, 0.26),
    0 0 42px var(--planet-glow-color-2) !important;
}

:global(.PlanetNode.related-highlight .planet-name) {
  opacity: 1 !important;
  border-color: rgba(124, 190, 255, 0.28) !important;
  background: rgba(12, 18, 34, 0.82) !important;
}

:global(.PlanetNode.related-highlight .planet-scan) {
  opacity: 0.76 !important;
  border-color: rgba(124, 190, 255, 0.22) !important;
}

:global(.PlanetNode.related-highlight .planet-ring) {
  filter:
    drop-shadow(0 0 5px rgba(124, 190, 255, 0.18))
    drop-shadow(0 0 12px var(--planet-glow-color-2)) !important;
}

:global(.PlanetNode.dim) {
  opacity: 0.15 !important;
  filter: grayscale(1) blur(1px) brightness(0.55) !important;
  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    scale(0.9) !important;
}

@media (prefers-reduced-motion: reduce) {
  .PlanetNode,
  .PlanetNode * {
    transition: none !important;
  }
}
</style>