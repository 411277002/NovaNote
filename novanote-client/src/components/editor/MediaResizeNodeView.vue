<template>
  <NodeViewWrapper
    class="nova-media-node"
    :class="{
      'is-selected': selected,
      'is-video': isVideo,
      'is-image': isImage
    }"
    :style="wrapperStyle"
    @click.stop
  >
    <img
      v-if="isImage"
      class="nova-resizable-image"
      :src="node.attrs.src"
      :alt="node.attrs.alt || '圖片'"
      draggable="false"
    />

    <div v-else class="nova-resizable-video">
      <video
        v-if="node.attrs.embedType === 'video'"
        class="nova-video-frame"
        :src="node.attrs.src"
        controls
      ></video>

      <iframe
        v-else
        class="nova-video-frame"
        :src="node.attrs.src"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>

    <button
      v-if="selected"
      class="media-resize-dot"
      type="button"
      title="拖拉調整大小"
      @mousedown.prevent.stop="startResize"
    ></button>
  </NodeViewWrapper>
</template>

<script setup>
import { computed, onBeforeUnmount } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

let startX = 0
let startWidth = 0
let resizing = false

const isImage = computed(() => props.node.type.name === 'image')
const isVideo = computed(() => props.node.type.name === 'videoEmbed')

const widthValue = computed(() => {
  return props.node.attrs.width || (isImage.value ? '420px' : '560px')
})

const wrapperStyle = computed(() => {
  return {
    width: widthValue.value,
    maxWidth: '100%'
  }
})

const getNumberWidth = () => {
  const width = String(widthValue.value)

  if (width.endsWith('%')) {
    const parent = props.editor.view.dom.closest('.document-shell')
    const parentWidth = parent?.clientWidth || 800
    return parentWidth * (Number(width.replace('%', '')) / 100)
  }

  return Number(width.replace('px', '')) || 420
}

const startResize = (event) => {
  resizing = true
  startX = event.clientX
  startWidth = getNumberWidth()

  document.body.classList.add('is-resizing-media')

  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
}

const handleResize = (event) => {
  if (!resizing) return

  const delta = event.clientX - startX
  const nextWidth = Math.round(startWidth + delta)

  const editorShell = props.editor.view.dom.closest('.document-shell')
  const maxWidth = editorShell
    ? Math.max(260, editorShell.clientWidth - 120)
    : 900

  const minWidth = isImage.value ? 180 : 260
  const safeWidth = Math.max(minWidth, Math.min(nextWidth, maxWidth))

  props.updateAttributes({
    width: `${safeWidth}px`
  })
}

const stopResize = () => {
  resizing = false

  document.body.classList.remove('is-resizing-media')

  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
}

onBeforeUnmount(() => {
  stopResize()
})
</script>