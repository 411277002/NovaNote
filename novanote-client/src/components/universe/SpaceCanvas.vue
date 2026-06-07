<template>
  <div
    ref="viewportRef"
    class="space-canvas-viewport"
    :class="{ 'is-panning': isDragging, 'node-dragging': isNodeDragging }"
    @mousedown.self="startPan"
    @wheel="handleWheel"
  >
    <div class="nebula-container" :style="nebulaStyle">
      <div class="nebula blue"></div>
      <div class="nebula purple"></div>
      <div class="nebula pink"></div>
    </div>

    <div class="stars-parallax" :style="parallaxStyle">
      <div class="star-layer tiny"></div>
      <div class="star-layer medium"></div>
      <div class="star-layer large"></div>
    </div>

    <!-- 連結線圖層 -->
    <canvas ref="linkCanvasRef" class="link-canvas"></canvas>

    <div class="canvas-content" :style="canvasStyle">
      <slot></slot>
    </div>

    <div class="coords-info">
      SPACE EXPLORER | ZOOM: {{ (scale * 100).toFixed(0) }}%
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch
} from 'vue'

const VIEW_STATE_KEY = 'novanote-universe-view-state'

const props = defineProps({
  links: {
    type: Array,
    default: () => []
  },
  activeFilterTag: {
    type: String,
    default: null
  },
  highlightLinkKeys: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['scale-change'])

const scale = ref(1)
const offset = reactive({ x: 0, y: 0 })
const isDragging = ref(false)
const isNodeDragging = ref(false)

const viewportRef = ref(null)
const linkCanvasRef = ref(null)

let resizeObserver = null
let drawRafId = null
let panRafId = null
let latestPanEvent = null

const MIN_SCALE = 0.3
const MAX_SCALE = 2.5

const canvasStyle = computed(() => ({
  transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale.value})`,
  transformOrigin: '0 0',
  transition: isDragging.value
    ? 'none'
    : 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)'
}))

const parallaxStyle = computed(() => ({
  transform: `translate(${offset.x * 0.15}px, ${offset.y * 0.15}px) scale(${
    1 + (scale.value - 1) * 0.3
  })`,
  transition: isDragging.value ? 'none' : 'transform 0.2s linear'
}))

const nebulaStyle = computed(() => ({
  transform: `translate(${offset.x * 0.05}px, ${offset.y * 0.05}px)`,
  transition: isDragging.value ? 'none' : 'transform 0.5s ease-out'
}))

const clamp = (value, min, max) => {
  return Math.min(max, Math.max(min, value))
}

const saveViewState = () => {
  localStorage.setItem(
    VIEW_STATE_KEY,
    JSON.stringify({
      scale: scale.value,
      offsetX: offset.x,
      offsetY: offset.y
    })
  )
}

const restoreViewState = () => {
  try {
    const raw = localStorage.getItem(VIEW_STATE_KEY)
    if (!raw) return

    const saved = JSON.parse(raw)

    if (typeof saved.scale === 'number') {
      scale.value = clamp(saved.scale, MIN_SCALE, MAX_SCALE)
    }

    if (typeof saved.offsetX === 'number') {
      offset.x = saved.offsetX
    }

    if (typeof saved.offsetY === 'number') {
      offset.y = saved.offsetY
    }
  } catch (err) {
    console.warn('讀取宇宙畫面位置失敗:', err)
  }
}

const scheduleDrawLinks = (force = false) => {
  if (isNodeDragging.value && !force) return
  if (drawRafId) return

  drawRafId = requestAnimationFrame(() => {
    drawRafId = null
    if (!isNodeDragging.value || force) {
      drawLinks()
    }
  })
}

const handleWheel = (event) => {
  event.preventDefault()

  const viewport = viewportRef.value
  if (!viewport) return

  const rect = viewport.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  const oldScale = scale.value
  const zoomFactor = event.deltaY > 0 ? 0.92 : 1.08
  const newScale = clamp(oldScale * zoomFactor, MIN_SCALE, MAX_SCALE)

  if (newScale === oldScale) return

  const worldX = (mouseX - offset.x) / oldScale
  const worldY = (mouseY - offset.y) / oldScale

  scale.value = newScale
  emit('scale-change', scale.value)

  offset.x = mouseX - worldX * newScale
  offset.y = mouseY - worldY * newScale

  saveViewState()
  scheduleDrawLinks()
}

const startPan = (event) => {
  if (event.button !== 0) return

  event.preventDefault()
  event.stopPropagation()

  isDragging.value = true

  const startOffsetX = offset.x
  const startOffsetY = offset.y
  const startX = event.clientX
  const startY = event.clientY

  const applyPan = () => {
    panRafId = null

    if (!latestPanEvent) return

    offset.x = startOffsetX + latestPanEvent.clientX - startX
    offset.y = startOffsetY + latestPanEvent.clientY - startY

    scheduleDrawLinks()
  }

  const onMouseMove = (moveEvent) => {
    latestPanEvent = moveEvent

    if (!panRafId) {
      panRafId = requestAnimationFrame(applyPan)
    }
  }

  const onMouseUp = () => {
    isDragging.value = false

    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)

    if (panRafId) {
      cancelAnimationFrame(panRafId)
      panRafId = null
    }

    latestPanEvent = null
    saveViewState()
    scheduleDrawLinks()
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const resizeCanvas = () => {
  const viewport = viewportRef.value
  const canvas = linkCanvasRef.value

  if (!viewport || !canvas) return

  const rect = viewport.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  scheduleDrawLinks()
}

const getNodeElement = (type, id) => {
  if (!id) return null

  if (type === 'planet') {
    return document.querySelector(`.PlanetNode[data-id="${id}"]`)
  }

  return document.querySelector(`.floating-card[data-id="${id}"]`)
}

const getElementCenter = (el) => {
  const viewport = viewportRef.value

  if (!viewport || !el) return null

  const viewportRect = viewport.getBoundingClientRect()
  const rect = el.getBoundingClientRect()

  return {
    x: rect.left - viewportRect.left + rect.width / 2,
    y: rect.top - viewportRect.top + rect.height / 2
  }
}

const nodeKey = (type, id) => {
  return `${type}:${String(id)}`
}

const getLinkPairKey = (link) => {
  const sourceType = link.source_type || 'note'
  const targetType = link.target_type || 'note'

  return [
    nodeKey(sourceType, link.source_id),
    nodeKey(targetType, link.target_id)
  ].sort().join('__')
}

const drawSimpleLink = (ctx, from, to, state = 'normal') => {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)

  if (distance < 2) return

  const opacityMap = {
    normal: 0.72,
    highlight: 1,
    dim: 0.08
  }

  const widthMap = {
    normal: 1.8,
    highlight: 2.6,
    dim: 1
  }

  const glowMap = {
    normal: 10,
    highlight: 18,
    dim: 0
  }

  const lineOpacity = opacityMap[state] ?? opacityMap.normal
  const lineWidth = widthMap[state] ?? widthMap.normal
  const glow = glowMap[state] ?? glowMap.normal

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (state !== 'dim') {
    const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
    gradient.addColorStop(0, `rgba(143, 124, 255, ${lineOpacity})`)
    gradient.addColorStop(0.5, `rgba(185, 235, 255, ${lineOpacity})`)
    gradient.addColorStop(1, `rgba(81, 186, 252, ${lineOpacity})`)

    ctx.strokeStyle = gradient
    ctx.shadowBlur = glow
    ctx.shadowColor = `rgba(143, 124, 255, ${0.55 * lineOpacity})`
  } else {
    ctx.strokeStyle = `rgba(170, 180, 210, ${lineOpacity})`
    ctx.shadowBlur = 0
  }

  ctx.lineWidth = lineWidth

  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()

  if (state === 'highlight') {
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'

    ctx.beginPath()
    ctx.arc(from.x, from.y, 3.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(to.x, to.y, 3.2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

const drawLinks = () => {
  if (isNodeDragging.value) return

  const canvas = linkCanvasRef.value
  const viewport = viewportRef.value

  if (!canvas || !viewport) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = viewport.getBoundingClientRect()

  ctx.clearRect(0, 0, rect.width, rect.height)

  const drawnPairs = new Set()
  const highlightSet = new Set(props.highlightLinkKeys || [])
  const isFiltering = !!props.activeFilterTag

  props.links.forEach((link) => {
    const sourceType = link.source_type || 'note'
    const targetType = link.target_type || 'note'

    if (targetType === 'url') return

    const pairKey = getLinkPairKey(link)

    // A→B 和 B→A 視覺上只畫一條
    if (drawnPairs.has(pairKey)) return
    drawnPairs.add(pairKey)

    const sourceEl = getNodeElement(sourceType, link.source_id)
    const targetEl = getNodeElement(targetType, link.target_id)

    if (!sourceEl || !targetEl) return

    const from = getElementCenter(sourceEl)
    const to = getElementCenter(targetEl)

    if (!from || !to) return

    const lineState = !isFiltering
      ? 'normal'
      : highlightSet.has(pairKey)
        ? 'highlight'
        : 'dim'

    drawSimpleLink(ctx, from, to, lineState)
  })
}


const focusNode = async (type, id) => {
  await nextTick()

  const viewport = viewportRef.value
  const el = getNodeElement(type, id)

  if (!viewport || !el) {
    console.warn('找不到要聚焦的節點:', type, id)
    return
  }

  const viewportRect = viewport.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  const viewportCenterX = viewportRect.width / 2
  const viewportCenterY = viewportRect.height / 2

  const nodeCenterX = elRect.left - viewportRect.left + elRect.width / 2
  const nodeCenterY = elRect.top - viewportRect.top + elRect.height / 2

  const moveX = viewportCenterX - nodeCenterX
  const moveY = viewportCenterY - nodeCenterY

  offset.x += moveX
  offset.y += moveY

  saveViewState()
  scheduleDrawLinks()

  el.classList.add('focus-pulse')

  setTimeout(() => {
    el.classList.remove('focus-pulse')
  }, 1200)
}

const handleNodeDragStart = () => {
  isNodeDragging.value = true
  document.body.classList.add('is-dragging-node')

  if (drawRafId) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }
}

const handleNodeDragEnd = () => {
  isNodeDragging.value = false
  document.body.classList.remove('is-dragging-node')
  scheduleDrawLinks(true)
}

watch(
  () => props.links,
  () => {
    scheduleDrawLinks()
  },
  { deep: true }
)

watch(
  () => props.highlightLinkKeys,
  () => {
    scheduleDrawLinks()
  },
  { deep: true }
)

watch(
  () => props.activeFilterTag,
  () => {
    scheduleDrawLinks()
  }
)

watch(scale, () => {
  emit('scale-change', scale.value)
  scheduleDrawLinks()
})

onMounted(async () => {
  await nextTick()

  restoreViewState()
  emit('scale-change', scale.value)
  resizeCanvas()


  resizeObserver = new ResizeObserver(() => {
    resizeCanvas()
  })

  if (viewportRef.value) {
    resizeObserver.observe(viewportRef.value)
  }

  window.addEventListener('resize', resizeCanvas)
  window.addEventListener('novanote:node-drag-start', handleNodeDragStart)
  window.addEventListener('novanote:node-drag-end', handleNodeDragEnd)
})

onBeforeUnmount(() => {

  if (drawRafId) {
    cancelAnimationFrame(drawRafId)
    drawRafId = null
  }

  if (panRafId) {
    cancelAnimationFrame(panRafId)
    panRafId = null
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('novanote:node-drag-start', handleNodeDragStart)
  window.removeEventListener('novanote:node-drag-end', handleNodeDragEnd)
})

defineExpose({
  scale,
  focusNode
})
</script>

<style scoped>
.space-canvas-viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  cursor: grab;

  background: transparent;
}

.space-canvas-viewport:active,
.space-canvas-viewport.is-panning {
  cursor: grabbing;
}

.space-canvas-viewport.node-dragging .nebula,
.space-canvas-viewport.node-dragging .star-layer {
  animation-play-state: paused !important;
}

.space-canvas-viewport.node-dragging .link-canvas {
  opacity: 0.55;
}

.space-canvas-viewport::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 120px 120px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 75%);
  opacity: 0.25;
  z-index: 2;
}

/* 星雲 */
.nebula-container {
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
  filter: blur(90px);
  opacity: 0.58;
  z-index: 1;
}

.nebula {
  position: absolute;
  border-radius: 50%;
  opacity: 0.55;
}

.nebula.blue {
  width: 680px;
  height: 680px;
  background: radial-gradient(circle, rgba(56, 118, 255, 0.55), transparent 68%);
  top: 18%;
  left: 9%;
  animation: float 22s infinite alternate;
}

.nebula.purple {
  display: none;
}

.nebula.pink {
  display: none;
}

/* 星星 */
.stars-parallax {
  position: absolute;
  inset: -100%;
  width: 300%;
  height: 300%;
  pointer-events: none;
  z-index: 3;
}

.star-layer {
  position: absolute;
  inset: 0;
  background: transparent;
}

.star-layer.tiny {
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.85) 100%, transparent),
    radial-gradient(1px 1px at 65% 70%, rgba(255,255,255,0.6) 100%, transparent),
    radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.5) 100%, transparent);
  background-size: 180px 180px;
  opacity: 0.34;
}

.star-layer.medium {
  background-image:
    radial-gradient(1.5px 1.5px at 50% 50%, rgba(255,255,255,0.9) 100%, transparent),
    radial-gradient(1.5px 1.5px at 20% 75%, rgba(180,190,255,0.9) 100%, transparent);
  background-size: 340px 340px;
  opacity: 0.48;
  animation: twinkle 4.5s infinite ease-in-out;
}

.star-layer.large {
  background-image:
    radial-gradient(2px 2px at 80% 10%, rgba(124,140,255,0.9) 100%, transparent),
    radial-gradient(2px 2px at 18% 66%, rgba(255,255,255,0.7) 100%, transparent);
  background-size: 520px 520px;
  opacity: 0.25;
}

/* 連結線圖層 */
.link-canvas {
  position: absolute;
  inset: 0;
  z-index: 8;
  pointer-events: none;
}

/* 內容 */
.canvas-content {
  position: absolute;
  left: 0;
  top: 0;

  width: 5000px;
  height: 3200px;

  pointer-events: none;
  z-index: 10;
  will-change: transform;
}

:deep(.canvas-content > *) {
  pointer-events: auto;
}

.coords-info {
  position: fixed;
  bottom: 20px;
  left: 43%;
  color: rgba(255, 255, 255, 0.42);
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  pointer-events: none;
  z-index: 50;
}

/* 動畫 */
@keyframes float {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(50px, 100px) scale(1.1);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.28;
  }

  50% {
    opacity: 0.72;
  }
}

:deep(.focus-pulse) {
  animation: focusPulse 1.2s ease;
}

@keyframes focusPulse {
  0% {
    filter: drop-shadow(0 0 0 rgba(124, 140, 255, 0));
  }

  35% {
    filter:
      drop-shadow(0 0 18px rgba(255, 255, 255, 0.75))
      drop-shadow(0 0 42px rgba(124, 140, 255, 0.7));
  }

  100% {
    filter: drop-shadow(0 0 0 rgba(124, 140, 255, 0));
  }
}
</style>