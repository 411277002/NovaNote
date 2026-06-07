<template>
  <div
    ref="cardRef"
    class="floating-card hud-note-card"
    :class="{ dragging: isDragging }"
    :data-id="note.id"
    :style="cardStyle"
    @mousedown="onStartDrag"
    @contextmenu.prevent="onRightClick"
  >
    <span class="hud-corner corner-tl"></span>
    <span class="hud-corner corner-tr"></span>
    <span class="hud-corner corner-bl"></span>
    <span class="hud-corner corner-br"></span>

    <div class="hud-card-content">
      <h4 class="title">
        {{ note.title || '無標題' }}
      </h4>

      <div
        v-if="note.tags && note.tags.length > 0"
        class="card-tags"
      >
        <button
          v-for="tag in note.tags"
          :key="tag"
          class="mini-tag"
          type="button"
          @mousedown.stop
          @click.stop="onTagClick(tag)"
        >
          #{{ tag }}
        </button>
      </div>
    </div>

    <div class="card-glow"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useNotesStore } from '../../stores/notes'

const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  canvasScale: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['contextmenu', 'edit', 'filter-tag'])

const notesStore = useNotesStore()

const cardRef = ref(null)
const isDragging = ref(false)

const getSafePosition = (value, fallback = 0.5) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const cardStyle = computed(() => ({
  left: `${getSafePosition(props.note.x_pos) * 100}%`,
  top: `${getSafePosition(props.note.y_pos) * 100}%`
}))

const onTagClick = (tag) => {
  emit('filter-tag', tag)
}

const onRightClick = (event) => {
  emit('contextmenu', event, props.note)
}

const shouldIgnoreDrag = (target) => {
  return Boolean(
    target.closest('button') ||
    target.closest('a') ||
    target.closest('input') ||
    target.closest('select') ||
    target.closest('textarea') ||
    target.closest('.mini-tag')
  )
}

const findClosestPlanet = (cardEl) => {
  const cardRect = cardEl.getBoundingClientRect()
  const cardCenterX = cardRect.left + cardRect.width / 2
  const cardCenterY = cardRect.top + cardRect.height / 2

  const planetElements = document.querySelectorAll('.PlanetNode')

  let closestPlanetId = null
  let targetPlanetEl = null
  let minDistance = Infinity

  const SNAP_RADIUS = 100

  planetElements.forEach((planetEl) => {
    const planetRect = planetEl.getBoundingClientRect()
    const planetCenterX = planetRect.left + planetRect.width / 2
    const planetCenterY = planetRect.top + planetRect.height / 2

    const distance = Math.hypot(
      planetCenterX - cardCenterX,
      planetCenterY - cardCenterY
    )

    if (distance < SNAP_RADIUS && distance < minDistance) {
      minDistance = distance
      closestPlanetId = planetEl.dataset.id
      targetPlanetEl = planetEl
    }
  })

  return {
    closestPlanetId,
    targetPlanetEl,
    minDistance
  }
}

const animateSnapToPlanet = async (cardEl, planetEl, planetId) => {
  const parent = cardEl.offsetParent
  if (!parent || !planetEl) return

  const parentRect = parent.getBoundingClientRect()
  const planetRect = planetEl.getBoundingClientRect()

  const planetCenterX = planetRect.left + planetRect.width / 2
  const planetCenterY = planetRect.top + planetRect.height / 2

  const finalXPercent =
    ((planetCenterX - parentRect.left) / parent.offsetWidth) * 100

  const finalYPercent =
    ((planetCenterY - parentRect.top) / parent.offsetHeight) * 100

  cardEl.style.transition =
    'left 0.32s ease-out, top 0.32s ease-out, opacity 0.32s ease-out, transform 0.32s ease-out'
  cardEl.style.left = `${finalXPercent}%`
  cardEl.style.top = `${finalYPercent}%`
  cardEl.style.opacity = '0.25'
  cardEl.style.transform = 'translate(-50%, -50%) scale(0.72)'

  await new Promise((resolve) => {
    const done = () => {
      cardEl.removeEventListener('transitionend', done)
      resolve()
    }

    cardEl.addEventListener('transitionend', done, { once: true })

    setTimeout(resolve, 380)
  })

  cardEl.style.opacity = ''
  cardEl.style.left = ''
  cardEl.style.top = ''
  cardEl.style.transform = ''
  cardEl.style.transition = ''

  try {
    await notesStore.moveNoteToPlanet(props.note.id, planetId)
  } catch (err) {
    console.error('歸類失敗:', err)
  }
}

const updateNotePosition = async (safeX, safeY) => {
  props.note.x_pos = safeX
  props.note.y_pos = safeY

  try {
    await notesStore.updateNotePosition(props.note.id, safeX, safeY)
  } catch (err) {
    console.error('更新位置失敗:', err)
  }
}

const onStartDrag = (event) => {
  if (event.button !== 0) return
  if (shouldIgnoreDrag(event.target)) return

  event.preventDefault()
  event.stopPropagation()

  const el = cardRef.value
  if (!el) return

  const parent = el.offsetParent
  if (!parent) return

  const startX = event.clientX
  const startY = event.clientY

  const initialLeft = el.offsetLeft
  const initialTop = el.offsetTop

  let moved = false
  let latestEvent = event
  let rafId = null
  let lastLeft = initialLeft
  let lastTop = initialTop

  isDragging.value = true
  window.dispatchEvent(new CustomEvent('novanote:node-drag-start'))

  el.style.transition = 'none'
  el.style.zIndex = '2000'
  el.style.willChange = 'transform'
  el.style.pointerEvents = 'none'
  el.classList.add('dragging')

  const applyMove = () => {
    rafId = null

    const deltaX = (latestEvent.clientX - startX) / props.canvasScale
    const deltaY = (latestEvent.clientY - startY) / props.canvasScale

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      moved = true
    }

    if (!moved) return

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
    el.classList.remove('dragging')

    el.style.zIndex = ''
    el.style.willChange = ''
    el.style.pointerEvents = ''

    window.dispatchEvent(new CustomEvent('novanote:node-drag-end'))
  }

  const onMouseUp = async () => {
    cleanup()

    if (!moved) {
      el.style.transition = ''
      el.style.removeProperty('--drag-x')
      el.style.removeProperty('--drag-y')

      emit('edit', props.note)
      return
    }

    const {
      closestPlanetId,
      targetPlanetEl,
      minDistance
    } = findClosestPlanet(el)

    const safeX = Math.min(
      0.995,
      Math.max(0.005, lastLeft / parent.offsetWidth)
    )

    const safeY = Math.min(
      0.995,
      Math.max(0.005, lastTop / parent.offsetHeight)
    )

    if (closestPlanetId && targetPlanetEl) {
      console.log(
        `🚀 成功吸附至星球 ID: ${closestPlanetId}，距離: ${minDistance.toFixed(2)}px`
      )

      el.style.left = `${safeX * 100}%`
      el.style.top = `${safeY * 100}%`
      el.style.removeProperty('--drag-x')
      el.style.removeProperty('--drag-y')
      el.style.transition = ''

      await animateSnapToPlanet(el, targetPlanetEl, closestPlanetId)
      return
    }

    el.style.transition = ''
    el.style.removeProperty('--drag-x')
    el.style.removeProperty('--drag-y')

    await updateNotePosition(safeX, safeY)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.floating-card {
  --hud-card-bg: rgba(8, 12, 28, 0.62);
  --hud-card-border: rgba(148, 163, 255, 0.22);
  --hud-card-border-hover: rgba(170, 185, 255, 0.5);
  --hud-card-inner-border: rgba(255, 255, 255, 0.035);

  --hud-card-text: #dbe4ff;
  --hud-card-title: #f4f6ff;
  --hud-card-title-glow: rgba(160, 170, 255, 0.45);

  --hud-card-line: rgba(160, 170, 255, 0.5);
  --hud-card-corner: rgba(150, 160, 255, 0.62);
  --hud-card-corner-hover: rgba(190, 200, 255, 0.92);

  --hud-card-glow: rgba(130, 145, 255, 0.28);
  --hud-card-glow-soft: rgba(130, 145, 255, 0.16);
  --hud-card-shadow: rgba(0, 0, 0, 0.34);

  --hud-card-dot: #9aa6ff;
  --hud-connector-bg: rgba(15, 20, 44, 0.92);

  --hud-tag-text: #aebcff;
  --hud-tag-bg: rgba(130, 145, 255, 0.1);
  --hud-tag-border: rgba(150, 165, 255, 0.2);
  --hud-tag-text-hover: #ffffff;
  --hud-tag-bg-hover: rgba(130, 145, 255, 0.18);
  --hud-tag-border-hover: rgba(190, 200, 255, 0.42);

  position: absolute;

  width: 180px;
  min-height: 112px;

  padding: 22px 24px;

  color: var(--hud-card-text);
  background: var(--hud-card-bg);

  border: 1px solid var(--hud-card-border);
  border-radius: 4px;

  cursor: grab;
  user-select: none;
  will-change: transform;
  backface-visibility: hidden;

  display: flex;
  flex-direction: column;

  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  box-shadow:
    inset 0 0 0 1px var(--hud-card-inner-border),
    0 0 18px var(--hud-card-glow-soft),
    0 18px 42px var(--hud-card-shadow);

  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    translateZ(0);

  overflow: visible;

  transition:
    box-shadow 0.25s ease,
    transform 0.22s ease,
    opacity 0.35s ease,
    filter 0.35s ease,
    border-color 0.22s ease,
    background-color 0.22s ease,
    left 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    top 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  z-index: 10;
}

.floating-card::before {
  content: '';

  position: absolute;
  left: 16px;
  right: 16px;
  top: -1px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--hud-card-line),
      transparent
    );

  opacity: 0.72;
  pointer-events: none;
}

.floating-card::after {
  content: '';

  position: absolute;
  left: 16px;
  right: 16px;
  bottom: -1px;

  height: 1px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--hud-card-line),
      transparent
    );

  opacity: 0.42;
  pointer-events: none;
}

.floating-card:active {
  cursor: grabbing;
}

.floating-card:hover {
  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% - 5px + var(--drag-y, 0px))
    )
    scale(1.02);
  border-color: var(--hud-card-border-hover);

  box-shadow:
    inset 0 0 0 1px var(--hud-card-inner-border),
    0 0 24px var(--hud-card-glow),
    0 22px 54px var(--hud-card-shadow);
}

.floating-card.dragging {
  cursor: grabbing;
  transition: none !important;
  filter: none !important;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;

  box-shadow:
    inset 0 0 0 1px var(--hud-card-inner-border),
    0 12px 28px rgba(0, 0, 0, 0.42),
    0 0 16px var(--hud-card-glow-soft) !important;
}

.floating-card.dragging:hover {
  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    scale(1.04) !important;
}

.floating-card.dragging::before,
.floating-card.dragging::after {
  opacity: 0.22;
}

/* HUD 四角框線 */
.hud-corner {
  position: absolute;

  width: 14px;
  height: 14px;

  border-color: var(--hud-card-corner);
  opacity: 0.5;

  pointer-events: none;

  transition:
    border-color 0.22s ease,
    opacity 0.22s ease,
    filter 0.22s ease;

  border-radius: 2px;
}

.corner-tl {
  top: -1px;
  left: -1px;

  border-top: 2px solid;
  border-left: 2px solid;
}

.corner-tr {
  top: -1px;
  right: -1px;

  border-top: 2px solid;
  border-right: 2px solid;
}

.corner-bl {
  bottom: -1px;
  left: -1px;

  border-bottom: 2px solid;
  border-left: 2px solid;
}

.corner-br {
  bottom: -1px;
  right: -1px;

  border-bottom: 2px solid;
  border-right: 2px solid;
}

.floating-card:hover .hud-corner {
  border-color: var(--hud-card-corner-hover);
  filter: drop-shadow(0 0 6px var(--hud-card-glow));
}

/* 小接點，模仿參考圖的節點感 */
.hud-connector {
  position: absolute;

  width: 10px;
  height: 10px;

  background: var(--hud-connector-bg);
  border: 1px solid var(--hud-card-corner);
  border-radius: 3px;

  box-shadow:
    0 0 8px var(--hud-card-glow-soft),
    inset 0 0 4px var(--hud-card-inner-border);

  pointer-events: none;
  z-index: 15;
}

/* 內容 */
.hud-card-content {
  position: relative;
  z-index: 20;

  display: flex;
  flex-direction: column;
  gap: 15px;

  pointer-events: none;
}

.title {
  margin: 0;

  color: var(--hud-card-title);

  font-size: 1.02rem;
  font-weight: 950;
  line-height: 1.35;
  letter-spacing: 0.08em;

  text-shadow:
    0 0 10px var(--hud-card-title-glow);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 標籤 */
.card-tags {
  position: relative;
  z-index: 30;

  display: flex;
  flex-wrap: wrap;
  gap: 7px;

  pointer-events: auto;
}

.mini-tag {
  position: relative;
  z-index: 31;

  max-width: 100%;

  display: inline-flex;
  align-items: center;

  padding: 4px 8px;

  color: var(--hud-tag-text);
  background: var(--hud-tag-bg);
  border: 1px solid var(--hud-tag-border);
  border-radius: 3px;

  outline: none;
  cursor: pointer;

  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.04em;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  pointer-events: auto;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.mini-tag:hover {
  color: var(--hud-tag-text-hover);
  background: var(--hud-tag-bg-hover);
  border-color: var(--hud-tag-border-hover);
  box-shadow: 0 0 10px var(--hud-card-glow-soft);
  transform: translateY(-1px);
}

/* 右下角發光點 */
.card-glow {
  position: absolute;
  right: 14px;
  bottom: 13px;

  width: 6px;
  height: 6px;

  background: var(--hud-card-dot);
  border-radius: 50%;

  box-shadow:
    0 0 8px var(--hud-card-dot),
    0 0 18px var(--hud-card-dot);

  opacity: 0.82;
  pointer-events: none;
  z-index: 25;
}

.floating-card.dragging .card-glow {
  opacity: 0.35;
  box-shadow: none;
}

/* =========================
   搜尋 / 標籤高亮相容
========================= */

/* 一般搜尋命中 */
:global(.floating-card.highlight) {
  opacity: 1 !important;
  border-color: var(--hud-card-border-hover) !important;

  box-shadow:
    inset 0 0 0 1px var(--hud-card-inner-border),
    0 0 28px var(--hud-card-glow),
    0 0 64px var(--hud-card-glow-soft),
    0 22px 54px var(--hud-card-shadow) !important;

  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    scale(1.1) !important;
  z-index: 500 !important;
}

/* 標籤主節點：有該標籤的卡片，最亮 */
:global(.floating-card.primary-highlight) {
  opacity: 1 !important;
  border-color: var(--hud-card-border-hover) !important;

  background: var(--hud-card-bg) !important;

  box-shadow:
    inset 0 0 0 1px var(--hud-card-inner-border),
    0 0 16px rgba(255, 255, 255, 0.22),
    0 0 38px var(--hud-card-glow),
    0 0 70px var(--hud-card-glow-soft) !important;

  filter: brightness(1.06) saturate(1.06) !important;
  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    scale(1.08) !important;
  z-index: 700 !important;
}

/* 標籤關聯節點：與主節點有連結，次亮 */
:global(.floating-card.related-highlight) {
  opacity: 1 !important;
  border-color: var(--hud-card-border-hover) !important;

  background: var(--hud-card-bg) !important;

  box-shadow:
    inset 0 0 0 1px var(--hud-card-inner-border),
    0 0 12px var(--hud-card-glow-soft),
    0 0 28px var(--hud-card-glow-soft) !important;

  filter: brightness(1.02) saturate(1.03) !important;
  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    scale(1.03) !important;
  z-index: 520 !important;
}

/* 無關節點 */
:global(.floating-card.dim) {
  opacity: 0.12 !important;
  filter: blur(2px) grayscale(1) brightness(0.55) !important;
  transform:
    translate(
      calc(-50% + var(--drag-x, 0px)),
      calc(-50% + var(--drag-y, 0px))
    )
    scale(0.92) !important;
  pointer-events: none !important;
}

:global(.floating-card.primary-highlight .mini-tag) {
  color: var(--hud-tag-text-hover);
  background: var(--hud-tag-bg-hover);
  border-color: var(--hud-tag-border-hover);
}

:global(.floating-card.related-highlight .mini-tag) {
  color: var(--hud-tag-text);
  background: var(--hud-tag-bg);
  border-color: var(--hud-tag-border);
}

@media (max-width: 768px) {
  .floating-card {
    width: 180px;
    min-height: 104px;
    padding: 19px 20px;
  }

  .title {
    font-size: 0.94rem;
  }
}
</style>