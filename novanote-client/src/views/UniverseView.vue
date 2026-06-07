<template>
  <div
    class="universe-container"
    :style="{ '--universe-bg-image': `url(${universeBg})` }"
    @pointerdown.capture="onUniversePointerDown"
    @pointerup.capture="onUniversePointerUp"
  >
    <SidebarPanel
      v-model:search-query="searchQuery"
      v-model:collapsed="isSidebarCollapsed"
      @mousedown.stop
      @select-planet="focusPlanetFromSidebar"
      @select-note="focusNoteFromSidebar"
    />

    <div
      v-if="isSidebarCollapsed"
      class="floating-brand"
      @mousedown.stop
    >
      <img
        :src="logoDark"
        alt="NovaNote Logo"
        class="floating-brand-logo"
      />
      <span class="floating-brand-name">NovaNote</span>
    </div>

    <nav class="universe-nav" @mousedown.stop>
      <div class="nav-placeholder"></div>

      <div class="nav-actions" @click.stop>
        <div class="user-menu-wrapper">
          <button
            class="user-avatar-btn"
            type="button"
            title="使用者選單"
            @click.stop="toggleUserMenu"
          >
            <span class="avatar-circle">
              <i class="fa-solid fa-user-astronaut"></i>
            </span>

            <i
              class="fa-solid fa-chevron-down avatar-chevron"
              :class="{ open: showUserMenu }"
            ></i>
          </button>

          <transition name="user-menu-fade">
            <div
              v-if="showUserMenu"
              class="user-dropdown"
              @click.stop
            >
              <div class="user-dropdown-frame-corner top-left"></div>
              <div class="user-dropdown-frame-corner top-right"></div>
              <div class="user-dropdown-frame-corner bottom-left"></div>
              <div class="user-dropdown-frame-corner bottom-right"></div>

              <div class="user-menu-group">
                <button class="user-menu-item" type="button" @click="handleOpenProfile">
                  <span>
                    <i class="fa-solid fa-user-pen"></i>
                  </span>

                  <strong>個人檔案</strong>

                  <i class="fa-solid fa-chevron-right item-arrow"></i>
                </button>

                <button class="user-menu-item" type="button" @click="handleOpenStarOverviewFromMenu">
                  <span>
                    <i class="fa-solid fa-map-location-dot"></i>
                  </span>

                  <strong>星圖總覽</strong>

                  <i class="fa-solid fa-chevron-right item-arrow"></i>
                </button>

                <button class="user-menu-item trash" type="button" @click="handleOpenTrashFromMenu">
                  <span>
                    <i class="fa-solid fa-trash-can"></i>
                  </span>

                  <strong>星際回收站</strong>

                  <i class="fa-solid fa-chevron-right item-arrow"></i>
                </button>
              </div>

              <div class="user-menu-divider"></div>

              <div class="user-menu-group">
                <button class="user-menu-item" type="button" @click="handleAutoArrangeFromMenu">
                  <span>
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                  </span>

                  <strong>整理</strong>

                  <i class="fa-solid fa-chevron-right item-arrow"></i>
                </button>

                <button class="user-menu-item danger" type="button" @click="handleLogoutFromMenu">
                  <span>
                    <i class="fa-solid fa-right-from-bracket"></i>
                  </span>

                  <strong>登出</strong>

                  <i class="fa-solid fa-chevron-right item-arrow"></i>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </nav>

    <SpaceCanvas
      ref="canvasRef"
      :links="linksStore.links"
      :active-filter-tag="activeFilterTag || searchQuery"
      :highlight-link-keys="Array.from(graphHighlightContext.highlightLinks)"
      @scale-change="currentScale = $event"
    >
      <PlanetNode
        v-for="planet in planetsStore.planets"
        :key="'p-' + planet.id"
        :planet="planet"
        :canvas-scale="currentScale"
        :class="getSearchStatus('planet', planet.id)"
        @mousedown.stop
        @click="openPlanet"
        @contextmenu="handleContextMenu($event, planet, 'planet')"
      />

      <NoteCard
        v-for="note in notesStore.floatingNotes"
        :key="'n-' + note.id"
        :note="note"
        :canvas-scale="currentScale"
        :class="getSearchStatus('note', note.id)"
        @mousedown.stop
        @edit="openCardPreview"
        @filter-tag="handleTagFilter"
        @contextmenu="handleContextMenu($event, note, 'note')"
      />
    </SpaceCanvas>

    <FabButton
      @mousedown.stop
      @create-note="handleCreateNote"
      @create-planet="showPlanetModal = true"
    />

    <div
      v-if="showMiniMapPanel"
      class="mini-map-panel-mask"
      @click.self="showMiniMapPanel = false"
    >
      <aside class="mini-map-panel" @mousedown.stop>
        <header class="mini-map-panel-header">
          <div>
            <p>星圖總覽</p>
            <span>
              {{ planetsStore.planets.length }} 顆星球・{{ notesStore.floatingNotes.length }} 張漂浮卡片
            </span>
          </div>

          <button
            class="mini-map-panel-close"
            type="button"
            @click="showMiniMapPanel = false"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <MiniMap
          :planets="planetsStore.planets"
          :notes="notesStore.floatingNotes"
          @focus-node="handleMiniMapFocus"
          @open-note="handleMiniMapOpenNote"
          @open-planet="handleMiniMapOpenPlanet"
        />
      </aside>
    </div>

    <CreatePlanetModal
      v-if="showPlanetModal"
      @close="showPlanetModal = false"
      @create="handleCreatePlanet"
    />

    <PlanetLinkManagerModal
      v-if="showPlanetLinkManagerModal"
      :sourcePlanet="planetLinkManagerSource"
      :planets="planetsStore.planets"
      :links="linksStore.links"
      @close="closePlanetLinkManagerModal"
      @create-link="(payload) => createPlanetLink(payload)"
      @remove-link="removePlanetLink"
    />

    <PlanetOverlay
      v-if="selectedPlanet"
      :planet="selectedPlanet"
      :notes="notesInPlanet"
      :links-count="planetLinksOfCurrentPlanet.length"
      @close="closePlanet"
      @create-note="createNoteInPlanet"
      @save-name="savePlanetNameFromOverlay"
      @open-note="openPreviewNoteInEditor"
      @contextmenu-note="handlePlanetOverlayNoteContextMenu"
      @filter-tag="handleTagFilter"
      @update-note-tags="updateNoteTagsFromOverlay"
    />

    <CardPreviewPanel
      :note="selectedPreviewNote"
      :planet-name="getPlanetNameById(selectedPreviewNote?.planet_id)"
      :linked-items="linkedItemsForPreview"
      @close="closeCardPreview"
      @open-editor="openPreviewNoteInEditor"
      @filter-tag="handleTagFilter"
      @focus-linked-item="focusLinkedItemFromPreview"
    />

    <div
      v-if="contextMenu.show"
      class="custom-context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      @click.stop
    >
      <button
        v-if="contextMenu.type === 'note' && contextMenu.target?.planet_id"
        @click="handleLeavePlanet"
        class="menu-option"
      >
        離開星球
      </button>

      <button
        v-if="contextMenu.type === 'planet'"
        @click="openPlanetLinkManagerModal"
        class="menu-option"
      >
        管理星球連結
      </button>

      <button @click="confirmDelete" class="delete-option">
        抹除這個{{ contextMenu.type === 'note' ? '靈感' : '星球' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useNotesStore } from '../stores/notes'
import { usePlanetsStore } from '../stores/planets'
import { useLinksStore } from '../stores/links'
import { useEditorTabsStore } from '../stores/editorTabs'

import logoDark from '../assets/logo-dark.png'
import universeBg from '../assets/Universe.png'

import SidebarPanel from '../components/sidebar/SidebarPanel.vue'
import SpaceCanvas from '../components/universe/SpaceCanvas.vue'
import PlanetNode from '../components/universe/PlanetNode.vue'
import NoteCard from '../components/universe/NoteCard.vue'
import FabButton from '../components/universe/FabButton.vue'
import CardPreviewPanel from '../components/universe/CardPreviewPanel.vue'
import MiniMap from '../components/universe/MiniMap.vue'
import PlanetOverlay from '../components/universe/PlanetOverlay.vue'
import CreatePlanetModal from '../components/universe/CreatePlanetModal.vue'
import PlanetLinkManagerModal from '../components/universe/PlanetLinkManagerModal.vue'

const router = useRouter()

const authStore = useAuthStore()
const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()
const linksStore = useLinksStore()
const editorTabsStore = useEditorTabsStore()

/* =========================
   Basic State
========================= */

const searchQuery = ref('')
const isSidebarCollapsed = ref(false)

const canvasRef = ref(null)
const currentScale = ref(1)

const activeFilterTag = ref(null)

const selectedPlanet = ref(null)
const selectedPreviewNote = ref(null)

const showUserMenu = ref(false)
const showMiniMapPanel = ref(false)
const showPlanetModal = ref(false)
const showPlanetLinkManagerModal = ref(false)

const planetLinkManagerSource = ref(null)

let searchFocusTimer = null

const newPlanet = reactive({
  name: '',
  texture_type: 'rocky',
  color: '#646cff'
})

const planetLinkForm = reactive({
  target_id: '',
  display_text: ''
})

const contextMenu = reactive({
  show: false,
  x: 0,
  y: 0,
  target: null,
  type: ''
})

const pointerStart = reactive({
  x: 0,
  y: 0,
  shouldClear: false
})

/* =========================
   Computed
========================= */

const notesInPlanet = computed(() => {
  if (!selectedPlanet.value) return []

  const allNotes =
    notesStore.allNotes ||
    notesStore.notes ||
    notesStore.floatingNotes ||
    []

  return allNotes.filter(note => {
    return String(note.planet_id) === String(selectedPlanet.value.id)
  })
})

const planetLinksOfCurrentPlanet = computed(() => {
  if (!selectedPlanet.value) return []

  const planetId = String(selectedPlanet.value.id)

  return (linksStore.links || []).filter(link => {
    if (link.target_type === 'url') return false

    const sourceType = link.source_type || 'note'
    const targetType = link.target_type || 'note'

    const sourceMatch =
      String(sourceType) === 'planet' &&
      String(link.source_id) === planetId

    const targetMatch =
      String(targetType) === 'planet' &&
      String(link.target_id) === planetId

    return sourceMatch || targetMatch
  })
})

const linkedItemsForPreview = computed(() => {
  if (!selectedPreviewNote.value) return []

  const noteId = String(selectedPreviewNote.value.id)

  return (linksStore.links || [])
    .filter(link => {
      if (link.target_type === 'url') {
        return String(link.source_type || 'note') === 'note' && String(link.source_id) === noteId
      }

      const sourceMatch = String(link.source_type || 'note') === 'note' && String(link.source_id) === noteId
      const targetMatch = String(link.target_type || 'note') === 'note' && String(link.target_id) === noteId

      return sourceMatch || targetMatch
    })
    .map(link => {
      const sourceType = link.source_type || 'note'
      const targetType = link.target_type || 'note'

      if (link.target_type === 'url') {
        return {
          key: `url:${link.id}`,
          type: 'url',
          id: null,
          url: link.target_url,
          name: link.display_text || link.target_url || '外部連結'
        }
      }

      const noteIsSource = String(sourceType) === 'note' && String(link.source_id) === noteId

      const otherType = noteIsSource ? targetType : sourceType
      const otherId = noteIsSource ? link.target_id : link.source_id

      if (String(otherType) === 'planet') {
        const planet = planetsStore.planets.find(item => String(item.id) === String(otherId))

        return {
          key: `planet:${otherId}:${link.id}`,
          type: 'planet',
          id: otherId,
          name: planet?.name || `星球 ${otherId}`
        }
      }

      const note = notesStore.allNotes.find(item => String(item.id) === String(otherId))

      return {
        key: `note:${otherId}:${link.id}`,
        type: 'note',
        id: otherId,
        name: note?.title || `卡片 ${otherId}`
      }
    })
})

const graphHighlightContext = computed(() => {
  const tag = activeFilterTag.value?.trim()
  const query = searchQuery.value?.trim().toLowerCase()

  const primaryNodes = new Set()
  const relatedNodes = new Set()
  const highlightLinks = new Set()

  const allNotes =
    notesStore.allNotes ||
    notesStore.notes ||
    notesStore.floatingNotes ||
    []

  const allPlanets = planetsStore.planets || []

  if (!tag && !query) {
    return {
      primaryNodes,
      relatedNodes,
      highlightLinks
    }
  }

  if (tag) {
    allNotes.forEach((note) => {
      const tags = note.tags || []

      const matched = tags.some(t =>
        String(t).trim() === String(tag).trim()
      )

      if (matched) {
        primaryNodes.add(nodeKey('note', note.id))
      }
    })
  }

  if (!tag && query) {
    allNotes.forEach((note) => {
      const title = String(note.title || '').toLowerCase()
      const content = String(note.content || '').toLowerCase()

      const tags = note.tags || []
      const tagMatched = tags.some(t =>
        String(t).toLowerCase().includes(query)
      )

      const matched =
        title.includes(query) ||
        content.includes(query) ||
        tagMatched

      if (matched) {
        primaryNodes.add(nodeKey('note', note.id))
      }
    })

    allPlanets.forEach((planet) => {
      const name = String(planet.name || '').toLowerCase()

      if (name.includes(query)) {
        primaryNodes.add(nodeKey('planet', planet.id))
      }
    })
  }

  linksStore.links.forEach((link) => {
    if (link.target_type === 'url') return

    const sourceType = link.source_type || 'note'
    const targetType = link.target_type || 'note'

    const sourceKey = nodeKey(sourceType, link.source_id)
    const targetKey = nodeKey(targetType, link.target_id)

    const sourceIsPrimary = primaryNodes.has(sourceKey)
    const targetIsPrimary = primaryNodes.has(targetKey)

    if (sourceIsPrimary || targetIsPrimary) {
      highlightLinks.add(linkPairKey(link))

      if (sourceIsPrimary && !primaryNodes.has(targetKey)) {
        relatedNodes.add(targetKey)
      }

      if (targetIsPrimary && !primaryNodes.has(sourceKey)) {
        relatedNodes.add(sourceKey)
      }
    }
  })

  return {
    primaryNodes,
    relatedNodes,
    highlightLinks
  }
})

/* =========================
   Helpers
========================= */

const nodeKey = (type, id) => {
  return `${type}:${String(id)}`
}

const linkPairKey = (link) => {
  const sourceType = link.source_type || 'note'
  const targetType = link.target_type || 'note'

  return [
    nodeKey(sourceType, link.source_id),
    nodeKey(targetType, link.target_id)
  ].sort().join('__')
}

const getPlanetNameById = (planetId) => {
  if (!planetId) return ''

  const planet = planetsStore.planets.find(item => {
    return String(item.id) === String(planetId)
  })

  return planet?.name || ''
}

const getSearchStatus = (type, id) => {
  const query = searchQuery.value?.trim().toLowerCase()
  const filter = activeFilterTag.value?.trim()
  const key = nodeKey(type, id)

  if (filter || query) {
    const { primaryNodes, relatedNodes } = graphHighlightContext.value

    if (primaryNodes.has(key)) return 'primary-highlight'
    if (relatedNodes.has(key)) return 'related-highlight'

    return 'dim'
  }

  return ''
}

const hasActiveHighlightSelection = () => {
  return Boolean(activeFilterTag.value || searchQuery.value?.trim())
}

const clearHighlightSelection = () => {
  activeFilterTag.value = null
  searchQuery.value = ''
}

const isKeepHighlightTarget = (target) => {
  if (!target || !(target instanceof Element)) return false

  return Boolean(
    target.closest('.mini-tag') ||
    target.closest('.primary-highlight') ||
    target.closest('.related-highlight') ||
    target.closest('.sidebar-panel') ||
    target.closest('.SidebarPanel') ||
    target.closest('.floating-brand') ||
    target.closest('.universe-nav') ||
    target.closest('.modal-overlay') ||
    target.closest('.planet-overlay') ||
    target.closest('.planet-content-box') ||
    target.closest('.custom-context-menu') ||
    target.closest('.fab-button') ||
    target.closest('.FabButton') ||
    target.closest('button') ||
    target.closest('input') ||
    target.closest('select') ||
    target.closest('textarea') ||
    target.closest('a')
  )
}

/* =========================
   Search / Highlight
========================= */

const focusFirstSearchResult = async () => {
  const query = searchQuery.value?.trim().toLowerCase()

  if (!query) return

  const matchedPlanet = planetsStore.planets.find(planet => {
    return String(planet.name || '').toLowerCase().includes(query)
  })

  if (matchedPlanet) {
    await canvasRef.value?.focusNode?.('planet', matchedPlanet.id)
    return
  }

  const allNotes =
    notesStore.allNotes ||
    notesStore.notes ||
    notesStore.floatingNotes ||
    []

  const matchedNote = allNotes.find(note => {
    const title = String(note.title || '').toLowerCase()
    const content = String(note.content || '').toLowerCase()
    const tags = note.tags || []

    const tagMatched = tags.some(tag =>
      String(tag).toLowerCase().includes(query)
    )

    return title.includes(query) || content.includes(query) || tagMatched
  })

  if (matchedNote) {
    if (matchedNote.planet_id) {
      const planet = planetsStore.planets.find(
        item => String(item.id) === String(matchedNote.planet_id)
      )

      if (planet) {
        await canvasRef.value?.focusNode?.('planet', planet.id)
        return
      }
    }

    await canvasRef.value?.focusNode?.('note', matchedNote.id)
  }
}

const handleTagFilter = (tag) => {
  activeFilterTag.value = activeFilterTag.value === tag ? null : tag
  searchQuery.value = ''
}

/* =========================
   Universe Pointer
========================= */

const onUniversePointerDown = (event) => {
  pointerStart.x = event.clientX
  pointerStart.y = event.clientY
  pointerStart.shouldClear = false

  if (!hasActiveHighlightSelection()) return
  if (isKeepHighlightTarget(event.target)) return

  pointerStart.shouldClear = true
}

const onUniversePointerUp = (event) => {
  if (!pointerStart.shouldClear) return

  const diffX = Math.abs(event.clientX - pointerStart.x)
  const diffY = Math.abs(event.clientY - pointerStart.y)

  pointerStart.shouldClear = false

  if (diffX > 5 || diffY > 5) return

  clearHighlightSelection()
}

/* =========================
   User Menu
========================= */

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleOpenProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const handleOpenTrashFromMenu = () => {
  showUserMenu.value = false
  router.push('/trash')
}

const handleOpenMiniMapFromMenu = () => {
  showUserMenu.value = false
  showMiniMapPanel.value = true
}

const handleOpenStarOverviewFromMenu = () => {
  showUserMenu.value = false
  router.push('/star-overview')
}

const handleAutoArrangeFromMenu = async () => {
  showUserMenu.value = false
  await autoArrangeUniverse()
}

const handleLogoutFromMenu = () => {
  showUserMenu.value = false
  handleLogout()
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

/* =========================
   Create Note / Planet
========================= */

const handleCreateNote = () => {
  router.push('/editor/new')
}

const handleCreatePlanet = async (payload) => {
  const data = payload || newPlanet

  if (!String(data.name || '').trim()) {
    alert('請先為這顆星球命名')
    return
  }

  try {
    await planetsStore.createPlanet({
      ...data,
      user_id: authStore.user?.id,
      x_pos: 0.5,
      y_pos: 0.5
    })

    showPlanetModal.value = false

    Object.assign(newPlanet, {
      name: '',
      texture_type: 'rocky',
      color: '#646cff'
    })

    await planetsStore.fetchPlanets()
  } catch (err) {
    console.error('星球誕生失敗:', err)
  }
}

const createNoteInPlanet = async (planet) => {
  if (!planet?.id) return

  try {
    const newNote = await notesStore.createNote({
      title: '未命名文件',
      content: '',
      tags: [],
      planet_id: planet.id
    })

    await notesStore.refreshData?.()

    const noteId = newNote?.id || newNote?.noteId

    if (noteId) {
      editorTabsStore.openTab({
        id: noteId,
        title: newNote?.title || '未命名文件'
      })

      router.push(`/editor/${noteId}`)
    }
  } catch (err) {
    console.error('新增星球內卡片失敗:', err)
    alert('新增卡片失敗，請稍後再試')
  }
}

/* =========================
   Planet Overlay
========================= */

const openPlanet = (planet) => {
  selectedPlanet.value = planet
}

const closePlanet = () => {
  selectedPlanet.value = null
}

const savePlanetNameFromOverlay = async (newName) => {
  if (!selectedPlanet.value) return

  const nextName = String(newName || '').trim() || '未命名星球'
  const oldName = selectedPlanet.value.name || '未命名星球'

  if (nextName === oldName) return

  try {
    const updatedPlanet = await planetsStore.updatePlanet(
      selectedPlanet.value.id,
      {
        name: nextName,
        color: selectedPlanet.value.color,
        texture_type: selectedPlanet.value.texture_type
      }
    )

    selectedPlanet.value = {
      ...selectedPlanet.value,
      ...updatedPlanet,
      name: updatedPlanet?.name || nextName
    }

    await planetsStore.fetchPlanets()
  } catch (err) {
    console.error('更新星球名稱失敗:', err)
    alert('更新星球名稱失敗，請稍後再試')
  }
}

const updateNoteTagsFromOverlay = async ({ note, tags }) => {
  if (!note?.id) return

  try {
    await notesStore.updateNote(note.id, {
      title: note.title || '未命名文件',
      content: note.content || '',
      tags,
      planet_id: note.planet_id || selectedPlanet.value?.id || null
    })

    note.tags = tags

    await notesStore.refreshData?.()
  } catch (err) {
    console.error('更新卡片標籤失敗:', err)
    alert('更新標籤失敗，請稍後再試')
  }
}

const handlePlanetOverlayNoteContextMenu = (event, note) => {
  handleContextMenu(event, note, 'note')
}

/* =========================
   Card Preview / Editor
========================= */

const openCardPreview = (note) => {
  if (!note?.id) return
  selectedPreviewNote.value = note
}

const closeCardPreview = () => {
  selectedPreviewNote.value = null
}

const openPreviewNoteInEditor = (note) => {
  if (!note?.id) return

  selectedPreviewNote.value = null
  enterEditor(note)
}

const enterEditor = (note) => {
  if (typeof note === 'object' && note?.id) {
    editorTabsStore.openTab({
      id: note.id,
      title: note.title || '未命名文件'
    })

    router.push(`/editor/${note.id}`)
    return
  }

  router.push(`/editor/${note}`)
}

const focusLinkedItemFromPreview = async (item) => {
  if (!item) return

  if (item.type === 'url' && item.url) {
    window.location.href = item.url
    return
  }

  selectedPreviewNote.value = null
  selectedPlanet.value = null

  if (item.type === 'planet') {
    await canvasRef.value?.focusNode?.('planet', item.id)
    return
  }

  if (item.type === 'note') {
    await canvasRef.value?.focusNode?.('note', item.id)
  }
}

/* =========================
   Sidebar Focus
========================= */

const focusNoteFromSidebar = async (note) => {
  if (!note?.id) return

  selectedPlanet.value = null

  await canvasRef.value?.focusNode?.('note', note.id)
}

const focusPlanetFromSidebar = async (planet) => {
  if (!planet?.id) return

  selectedPlanet.value = null

  await canvasRef.value?.focusNode?.('planet', planet.id)
}

/* =========================
   MiniMap
========================= */

const handleMiniMapFocus = async ({ type, id }) => {
  if (!type || !id) return

  selectedPlanet.value = null
  selectedPreviewNote.value = null
  showMiniMapPanel.value = false

  await canvasRef.value?.focusNode?.(type, id)
}

const handleMiniMapOpenNote = (note) => {
  if (!note?.id) return

  showMiniMapPanel.value = false
  selectedPreviewNote.value = null
  selectedPlanet.value = null

  editorTabsStore.openTab({
    id: note.id,
    title: note.title || '未命名文件'
  })

  router.push(`/editor/${note.id}`)
}

const handleMiniMapOpenPlanet = async (planet) => {
  if (!planet?.id) return

  showMiniMapPanel.value = false
  selectedPreviewNote.value = null
  selectedPlanet.value = planet

  await canvasRef.value?.focusNode?.('planet', planet.id)
}

/* =========================
   Auto Arrange
========================= */

const autoArrangeUniverse = async () => {
  const planets = planetsStore.planets || []
  const floatingNotes = notesStore.floatingNotes || []

  if (planets.length === 0 && floatingNotes.length === 0) {
    alert('目前沒有可以整理的星球或卡片')
    return
  }

  const updates = []

  const centerX = 0.5
  const centerY = 0.48
  const planetRadius = planets.length <= 6 ? 0.22 : 0.3

  planets.forEach((planet, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(planets.length, 1)

    const x = centerX + Math.cos(angle) * planetRadius
    const y = centerY + Math.sin(angle) * planetRadius

    const safeX = Math.min(0.88, Math.max(0.12, x))
    const safeY = Math.min(0.82, Math.max(0.14, y))

    planet.x_pos = safeX
    planet.y_pos = safeY

    updates.push(
      planetsStore.updatePlanetPosition(planet.id, safeX, safeY)
    )
  })

  const startX = 0.18
  const startY = 0.16
  const gapX = 0.11
  const gapY = 0.105
  const columns = 4

  floatingNotes.forEach((note, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)

    const x = Math.min(0.86, startX + col * gapX)
    const y = Math.min(0.86, startY + row * gapY)

    note.x_pos = x
    note.y_pos = y

    updates.push(
      notesStore.updateNotePosition(note.id, x, y)
    )
  })

  try {
    await Promise.all(updates)

    await notesStore.refreshData()
    await planetsStore.fetchPlanets()

    setTimeout(() => {
      canvasRef.value?.focusNode?.('planet', planets[0]?.id)
    }, 120)
  } catch (err) {
    console.error('自動整理失敗:', err)
    alert('自動整理失敗，請稍後再試')
  }
}

/* =========================
   Context Menu
========================= */

const handleContextMenu = (event, item, type) => {
  event.preventDefault()

  Object.assign(contextMenu, {
    show: true,
    x: event.clientX,
    y: event.clientY,
    target: item,
    type
  })
}

const closeMenu = () => {
  contextMenu.show = false
  showUserMenu.value = false
}

const confirmDelete = async () => {
  const { target, type } = contextMenu

  if (!target) return

  const targetName = type === 'note'
    ? target.title || '無標題'
    : target.name || '未命名星球'

  if (!confirm(`確定要抹除「${targetName}」嗎？`)) return

  try {
    if (type === 'note') {
      await notesStore.deleteNote(target.id)
    } else {
      await planetsStore.deletePlanet(target.id)
    }

    contextMenu.show = false

    await notesStore.refreshData()
    await planetsStore.fetchPlanets()
    await linksStore.fetchAllLinks()

    if (
      selectedPlanet.value &&
      type === 'planet' &&
      String(selectedPlanet.value.id) === String(target.id)
    ) {
      closePlanet()
    }
  } catch (err) {
    console.error('刪除失敗:', err)
  }
}

const handleLeavePlanet = async () => {
  try {
    await notesStore.moveNoteToPlanet(contextMenu.target.id, null)
    contextMenu.show = false
    await notesStore.refreshData()
  } catch (err) {
    console.error('離開星球失敗:', err)
  }
}

/* =========================
   Planet Link Manager
========================= */

const openPlanetLinkManagerModal = () => {
  if (!contextMenu.target || contextMenu.type !== 'planet') return

  planetLinkManagerSource.value = contextMenu.target
  planetLinkForm.target_id = ''
  planetLinkForm.display_text = ''

  showPlanetLinkManagerModal.value = true
  contextMenu.show = false
}

const closePlanetLinkManagerModal = () => {
  showPlanetLinkManagerModal.value = false
  planetLinkManagerSource.value = null
  planetLinkForm.target_id = ''
  planetLinkForm.display_text = ''
}

const createPlanetLink = async (payload) => {
  if (!planetLinkManagerSource.value) {
    alert('找不到來源星球')
    return
  }

  const sourceId = planetLinkManagerSource.value.id
  const targetId = payload?.target_id || planetLinkForm.target_id
  const displayText = payload?.display_text || planetLinkForm.display_text

  if (!targetId) {
    alert('請選擇目標星球')
    return
  }

  if (String(sourceId) === String(targetId)) {
    alert('星球不能連結自己')
    return
  }

  try {
    const existingLinks = linksStore.links || []

    const alreadyExists = existingLinks.some(link => {
      const sourceType = link.source_type || 'note'
      const targetType = link.target_type || 'note'

      const isPlanetToPlanet =
        String(sourceType) === 'planet' &&
        String(targetType) === 'planet'

      if (!isPlanetToPlanet) return false

      const sameDirection =
        String(link.source_id) === String(sourceId) &&
        String(link.target_id) === String(targetId)

      const reverseDirection =
        String(link.source_id) === String(targetId) &&
        String(link.target_id) === String(sourceId)

      return sameDirection || reverseDirection
    })

    if (alreadyExists) {
      alert('這兩個星球已經有連結了')
      return
    }

    await linksStore.createLink({
      source_type: 'planet',
      source_id: sourceId,
      target_type: 'planet',
      target_id: targetId,
      target_url: null,
      display_text: String(displayText || '').trim() || '星球關聯'
    })

    await linksStore.fetchAllLinks()

    planetLinkForm.target_id = ''
    planetLinkForm.display_text = ''
  } catch (err) {
    console.error('建立星球連結失敗:', err)
    alert('建立星球連結失敗，請稍後再試')
  }
}

const getPlanetLinkTargetName = (link) => {
  if (!planetLinkManagerSource.value) return '未知星球'

  const currentId = String(planetLinkManagerSource.value.id)

  const otherPlanetId =
    String(link.source_id) === currentId
      ? link.target_id
      : link.source_id

  const planet = planetsStore.planets.find(
    planet => String(planet.id) === String(otherPlanetId)
  )

  return planet?.name || '未知星球'
}

const removePlanetLink = async (link) => {
  const targetName = getPlanetLinkTargetName(link)

  if (!confirm(`確定要移除與「${targetName}」的星球連結嗎？`)) {
    return
  }

  try {
    await linksStore.deleteLink(link.id)
    await linksStore.fetchAllLinks()
  } catch (err) {
    console.error('移除星球連結失敗:', err)
    alert('移除星球連結失敗，請稍後再試')
  }
}

/* =========================
   Load Data
========================= */

const loadUniverseData = async () => {
  await notesStore.refreshData()
  await planetsStore.fetchPlanets()

  try {
    await linksStore.fetchAllLinks()
  } catch (err) {
    console.warn('讀取 links 失敗，請確認後端是否支援查詢全部 links:', err)
  }
}

/* =========================
   Watch
========================= */

watch(
  () => searchQuery.value,
  () => {
    clearTimeout(searchFocusTimer)

    if (!searchQuery.value?.trim()) return

    searchFocusTimer = setTimeout(() => {
      focusFirstSearchResult()
    }, 450)
  }
)

/* =========================
   Lifecycle
========================= */

onMounted(async () => {
  localStorage.setItem('nova-theme', 'dark')
  document.documentElement.setAttribute('data-theme', 'dark')
  document.body.setAttribute('data-theme', 'dark')

  await loadUniverseData()

  window.addEventListener('click', closeMenu)
})

onBeforeUnmount(() => {
  clearTimeout(searchFocusTimer)
  window.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.universe-container {
  width: 100vw;
  height: 100vh;

  background:
    linear-gradient(
      rgba(2, 4, 14, 0.18),
      rgba(2, 4, 14, 0.18)
    ),
    var(--universe-bg-image);

  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;

  overflow: hidden;
  position: relative;
  font-family: 'Inter', 'Noto Sans TC', sans-serif;
  color: var(--text-color);
}

.universe-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 22px 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 150;
  color: var(--text-color);
  pointer-events: none;
}

.nav-placeholder {
  width: 1px;
  height: 1px;
}

.nav-actions,
.user-avatar-btn {
  pointer-events: auto;
}

/* =========================
   Top Right Actions
========================= */

.nav-actions {
  display: flex;
  align-items: center;
  gap: 14px;

  padding: 6px 8px;

  border-radius: 999px;

  color: #f7f8ff;

  position: relative;
}

.user-menu-wrapper {
  position: relative;
}

.user-avatar-btn {
  position: relative;

  height: 40px;
  min-width: 72px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  padding: 0 10px;

  color: #f7f8ff;
  background:
    radial-gradient(circle at 50% 0%, rgba(165, 140, 255, 0.18), transparent 58%),
    linear-gradient(145deg, rgba(18, 20, 46, 0.94), rgba(8, 10, 28, 0.96));

  border: 1px solid rgba(185, 170, 255, 0.42);
  border-radius: 8px;

  clip-path: polygon(
    9px 0,
    calc(100% - 9px) 0,
    100% 9px,
    100% calc(100% - 9px),
    calc(100% - 9px) 100%,
    9px 100%,
    0 calc(100% - 9px),
    0 9px
  );

  cursor: pointer;

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    inset 0 0 14px rgba(165, 140, 255, 0.06),
    0 0 0 1px rgba(165, 140, 255, 0.1),
    0 0 14px rgba(145, 120, 255, 0.14),
    0 8px 22px rgba(0, 0, 0, 0.28);

  overflow: hidden;

  transition:
    transform 0.22s ease,
    border-color 0.22s ease,
    background 0.22s ease,
    box-shadow 0.22s ease;
}

.user-avatar-btn::before {
  content: '';

  position: absolute;
  inset: -2px;
  z-index: -1;

  background:
    linear-gradient(
      135deg,
      rgba(220, 210, 255, 0.7),
      rgba(165, 140, 255, 0.45),
      rgba(105, 130, 255, 0.28),
      rgba(165, 140, 255, 0.6)
    );

  opacity: 0.55;
  filter: blur(8px);

  clip-path: inherit;

  transition:
    opacity 0.22s ease,
    filter 0.22s ease;
}

.user-avatar-btn::after {
  content: '';

  position: absolute;
  inset: 3px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  clip-path: polygon(
    8px 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% calc(100% - 8px),
    calc(100% - 8px) 100%,
    8px 100%,
    0 calc(100% - 8px),
    0 8px
  );

  pointer-events: none;
}

.user-avatar-btn:hover,
.user-avatar-btn:has(.avatar-chevron.open) {
  transform: translateY(-1px);

  border-color: rgba(235, 228, 255, 0.82);

  background:
    radial-gradient(circle at 50% 0%, rgba(165, 140, 255, 0.24), transparent 60%),
    linear-gradient(145deg, rgba(24, 26, 58, 0.96), rgba(10, 12, 34, 0.98));

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    inset 0 0 16px rgba(165, 140, 255, 0.08),
    0 0 0 1px rgba(165, 140, 255, 0.14),
    0 0 18px rgba(145, 120, 255, 0.24),
    0 10px 24px rgba(0, 0, 0, 0.32);
}

.user-avatar-btn:hover::before,
.user-avatar-btn:has(.avatar-chevron.open)::before {
  opacity: 0.82;
  filter: blur(10px);
}

.avatar-circle {
  position: relative;

  width: 26px;
  height: 26px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: #ddd8ff;
  background:
    radial-gradient(circle at 50% 22%, rgba(165, 140, 255, 0.26), transparent 60%),
    linear-gradient(145deg, rgba(145, 120, 255, 0.16), rgba(75, 70, 160, 0.1));

  border: 1px solid rgba(190, 180, 255, 0.26);
  border-radius: 6px;

  clip-path: polygon(
    6px 0,
    calc(100% - 6px) 0,
    100% 6px,
    100% calc(100% - 6px),
    calc(100% - 6px) 100%,
    6px 100%,
    0 calc(100% - 6px),
    0 6px
  );

  box-shadow:
    inset 0 0 8px rgba(165, 140, 255, 0.08),
    0 0 10px rgba(145, 120, 255, 0.12);

  font-size: 0.78rem;
}

.avatar-circle::after {
  content: '';

  position: absolute;
  inset: 5px;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;

  pointer-events: none;
}

.avatar-chevron {
  font-size: 0.72rem;
  color: #b9aaff;

  filter: drop-shadow(0 0 6px rgba(165, 140, 255, 0.55));

  transition:
    transform 0.22s ease,
    color 0.22s ease,
    filter 0.22s ease;
}

.avatar-chevron.open {
  transform: rotate(180deg);
  color: #f4f1ff;
}

/* =========================
   User Dropdown Sci-fi Panel
========================= */

.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 4000;

  width: 360px;
  padding: 26px 26px 24px;

  transform-origin: top right;
  transform: scale(0.55);

  color: #e5e8ff;

  background:
    radial-gradient(circle at 18% 0%, rgba(165, 140, 255, 0.18), transparent 24%),
    radial-gradient(circle at 82% 16%, rgba(105, 130, 255, 0.12), transparent 28%),
    linear-gradient(145deg, rgba(18, 20, 46, 0.95), rgba(8, 10, 28, 0.97));

  border: 1px solid rgba(165, 150, 245, 0.34);
  border-radius: 24px;

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

  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 40px rgba(120, 110, 255, 0.05),
    0 0 0 1px rgba(165, 140, 255, 0.14),
    0 0 24px rgba(145, 120, 255, 0.16),
    0 0 52px rgba(105, 130, 255, 0.08),
    0 28px 80px rgba(0, 0, 0, 0.52);

  backdrop-filter: blur(26px);
  -webkit-backdrop-filter: blur(26px);

  overflow: hidden;
}

.user-dropdown::before {
  content: '';

  position: absolute;
  right: 34px;
  top: -10px;

  width: 22px;
  height: 22px;

  transform: rotate(45deg);

  background:
    linear-gradient(145deg, rgba(24, 26, 56, 0.98), rgba(10, 12, 30, 0.98));

  border-left: 1px solid rgba(165, 150, 245, 0.4);
  border-top: 1px solid rgba(165, 150, 245, 0.4);

  box-shadow:
    -4px -4px 14px rgba(145, 120, 255, 0.16),
    0 0 18px rgba(145, 120, 255, 0.12);

  z-index: 3;
  pointer-events: none;
}

.user-dropdown::after {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(rgba(165, 140, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(165, 140, 255, 0.025) 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1.5px);

  background-size:
    30px 30px,
    30px 30px,
    82px 82px;

  opacity: 0.42;

  box-shadow:
    inset 0 0 0 1px rgba(190, 180, 255, 0.06),
    inset 0 0 26px rgba(130, 120, 255, 0.04);

  pointer-events: none;
}

.user-dropdown-frame-corner {
  position: absolute;
  z-index: 4;

  width: 34px;
  height: 34px;

  pointer-events: none;

  filter:
    drop-shadow(0 0 6px rgba(165, 140, 255, 0.45))
    drop-shadow(0 0 14px rgba(105, 130, 255, 0.18));
}

.user-dropdown-frame-corner::before,
.user-dropdown-frame-corner::after {
  content: '';
  position: absolute;
  background: linear-gradient(90deg, rgba(220, 215, 255, 0.95), rgba(165, 140, 255, 0.7));
  border-radius: 999px;
}

.user-dropdown-frame-corner.top-left {
  top: 14px;
  left: 14px;
}

.user-dropdown-frame-corner.top-left::before {
  left: 0;
  top: 0;
  width: 26px;
  height: 2px;
}

.user-dropdown-frame-corner.top-left::after {
  left: 0;
  top: 0;
  width: 2px;
  height: 26px;
}

.user-dropdown-frame-corner.top-right {
  top: 14px;
  right: 14px;
}

.user-dropdown-frame-corner.top-right::before {
  right: 0;
  top: 0;
  width: 26px;
  height: 2px;
}

.user-dropdown-frame-corner.top-right::after {
  right: 0;
  top: 0;
  width: 2px;
  height: 26px;
}

.user-dropdown-frame-corner.bottom-left {
  bottom: 14px;
  left: 14px;
}

.user-dropdown-frame-corner.bottom-left::before {
  left: 0;
  bottom: 0;
  width: 26px;
  height: 2px;
}

.user-dropdown-frame-corner.bottom-left::after {
  left: 0;
  bottom: 0;
  width: 2px;
  height: 26px;
}

.user-dropdown-frame-corner.bottom-right {
  right: 14px;
  bottom: 14px;
}

.user-dropdown-frame-corner.bottom-right::before {
  right: 0;
  bottom: 0;
  width: 26px;
  height: 2px;
}

.user-dropdown-frame-corner.bottom-right::after {
  right: 0;
  bottom: 0;
  width: 2px;
  height: 26px;
}

.user-dropdown-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;

  padding: 16px 16px 22px;
  margin-bottom: 12px;
}

.user-menu-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-menu-item {
  position: relative;

  width: 100%;
  min-height: 64px;

  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;

  padding: 12px 14px;

  color: #f4f5ff;
  background:
    linear-gradient(135deg, rgba(80, 90, 180, 0.09), rgba(5, 8, 24, 0.32));

  border: 1px solid rgba(165, 150, 245, 0.12);
  border-radius: 14px;

  cursor: pointer;

  text-align: left;
  font-family: inherit;

  overflow: hidden;

  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    color 0.18s ease;
}

.user-menu-item::before {
  content: '';

  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      105deg,
      transparent 0%,
      transparent 40%,
      rgba(255, 255, 255, 0.08) 50%,
      transparent 60%,
      transparent 100%
    );

  transform: translateX(-120%);
  transition: transform 0.55s ease;

  pointer-events: none;
}

.user-menu-item:hover {
  transform: translateX(4px);

  color: #ffffff;
  background:
    radial-gradient(circle at 12% 50%, rgba(165, 140, 255, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(145, 120, 255, 0.14), rgba(5, 8, 24, 0.48));

  border-color: rgba(180, 165, 255, 0.46);

  box-shadow:
    0 0 22px rgba(145, 120, 255, 0.16),
    inset 0 0 18px rgba(165, 140, 255, 0.04);
}

.user-menu-item:hover::before {
  transform: translateX(120%);
}

.user-menu-item > span {
  width: 44px;
  height: 44px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: #b9aaff;
  background:
    radial-gradient(circle at 50% 30%, rgba(165, 140, 255, 0.28), transparent 58%),
    rgba(145, 120, 255, 0.12);

  border: 1px solid rgba(165, 140, 255, 0.24);
  border-radius: 12px;

  font-size: 1.05rem;

  box-shadow:
    inset 0 0 14px rgba(165, 140, 255, 0.08),
    0 0 14px rgba(145, 120, 255, 0.12);
}

.user-menu-item strong {
  min-width: 0;

  color: inherit;

  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1.2;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-arrow {
  color: #a58cff;
  font-size: 0.86rem;

  filter: drop-shadow(0 0 8px rgba(165, 140, 255, 0.42));

  transition:
    transform 0.18s ease,
    color 0.18s ease;
}

.user-menu-item:hover .item-arrow {
  transform: translateX(4px);
  color: #d9d3ff;
}

.user-menu-divider {
  position: relative;

  height: 1px;
  margin: 18px 4px;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(165, 140, 255, 0.34),
      rgba(255, 255, 255, 0.28),
      rgba(165, 140, 255, 0.34),
      transparent
    );
}

.user-menu-divider::after {
  content: '';

  position: absolute;
  left: 50%;
  top: 50%;

  width: 6px;
  height: 6px;

  border-radius: 999px;
  border: 1px solid rgba(165, 140, 255, 0.58);

  background: rgba(10, 12, 30, 0.9);

  transform: translate(-50%, -50%);

  box-shadow:
    0 0 10px rgba(165, 140, 255, 0.55);
}

.user-menu-item.trash > span {
  color: #b9aaff;
}

.user-menu-item.danger {
  color: #ff8f9c;
}

.user-menu-item.danger > span {
  color: #ff8f9c;
  background:
    radial-gradient(circle at 50% 30%, rgba(255, 120, 150, 0.28), transparent 58%),
    rgba(255, 90, 130, 0.12);

  border-color: rgba(255, 120, 150, 0.26);
}

.user-menu-item.danger:hover {
  border-color: rgba(255, 130, 160, 0.42);

  background:
    radial-gradient(circle at 12% 50%, rgba(255, 120, 150, 0.16), transparent 34%),
    linear-gradient(135deg, rgba(255, 90, 130, 0.1), rgba(5, 8, 24, 0.48));

  box-shadow:
    0 0 20px rgba(255, 100, 140, 0.14),
    inset 0 0 18px rgba(255, 100, 140, 0.04);
}

.user-menu-fade-enter-active,
.user-menu-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.user-menu-fade-enter-from,
.user-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.78);
}

.floating-brand {
  position: fixed;
  left: 15px;
  z-index: 190;
  display: flex;
  align-items: center;
  padding: 8px 16px 8px 10px;
  border-radius: 999px;
  pointer-events: auto;
  animation: brandIn 0.25s ease;
}

.floating-brand-logo {
  width: 100px;
  object-fit: contain;
  border-radius: 50%;
  flex-shrink: 0;
}

.floating-brand-name {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: 0.4px;
  color: #f5f7ff;
  white-space: nowrap;
}

/* 畫布節點高亮 */
:deep(.PlanetNode),
:deep(.floating-card) {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.dim) {
  opacity: 0.13 !important;
  filter: grayscale(1) blur(2px) brightness(0.55) !important;
  transform: scale(0.9) !important;
  pointer-events: none;
}

:deep(.highlight) {
  opacity: 1 !important;
  filter: drop-shadow(0 0 18px var(--highlight-glow)) !important;
  transform: scale(1.1) !important;
  z-index: 500 !important;
}

:deep(.primary-highlight) {
  opacity: 1 !important;
  filter:
    drop-shadow(0 0 10px var(--primary-glow-soft))
    drop-shadow(0 0 24px var(--primary-glow)) !important;
  transform: scale(1.05) !important;
  z-index: 700 !important;
}

:deep(.related-highlight) {
  opacity: 1 !important;
  filter:
    drop-shadow(0 0 8px var(--related-glow-soft))
    drop-shadow(0 0 18px var(--related-glow)) !important;
  transform: scale(1) !important;
  z-index: 520 !important;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-mask-bg);
  backdrop-filter: blur(18px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.modal-card {
  background: var(--modal-bg);
  padding: 30px;
  border-radius: 24px;
  width: 380px;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  box-shadow: var(--modal-shadow);
}

.modal-card h3 {
  margin: 0;
  text-align: center;
  letter-spacing: 1px;
  font-size: 1.4rem;
  color: var(--heading-color);
}

.modal-subtitle {
  margin: 8px 0 24px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--muted-text);
}

.modal-field {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--heading-color);
}

.modal-input,
.modal-select {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
  padding: 12px;
  border-radius: 14px;
  outline: none;
}

.modal-input::placeholder {
  color: var(--muted-text);
}

.modal-select option {
  background: var(--input-bg);
  color: var(--text-color);
}

.modal-input:focus,
.modal-select:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  background: var(--input-bg);
  padding: 10px 15px;
  border-radius: 14px;
  border: 1px solid var(--input-border);
  color: var(--text-color);
}

.color-picker-wrapper input {
  width: 42px;
  height: 32px;
  border: none;
  background: transparent;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 800;
  border: none;
}

.cancel-btn {
  background: var(--button-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color) !important;
}

.cancel-btn:hover {
  background: var(--button-hover-bg);
}

.confirm-btn {
  background: var(--accent-gradient);
  color: var(--accent-text);
}

/* 右鍵選單 */
.custom-context-menu {
  position: fixed;
  background: var(--context-menu-bg);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  z-index: 9999;
  min-width: 200px;
  box-shadow: var(--context-menu-shadow);
  padding: 8px;
  backdrop-filter: blur(14px);
  animation: menuShow 0.16s ease;
}

.menu-option,
.delete-option {
  width: 100%;
  padding: 11px 14px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  border-radius: 10px;
  font-size: 0.9rem;
  color: var(--text-color);
}

.delete-option {
  color: var(--danger-color);
  font-weight: 800;
}

.menu-option:hover,
.delete-option:hover {
  background: var(--button-hover-bg);
}

/* 管理星球連結 */
.planet-link-manager {
  width: 500px;
  max-height: 82vh;
  overflow-y: auto;
}

.link-create-box {
  margin-top: 20px;
  padding: 18px;
  border-radius: 18px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
}

.readonly-source {
  width: 100%;
  background: var(--button-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
  padding: 12px;
  border-radius: 14px;
  font-weight: 800;
}

.create-link-btn {
  width: 100%;
  margin-top: 4px;
  padding: 12px;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 900;
  color: var(--accent-text);
  background: var(--accent-gradient);
}

.create-link-btn:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.link-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 22px 0 10px;
  color: var(--heading-color);
  font-size: 0.9rem;
  font-weight: 900;
}

.link-count {
  min-width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--button-bg);
  color: var(--muted-text);
  font-size: 0.75rem;
}

.empty-link-state {
  padding: 28px 16px;
  text-align: center;
  color: var(--muted-text);
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  margin-top: 12px;
}

.planet-link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.planet-link-row:last-child {
  border-bottom: none;
}

.planet-link-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.planet-link-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.planet-link-name {
  font-weight: 900;
  color: var(--heading-color);
}

.planet-link-desc {
  margin-top: 3px;
  font-size: 0.8rem;
  color: var(--muted-text);
}

.remove-link-btn {
  border: none;
  border-radius: 999px;
  padding: 7px 12px;
  cursor: pointer;
  font-weight: 800;
  background: var(--danger-bg);
  color: var(--danger-color);
  flex-shrink: 0;
}

.remove-link-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

@keyframes brandIn {
  from {
    opacity: 0;
    transform: translateX(-8px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes menuShow {
  from {
    opacity: 0;
    transform: translateY(-5px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 760px) {
  .universe-nav {
    padding: 18px 18px;
  }

  .nav-actions {
    gap: 10px;
    padding: 4px;
  }

  .user-avatar-btn {
    min-width: 104px;
    height: 46px;
    padding: 0 14px;
    gap: 10px;
  }

  .avatar-circle {
    width: 30px;
    height: 30px;
  }

  .user-dropdown {
    right: -4px;
    width: min(360px, calc(100vw - 28px));
    padding: 22px 18px 20px;
    border-radius: 22px;
  }

  .user-menu-item {
    min-height: 58px;
    gap: 12px;
    padding: 10px 12px;
  }

  .user-menu-item > span {
    width: 40px;
    height: 40px;
  }

  .user-menu-item strong {
    font-size: 0.98rem;
  }
}
</style>