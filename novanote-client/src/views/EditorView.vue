<template>
  <div
    class="editor-page"
    :class="{ 'dark-editor': currentTheme === 'dark' }"
  >
    <EditorTabs
      class="editor-tabs-row"
      :tabs="editorTabsStore.tabs"
      :active-tab-id="editorTabsStore.activeTabId"
      @select-tab="handleSelectEditorTab"
      @close-tab="handleCloseEditorTab"
    />

    <header class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">← 返回</button>

        <div class="title-slot">
          <input
            ref="titleRef"
            v-model="noteTitle"
            class="doc-title-input"
            :class="{ editing: isTitleEditing }"
            placeholder="未命名文件"
            @focus="isTitleEditing = true"
            @blur="handleTitleBlur"
            @input="handleTitleInput"
          />
        </div>
      </div>

      <div class="header-right">
        <button
          class="header-toolbar-toggle"
          type="button"
          :aria-expanded="isToolbarExpanded"
          :title="isToolbarExpanded ? '收起格式工具列' : '展開格式工具列'"
          @click="toggleToolbar"
        >
          <i
            class="fa-solid"
            :class="isToolbarExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"
          ></i>
        </button>

        <button
          class="theme-toggle-btn"
          type="button"
          :title="currentTheme === 'dark' ? '切換淺色模式' : '切換深色模式'"
          @click="toggleTheme"
        >
          <i
            class="fa-solid"
            :class="currentTheme === 'dark' ? 'fa-moon' : 'fa-sun'"
          ></i>
        </button>

        <span class="save-status" :class="{ 'is-saving': isSaving }">
          {{ isSaving ? '同步中...' : '已雲端儲存' }}
        </span>
      </div>
    </header>

    <transition name="toolbar-slide">
      <section v-if="editor && isToolbarExpanded" class="toolbar-area">
        <div class="editor-toolbar">
          <select
            v-model="selectedHeading"
            class="toolbar-select heading-select"
            title="文字樣式"
            @change="setHeading(selectedHeading)"
          >
            <option value="paragraph">一般文字</option>
            <option value="1">標題 1</option>
            <option value="2">標題 2</option>
            <option value="3">標題 3</option>
            <option value="4">標題 4</option>
            <option value="5">標題 5</option>
            <option value="6">標題 6</option>
          </select>

          <select
            v-model="selectedFontFamily"
            class="toolbar-select font-select"
            title="字型"
            @change="setFontFamily(selectedFontFamily)"
          >
            <option value="Inter">Inter</option>
            <option value="Noto Sans TC">Noto Sans TC</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Microsoft JhengHei">微軟正黑體</option>
          </select>

          <select
            v-model="selectedFontSize"
            class="toolbar-select size-select"
            title="字體大小"
            @change="setFontSize(selectedFontSize)"
          >
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
            <option value="36px">36</option>
            <option value="48px">48</option>
          </select>

          <div class="text-align-tool" @click.stop>
            <button
              class="toolbar-btn text-align-btn"
              type="button"
              title="文字對齊"
              :class="{ active: showTextAlignMenu }"
              @mousedown.prevent.stop
              @click.stop="toggleTextAlignMenu"
            >
              <i class="fa-solid" :class="currentTextAlignIcon"></i>
              <i class="fa-solid fa-caret-down text-align-caret"></i>
            </button>

            <div
              v-if="showTextAlignMenu"
              class="text-align-menu"
              @mousedown.prevent
              @click.stop
            >
              <button
                v-for="option in textAlignOptions"
                :key="option.value"
                class="text-align-menu-item"
                type="button"
                :class="{ active: currentTextAlign === option.value }"
                :title="option.label"
                @click="setTextAlign(option.value)"
              >
                <i class="fa-solid" :class="option.icon"></i>
              </button>
            </div>
          </div>

          <div class="line-height-tool" @click.stop>
            <button
              class="toolbar-btn line-height-btn"
              type="button"
              title="行距"
              :class="{ active: showLineHeightMenu }"
              @mousedown.prevent.stop
              @click.stop="toggleLineHeightMenu"
            >
              <span class="line-height-icon">
                <i class="fa-solid fa-arrows-up-down"></i>
                <span class="line-height-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            </button>

            <div
              v-if="showLineHeightMenu"
              class="line-height-menu"
              @mousedown.prevent
              @click.stop
            >
              <button
                v-for="option in lineHeightOptions"
                :key="option.value"
                class="line-height-menu-item"
                type="button"
                :class="{ active: selectedLineHeight === option.value }"
                @click="setLineHeight(option.value)"
              >
                <span class="line-height-check">
                  <i
                    v-if="selectedLineHeight === option.value"
                    class="fa-solid fa-check"
                  ></i>
                </span>

                <span class="line-height-label">
                  {{ option.label }}
                </span>
              </button>
            </div>
          </div>

          <button
            class="toolbar-btn"
            :class="{ active: editor.isActive('bold') }"
            title="粗體"
            @click="editor.chain().focus().toggleBold().run()"
          >
            B
          </button>

          <button
            class="toolbar-btn italic"
            :class="{ active: editor.isActive('italic') }"
            title="斜體"
            @click="editor.chain().focus().toggleItalic().run()"
          >
            <i>I</i>
          </button>

          <button
            class="toolbar-btn"
            :class="{ active: editor.isActive('underline') }"
            title="底線"
            @click="editor.chain().focus().toggleUnderline().run()"
          >
            <i class="fa-solid fa-underline"></i>
          </button>

          <div class="color-tool text-color-tool">
            <button
              class="toolbar-btn color-tool-btn"
              type="button"
              title="文字顏色"
              @mousedown.prevent.stop
              @click.stop="toggleTextColorPalette"
            >
              <span class="google-color-icon text-color-icon">
                <span class="text-color-letter">A</span>
                <span
                  class="color-indicator"
                  :style="{ backgroundColor: selectedTextColor }"
                ></span>
              </span>
            </button>

            <div
              v-if="showTextColorPalette"
              class="color-palette text-palette"
              @mousedown.prevent
              @click.stop
            >
              <button class="palette-none-btn" type="button" @click="unsetTextColor">
                <span class="none-icon">A</span>
                <span>自動</span>
              </button>

              <div class="palette-grid">
                <button
                  v-for="color in colorPaletteColors"
                  :key="'text-' + color"
                  class="palette-color-dot"
                  type="button"
                  :class="{ active: selectedTextColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="applyTextColor(color)"
                ></button>
              </div>

              <div class="custom-color-row">
                <span class="custom-label">自訂</span>

                <button
                  class="custom-current-color"
                  type="button"
                  :style="{ backgroundColor: selectedTextColor }"
                  @click="openTextColorPicker"
                ></button>

                <button
                  class="custom-picker-btn"
                  type="button"
                  @click="openTextColorPicker"
                >
                  ＋
                </button>

                <input
                  ref="textColorInputRef"
                  v-model="selectedTextColor"
                  type="color"
                  class="hidden-color-input"
                  @change="applyTextColor(selectedTextColor)"
                />
              </div>
            </div>
          </div>

          <div class="color-tool highlight-tool">
            <button
              class="toolbar-btn color-tool-btn"
              type="button"
              title="螢光筆顏色"
              @mousedown.prevent.stop
              @click.stop="toggleHighlightPalette"
            >
              <span class="google-color-icon highlight-color-icon markerpen-tool">
                <img class="markerpen-icon" :src="markerPenIcon" alt="螢光筆" />

                <span
                  class="color-indicator"
                  :style="{ backgroundColor: selectedHighlightColor }"
                ></span>
              </span>
            </button>

            <div
              v-if="showHighlightPalette"
              class="color-palette highlight-palette"
              @mousedown.prevent
              @click.stop
            >
              <button class="palette-none-btn" type="button" @click="unsetHighlight">
                <span class="none-icon">⌫</span>
                <span>無</span>
              </button>

              <div class="palette-grid">
                <button
                  v-for="color in colorPaletteColors"
                  :key="'highlight-' + color"
                  class="palette-color-dot"
                  type="button"
                  :class="{ active: selectedHighlightColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="applyHighlightColor(color)"
                ></button>
              </div>

              <div class="custom-color-row">
                <span class="custom-label">自訂</span>

                <button
                  class="custom-current-color"
                  type="button"
                  :style="{ backgroundColor: selectedHighlightColor }"
                  @click="openHighlightColorPicker"
                ></button>

                <button
                  class="custom-picker-btn"
                  type="button"
                  @click="openHighlightColorPicker"
                >
                  ＋
                </button>

                <input
                  ref="highlightColorInputRef"
                  v-model="selectedHighlightColor"
                  type="color"
                  class="hidden-color-input"
                  @change="applyHighlightColor(selectedHighlightColor)"
                />
              </div>
            </div>
          </div>

          <button
            class="toolbar-btn"
            :class="{ active: editor.isActive('bulletList') }"
            title="項目符號清單"
            @click="editor.chain().focus().toggleBulletList().run()"
          >
            • List
          </button>

          <button
            class="toolbar-btn"
            :class="{ active: editor.isActive('orderedList') }"
            title="編號清單"
            @click="editor.chain().focus().toggleOrderedList().run()"
          >
            1. List
          </button>

          <span class="toolbar-divider"></span>

          <button class="toolbar-btn link-btn" title="新增連結" @click="openLinkModal">
            <i class="fa-solid fa-link"></i>
          </button>
        </div>
      </section>
    </transition>

    <main class="editor-main">
      <aside class="mention-panel">
        <h3 class="mention-title">提及</h3>

        <div v-if="linksStore.backlinks.length === 0" class="mention-empty">
          尚未被其他卡片或星球提及
        </div>

        <button
          v-for="link in linksStore.backlinks"
          :key="link.id"
          class="mention-item"
          @click="openBacklink(link)"
        >
          <span class="mention-type">
            {{ link.source_type === 'planet' ? '星球' : '卡片' }}
          </span>
          <span class="mention-name">
            {{ getBacklinkName(link) }}
          </span>
        </button>
      </aside>

      <section class="editor-content-column">
        <div class="tag-section">
          <div class="tags-container">
            <span
              v-for="(tag, index) in noteTags"
              :key="index"
              class="tag-pill"
            >
              # {{ tag }}
              <button class="remove-tag-btn" @click="removeTag(index)">×</button>
            </span>

            <input
              v-model="tagInput"
              class="tag-input"
              placeholder="+ 新增標籤..."
              @keydown.enter.prevent="addTag"
              @keydown.backspace="handleBackspace"
            />
          </div>
        </div>

        <div
          v-if="showSelectionBubble"
          id="selection-bubble-menu"
          class="selection-bubble-menu"
          :style="selectionBubbleStyle"
          @mousedown.stop
        >
          <button
            class="bubble-btn"
            :class="{ active: editor?.isActive('bold') }"
            type="button"
            title="粗體"
            @click="editor?.chain().focus().toggleBold().run()"
          >
            <i class="fa-solid fa-bold"></i>
          </button>

          <button
            class="bubble-btn"
            :class="{ active: editor?.isActive('italic') }"
            type="button"
            title="斜體"
            @click="editor?.chain().focus().toggleItalic().run()"
          >
            <i class="fa-solid fa-italic"></i>
          </button>

          <button
            class="bubble-btn"
            :class="{ active: editor?.isActive('underline') }"
            type="button"
            title="底線"
            @click="editor?.chain().focus().toggleUnderline().run()"
          >
            <i class="fa-solid fa-underline"></i>
          </button>

          <span class="bubble-divider"></span>

          <select
            class="bubble-select font"
            :value="currentFontFamily"
            title="字型"
            @mousedown.stop
            @change="applyBubbleFontFamily($event.target.value)"
          >
            <option value="Inter">Inter</option>
            <option value="Noto Sans TC">Noto Sans TC</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Microsoft JhengHei">微軟正黑體</option>
          </select>

          <select
            class="bubble-select size"
            :value="currentFontSize"
            title="字體大小"
            @mousedown.stop
            @change="applyBubbleFontSize($event.target.value)"
          >
            <option value="">18</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
            <option value="36px">36</option>
            <option value="48px">48</option>
          </select>

          <div class="bubble-text-align-tool">
            <button
              class="bubble-btn bubble-text-align-btn"
              type="button"
              title="文字對齊"
              :class="{ active: showBubbleTextAlignMenu }"
              @mousedown.prevent
              @click.stop="toggleBubbleTextAlignMenu"
            >
              <i class="fa-solid" :class="currentTextAlignIcon"></i>
            </button>

            <div
              v-if="showBubbleTextAlignMenu"
              class="bubble-text-align-menu"
              @mousedown.prevent
              @click.stop
            >
              <button
                v-for="option in textAlignOptions"
                :key="'bubble-align-' + option.value"
                class="bubble-text-align-menu-item"
                type="button"
                :class="{ active: currentTextAlign === option.value }"
                :title="option.label"
                @click="applyBubbleTextAlign(option.value)"
              >
                <i class="fa-solid" :class="option.icon"></i>
              </button>
            </div>
          </div>

          <div class="bubble-line-height-tool">
            <button
              class="bubble-btn bubble-line-height-btn"
              type="button"
              title="行距"
              :class="{ active: showBubbleLineHeightMenu }"
              @mousedown.prevent
              @click.stop="toggleBubbleLineHeightMenu"
            >
              <span class="bubble-line-height-icon">
                <i class="fa-solid fa-arrows-up-down"></i>
                <span class="bubble-line-height-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </span>
            </button>

            <div
              v-if="showBubbleLineHeightMenu"
              class="bubble-line-height-menu"
              @mousedown.prevent
              @click.stop
            >
              <button
                v-for="option in lineHeightOptions"
                :key="'bubble-line-height-' + option.value"
                class="bubble-line-height-menu-item"
                type="button"
                :class="{ active: currentLineHeight === option.value }"
                @click="applyBubbleLineHeight(option.value)"
              >
                <span class="bubble-line-height-check">
                  <i
                    v-if="currentLineHeight === option.value"
                    class="fa-solid fa-check"
                  ></i>
                </span>

                <span class="bubble-line-height-label">
                  {{ option.label }}
                </span>
              </button>
            </div>
          </div>

          <span class="bubble-divider"></span>

          <div class="bubble-color-wrap">
            <button
              class="bubble-btn color"
              type="button"
              title="文字顏色"
              @mousedown.prevent
              @click.stop="toggleBubbleTextPalette"
            >
              <span class="bubble-color-icon">
                A
                <span
                  class="bubble-color-line"
                  :style="{ backgroundColor: currentTextColor || selectedTextColor || '#000000' }"
                ></span>
              </span>
            </button>

            <div
              v-if="showBubbleTextPalette"
              class="color-palette bubble-color-palette"
              @mousedown.prevent
              @click.stop
            >
              <button class="palette-none-btn" type="button" @click="applyBubbleTextColor(null)">
                <span class="none-icon">A</span>
                <span>自動</span>
              </button>

              <div class="palette-grid">
                <button
                  v-for="color in colorPaletteColors"
                  :key="'bubble-text-' + color"
                  class="palette-color-dot"
                  type="button"
                  :class="{ active: currentTextColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="applyBubbleTextColor(color)"
                ></button>
              </div>

              <div class="custom-color-row">
                <span class="custom-label">自訂</span>

                <button
                  class="custom-current-color"
                  type="button"
                  :style="{ backgroundColor: currentTextColor || selectedTextColor || '#000000' }"
                  @click="openBubbleTextColorPicker"
                ></button>

                <button
                  class="custom-picker-btn"
                  type="button"
                  @click="openBubbleTextColorPicker"
                >
                  ＋
                </button>

                <input
                  ref="bubbleTextColorInputRef"
                  v-model="bubbleCustomTextColor"
                  type="color"
                  class="hidden-color-input"
                  @change="applyBubbleTextColor(bubbleCustomTextColor)"
                />
              </div>
            </div>
          </div>

          <div class="bubble-color-wrap">
            <button
              class="bubble-btn color"
              type="button"
              title="螢光筆顏色"
              @mousedown.prevent
              @click.stop="toggleBubbleHighlightPalette"
            >
              <span class="bubble-marker-icon-wrap">
                <img class="bubble-marker-icon" :src="markerPenIcon" alt="螢光筆" />
                <span
                  class="bubble-color-line"
                  :style="{ backgroundColor: currentHighlightColor || selectedHighlightColor || '#fff176' }"
                ></span>
              </span>
            </button>

            <div
              v-if="showBubbleHighlightPalette"
              class="color-palette bubble-color-palette"
              @mousedown.prevent
              @click.stop
            >
              <button class="palette-none-btn" type="button" @click="applyBubbleHighlight(null)">
                <span class="none-icon">⌫</span>
                <span>無</span>
              </button>

              <div class="palette-grid">
                <button
                  v-for="color in colorPaletteColors"
                  :key="'bubble-highlight-' + color"
                  class="palette-color-dot"
                  type="button"
                  :class="{ active: currentHighlightColor === color }"
                  :style="{ backgroundColor: color }"
                  @click="applyBubbleHighlight(color)"
                ></button>
              </div>

              <div class="custom-color-row">
                <span class="custom-label">自訂</span>

                <button
                  class="custom-current-color"
                  type="button"
                  :style="{ backgroundColor: currentHighlightColor || selectedHighlightColor || '#fff176' }"
                  @click="openBubbleHighlightColorPicker"
                ></button>

                <button
                  class="custom-picker-btn"
                  type="button"
                  @click="openBubbleHighlightColorPicker"
                >
                  ＋
                </button>

                <input
                  ref="bubbleHighlightColorInputRef"
                  v-model="bubbleCustomHighlightColor"
                  type="color"
                  class="hidden-color-input"
                  @change="applyBubbleHighlight(bubbleCustomHighlightColor)"
                />
              </div>
            </div>
          </div>

          <span class="bubble-divider"></span>

          <button
            class="bubble-btn link"
            type="button"
            title="新增連結"
            @mousedown.prevent
            @click.stop="openBubbleLinkModal"
          >
            <i class="fa-solid fa-link"></i>
          </button>
        </div>

        <div class="document-shell">
          <editor-content
            v-if="editor"
            :editor="editor"
            class="tiptap-content"
          />
        </div>
      </section>
    </main>

    <!-- 新增連結 Modal -->
    <div v-if="showLinkModal" class="modal-mask" @click.self="closeLinkModal">
      <div class="link-modal">
        <h3>新增連結</h3>
        <p class="modal-hint">可連到其他筆記、星球，或外部網站。</p>

        <label>連結類型</label>
        <select v-model="linkForm.target_type" class="modal-input">
          <option value="note">筆記</option>
          <option value="planet">星球</option>
          <option value="url">外部網站</option>
        </select>

        <label>顯示文字</label>
        <input
          v-model="linkForm.display_text"
          class="modal-input"
          placeholder="例如：AI 學習筆記"
        />

        <template v-if="linkForm.target_type === 'url'">
          <label>網址</label>
          <input
            v-model="linkForm.target_url"
            class="modal-input"
            placeholder="https://example.com"
          />
        </template>

        <template v-else>
          <label>
            選擇{{ linkForm.target_type === 'note' ? '筆記' : '星球' }}
          </label>

          <select v-model="linkForm.target_id" class="modal-input">
            <option value="">
              請選擇{{ linkForm.target_type === 'note' ? '筆記' : '星球' }}
            </option>

            <template v-if="linkForm.target_type === 'note'">
              <option
                v-for="note in allNotes"
                :key="note.id"
                :value="note.id"
              >
                {{ note.title || '未命名文件' }}
              </option>
            </template>

            <template v-else-if="linkForm.target_type === 'planet'">
              <option
                v-for="planet in allPlanets"
                :key="planet.id"
                :value="planet.id"
              >
                {{ planet.name || '未命名星球' }}
              </option>
            </template>
          </select>
        </template>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeLinkModal">取消</button>
          <button class="confirm-btn" @click="submitLink">插入連結</button>
        </div>
      </div>
    </div>
    <input
      ref="mediaFileInputRef"
      type="file"
      accept="image/*,video/*"
      class="hidden-media-input"
      @change="handleMediaUpload"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { EditorContent, useEditor, VueRenderer } from '@tiptap/vue-3'
import { Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import FontFamily from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'

import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'

import { useNotesStore } from '../stores/notes'
import { usePlanetsStore } from '../stores/planets'
import { useLinksStore } from '../stores/links'
import { useEditorTabsStore } from '../stores/editorTabs'

import EditorTabs from '../components/editor/EditorTabs.vue'
import SlashCommandList from '../components/editor/SlashCommandList.vue'
import { SlashCommand, getSlashCommandItems } from '../extensions/SlashCommand'
import { VideoEmbed } from '../extensions/VideoEmbed'
import { uploadMediaFile } from '../services/uploads'
import { ResizableImage } from '../extensions/ResizableImage'

import markerPenLight from '../assets/markerpen-light.png'
import markerPenDark from '../assets/markerpen-dark.png'

const route = useRoute()
const router = useRouter()

const notesStore = useNotesStore()
const planetsStore = usePlanetsStore()
const linksStore = useLinksStore()
const editorTabsStore = useEditorTabsStore()

const noteId = ref(route.params.id)
const isNewNote = computed(() => String(noteId.value) === 'new')

const noteTitle = ref('未命名文件')
const isTitleEditing = ref(false)

const isSaving = ref(false)
const isCreating = ref(false)

const isNoteLoaded = ref(false)
const isLoadingNote = ref(false)
const isLeavingEditor = ref(false)
const lastSavedSnapshot = ref('')

const titleRef = ref(null)
const editorDom = ref(null)

const noteTags = ref([])
const tagInput = ref('')

const showLinkModal = ref(false)
const isToolbarExpanded = ref(false)

const selectedFontFamily = ref('Inter')
const selectedFontSize = ref('18px')
const selectedLineHeight = ref('1.85')
const selectedTextColor = ref('#000000')
const selectedHighlightColor = ref('#fff176')
const selectedHeading = ref('paragraph')

const textColorInputRef = ref(null)
const highlightColorInputRef = ref(null)

const showTextAlignMenu = ref(false)
const showLineHeightMenu = ref(false)
const showTextColorPalette = ref(false)
const showHighlightPalette = ref(false)

const savedSelection = ref(null)

const selectionBubbleStyle = ref({left: '0px', top: '0px'})

const showBubbleTextAlignMenu = ref(false)
const showBubbleLineHeightMenu = ref(false)
const showBubbleTextPalette = ref(false)
const showBubbleHighlightPalette = ref(false)

const bubbleTextColorInputRef = ref(null)
const bubbleHighlightColorInputRef = ref(null)

const bubbleCustomTextColor = ref('#000000')
const bubbleCustomHighlightColor = ref('#fff176')

const mediaFileInputRef = ref(null)

const getCurrentTheme = () => {
  const htmlTheme = document.documentElement.getAttribute('data-theme')
  const bodyTheme = document.body.getAttribute('data-theme')
  const appTheme = document.getElementById('app')?.getAttribute('data-theme')
  const savedTheme = localStorage.getItem('nova-theme')

  if (
    htmlTheme === 'dark' ||
    bodyTheme === 'dark' ||
    appTheme === 'dark' ||
    savedTheme === 'dark' ||
    document.documentElement.classList.contains('dark') ||
    document.documentElement.classList.contains('dark-mode') ||
    document.body.classList.contains('dark') ||
    document.body.classList.contains('dark-mode') ||
    document.getElementById('app')?.classList.contains('dark') ||
    document.getElementById('app')?.classList.contains('dark-mode')
  ) {
    return 'dark'
  }

  return 'light'
}

const currentTheme = ref(getCurrentTheme())

const applyTheme = (theme) => {
  const nextTheme = theme === 'dark' ? 'dark' : 'light'
  const appEl = document.getElementById('app')

  currentTheme.value = nextTheme
  localStorage.setItem('nova-theme', nextTheme)

  document.documentElement.setAttribute('data-theme', nextTheme)
  document.body.setAttribute('data-theme', nextTheme)
  appEl?.setAttribute('data-theme', nextTheme)

  document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  document.documentElement.classList.toggle('dark-mode', nextTheme === 'dark')

  document.body.classList.toggle('dark', nextTheme === 'dark')
  document.body.classList.toggle('dark-mode', nextTheme === 'dark')

  appEl?.classList.toggle('dark', nextTheme === 'dark')
  appEl?.classList.toggle('dark-mode', nextTheme === 'dark')
}

const toggleTheme = () => {
  applyTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
}

let themeObserver = new MutationObserver(() => {
  currentTheme.value = getCurrentTheme()
})
let saveTimer = null

const markerPenIcon = computed(() => {
  return currentTheme.value === 'light'
    ? markerPenLight
    : markerPenDark
})

const linkForm = ref({
  target_type: 'note',
  target_id: '',
  target_url: '',
  display_text: ''
})

const allNotes = computed(() => notesStore.notes || notesStore.allNotes || [])
const allPlanets = computed(() => planetsStore.planets || [])

const textAlignOptions = [
  {
    label: '靠左',
    value: 'left',
    icon: 'fa-align-left'
  },
  {
    label: '置中',
    value: 'center',
    icon: 'fa-align-center'
  },
  {
    label: '靠右',
    value: 'right',
    icon: 'fa-align-right'
  },
  {
    label: '左右對齊',
    value: 'justify',
    icon: 'fa-align-justify'
  }
]

const lineHeightOptions = [
  {
    label: '單行',
    value: '1'
  },
  {
    label: '1.15',
    value: '1.15'
  },
  {
    label: '1.5',
    value: '1.5'
  },
  {
    label: '雙行',
    value: '2'
  },
  {
    label: '2.5',
    value: '2.5'
  },
  {
    label: '3.0',
    value: '3'
  }
]

const colorPaletteColors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
  '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
  '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
]

const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}

              return {
                style: `font-size: ${attributes.fontSize}`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setFontSize:
        fontSize =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize })
            .run()
        },

      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run()
        }
    }
  }
})

const LineHeight = Extension.create({
  name: 'lineHeight',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight || null,
            renderHTML: attributes => {
              if (!attributes.lineHeight) return {}

              return {
                style: `line-height: ${attributes.lineHeight}`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setLineHeight:
        lineHeight =>
        ({ chain }) => {
          return chain()
            .updateAttributes('paragraph', { lineHeight })
            .updateAttributes('heading', { lineHeight })
            .run()
        },

      unsetLineHeight:
        () =>
        ({ chain }) => {
          return chain()
            .updateAttributes('paragraph', { lineHeight: null })
            .updateAttributes('heading', { lineHeight: null })
            .run()
        }
    }
  }
})

const normalizeFontFamily = (fontFamily) => {
  if (!fontFamily) return ''

  const firstFont = String(fontFamily)
    .split(',')[0]
    .trim()
    .replace(/^['"]|['"]$/g, '')

  const fontMap = {
    Inter: 'Inter',
    Arial: 'Arial',
    Georgia: 'Georgia',
    'Times New Roman': 'Times New Roman',
    'Microsoft JhengHei': 'Microsoft JhengHei',
    'Noto Sans TC': 'Noto Sans TC'
  }

  return fontMap[firstFont] || firstFont
}

const normalizeColorToHex = (color, fallback = '#000000') => {
  if (!color) return fallback

  const value = String(color).trim()

  if (value.startsWith('#')) {
    if (value.length === 4) {
      const r = value[1]
      const g = value[2]
      const b = value[3]
      return `#${r}${r}${g}${g}${b}${b}`
    }

    return value
  }

  const match = value.match(
    /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i
  )

  if (!match) return fallback

  const toHex = number => {
    return Math.max(0, Math.min(255, Number(number)))
      .toString(16)
      .padStart(2, '0')
  }

  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`
}

const updateToolbarState = (editorInstance = editor.value) => {
  if (!editorInstance || editorInstance.isDestroyed) return

  const textStyleAttrs = editorInstance.getAttributes('textStyle')
  const highlightAttrs = editorInstance.getAttributes('highlight')
  const paragraphAttrs = editorInstance.getAttributes('paragraph')
  const headingAttrs = editorInstance.getAttributes('heading')

  selectedFontFamily.value =
    normalizeFontFamily(textStyleAttrs.fontFamily) || 'Inter'

  selectedFontSize.value = textStyleAttrs.fontSize || '18px'

  selectedLineHeight.value =
    headingAttrs.lineHeight || paragraphAttrs.lineHeight || '1.85'

  selectedTextColor.value =
    normalizeColorToHex(textStyleAttrs.color, selectedTextColor.value || '#000000')

  selectedHighlightColor.value =
    normalizeColorToHex(highlightAttrs.color, selectedHighlightColor.value || '#fff176')

  if (editorInstance.isActive('heading', { level: 1 })) {
    selectedHeading.value = '1'
  } else if (editorInstance.isActive('heading', { level: 2 })) {
    selectedHeading.value = '2'
  } else if (editorInstance.isActive('heading', { level: 3 })) {
    selectedHeading.value = '3'
  } else if (editorInstance.isActive('heading', { level: 4 })) {
    selectedHeading.value = '4'
  } else if (editorInstance.isActive('heading', { level: 5 })) {
    selectedHeading.value = '5'
  } else if (editorInstance.isActive('heading', { level: 6 })) {
    selectedHeading.value = '6'
  } else {
    selectedHeading.value = 'paragraph'
  }
}

const saveEditorSelection = () => {
  if (!editor.value || editor.value.isDestroyed) return

  const { from, to } = editor.value.state.selection
  savedSelection.value = { from, to }
}

const restoreEditorSelection = () => {
  if (!editor.value || editor.value.isDestroyed || !savedSelection.value) {
    return editor.value?.chain().focus()
  }

  return editor.value
    .chain()
    .focus()
    .setTextSelection(savedSelection.value)
}

const showSelectionBubble = ref(false)

const isMediaSelection = () => {
  if (!editor.value || editor.value.isDestroyed) return false

  const { state } = editor.value
  const { selection } = state

  const selectedNode = selection.node

  if (!selectedNode) return false

  return [
    'image',
    'video',
    'resizableImage',
    'resizableVideo',
    'media',
    'novaMedia',
    'novaResizableImage',
    'novaResizableVideo'
  ].includes(selectedNode.type.name)
}

const updateSelectionBubblePosition = () => {
  if (!editor.value || editor.value.isDestroyed) {
    showSelectionBubble.value = false
    return
  }

  const { state, view } = editor.value
  const { selection } = state

  if (selection.empty) {
    showSelectionBubble.value = false
    showBubbleTextPalette.value = false
    showBubbleHighlightPalette.value = false
    return
  }

  try {
    const start = view.coordsAtPos(selection.from)
    const end = view.coordsAtPos(selection.to)

    const selectionLeft = Math.min(start.left, end.left)
    const selectionRight = Math.max(start.right, end.right)
    const selectionTop = Math.min(start.top, end.top)

    const bubbleElement = document.getElementById('selection-bubble-menu')
    const bubbleWidth = bubbleElement?.offsetWidth || 620
    const bubbleHeight = bubbleElement?.offsetHeight || 48

    let left =
      selectionLeft + (selectionRight - selectionLeft) / 2 - bubbleWidth / 2

    let top = selectionTop - bubbleHeight - 14

    const margin = 16

    if (left < margin) {
      left = margin
    }

    if (left + bubbleWidth > window.innerWidth - margin) {
      left = window.innerWidth - bubbleWidth - margin
    }

    if (top < margin) {
      top = Math.max(start.bottom, end.bottom) + 12
    }

    selectionBubbleStyle.value = {
      left: `${left}px`,
      top: `${top}px`
    }

    showSelectionBubble.value = true
  } catch (err) {
    showSelectionBubble.value = false
  }
}

const editor = useEditor({
  extensions: [
    StarterKit.configure({ link: false }),

    SlashCommand.configure({
      suggestion: {
        items: getSlashCommandItems,

        render: () => {
          let component = null
          let popup = null

          return {
            onStart: props => {
              component = new VueRenderer(SlashCommandList, {
                props: {
                  ...props,
                  theme: currentTheme.value
                },
                editor: props.editor
              })

              if (!props.clientRect) return

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
                maxWidth: 'none',
                zIndex: 99999
              })
            },

            onUpdate: props => {
              component?.updateProps({
                ...props,
                theme: currentTheme.value
              })

              if (!props.clientRect || !popup?.[0]) return

              popup[0].setProps({
                getReferenceClientRect: props.clientRect
              })
            },

            onKeyDown: props => {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide()
                return true
              }

              return component?.ref?.onKeyDown?.(props) || false
            },

            onExit: () => {
              popup?.[0]?.destroy()
              component?.destroy()

              popup = null
              component = null
            }
          }
        }
      }
    }),

    TextStyle,
    FontSize,
    LineHeight,
    Color,
    FontFamily,
    TextAlign.configure({types: ['heading', 'paragraph']}),
    Highlight.configure({ multicolor: true }),

    ResizableImage.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: {
        class: 'nova-editor-image'
      }
    }),

    VideoEmbed,

    Placeholder.configure({
      placeholder: '開始書寫你的想法...'
    }),

    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        class: 'nova-link',
        target: null,
        rel: null
      }
    })
  ],

  content: '',

  onUpdate: ({ editor }) => {
    updateToolbarState(editor)

    nextTick(() => {
      updateSelectionBubblePosition()
    })

    debouncedSave()
  },

  onSelectionUpdate: ({ editor }) => {
    updateToolbarState(editor)

    nextTick(() => {
      updateSelectionBubblePosition()
    })
  }
})

const toggleToolbar = () => {
  isToolbarExpanded.value = !isToolbarExpanded.value
}

const toggleTextAlignMenu = () => {
  showTextAlignMenu.value = !showTextAlignMenu.value

  showLineHeightMenu.value = false
  showTextColorPalette.value = false
  showHighlightPalette.value = false
  showBubbleTextAlignMenu.value = false
  showBubbleLineHeightMenu.value = false
  showBubbleTextPalette.value = false
  showBubbleHighlightPalette.value = false
}

const setTextAlign = (align) => {
  if (!editor.value || editor.value.isDestroyed) return

  editor.value
    .chain()
    .focus()
    .setTextAlign(align)
    .run()

  showTextAlignMenu.value = false
  updateToolbarState()
  debouncedSave()
}

const toggleLineHeightMenu = () => {
  showLineHeightMenu.value = !showLineHeightMenu.value

  showTextColorPalette.value = false
  showHighlightPalette.value = false
  showBubbleTextPalette.value = false
  showBubbleHighlightPalette.value = false
}

const toggleTextColorPalette = () => {
  saveEditorSelection()

  showTextColorPalette.value = !showTextColorPalette.value
  showHighlightPalette.value = false
  showLineHeightMenu.value = false
  showBubbleLineHeightMenu.value = false
}

const toggleHighlightPalette = () => {
  saveEditorSelection()

  showHighlightPalette.value = !showHighlightPalette.value
  showTextColorPalette.value = false
  showLineHeightMenu.value = false
  showBubbleLineHeightMenu.value = false
}

const openTextColorPicker = () => {
  saveEditorSelection()
  textColorInputRef.value?.click()
}

const openHighlightColorPicker = () => {
  saveEditorSelection()
  highlightColorInputRef.value?.click()
}

const applyTextColor = (color) => {
  if (!editor.value || editor.value.isDestroyed || !color) return

  selectedTextColor.value = color

  restoreEditorSelection()
    .setColor(color)
    .run()

  savedSelection.value = null
  showTextColorPalette.value = false
  debouncedSave()
}

const unsetTextColor = () => {
  if (!editor.value || editor.value.isDestroyed) return

  restoreEditorSelection()
    .unsetColor()
    .run()

  selectedTextColor.value = '#000000'
  savedSelection.value = null
  showTextColorPalette.value = false
  debouncedSave()
}

const applyHighlightColor = (color) => {
  if (!editor.value || editor.value.isDestroyed || !color) return

  selectedHighlightColor.value = color

  restoreEditorSelection()
    .setHighlight({ color })
    .run()

  savedSelection.value = null
  showHighlightPalette.value = false
  debouncedSave()
}

const unsetHighlight = () => {
  if (!editor.value || editor.value.isDestroyed) return

  restoreEditorSelection()
    .unsetHighlight()
    .run()

  savedSelection.value = null
  showHighlightPalette.value = false
  debouncedSave()
}

const setFontFamily = (font) => {
  if (!editor.value || editor.value.isDestroyed) return

  selectedFontFamily.value = font

  if (!font) {
    editor.value.chain().focus().unsetFontFamily().run()
    updateToolbarState()
    debouncedSave()
    return
  }

  editor.value.chain().focus().setFontFamily(font).run()
  updateToolbarState()
  debouncedSave()
}

const setFontSize = (size) => {
  if (!editor.value || editor.value.isDestroyed) return

  selectedFontSize.value = size

  if (!size) {
    editor.value.chain().focus().unsetFontSize().run()
    updateToolbarState()
    debouncedSave()
    return
  }

  editor.value.chain().focus().setFontSize(size).run()
  updateToolbarState()
  debouncedSave()
}

const setLineHeight = (lineHeight) => {
  if (!editor.value || editor.value.isDestroyed) return

  selectedLineHeight.value = lineHeight

  if (!lineHeight) {
    editor.value.chain().focus().unsetLineHeight().run()
    updateToolbarState()
    debouncedSave()
    showLineHeightMenu.value = false
    return
  }

  editor.value.chain().focus().setLineHeight(lineHeight).run()
  updateToolbarState()
  debouncedSave()

  showLineHeightMenu.value = false
}

const setHeading = (value) => {
  if (!editor.value || editor.value.isDestroyed) return

  if (value === 'paragraph') {
    editor.value.chain().focus().setParagraph().run()
    selectedHeading.value = 'paragraph'
    debouncedSave()
    return
  }

  const level = Number(value)

  if (!level || level < 1 || level > 6) return

  editor.value.chain().focus().setHeading({ level }).run()
  selectedHeading.value = String(level)
  debouncedSave()
}

const toggleBubbleTextPalette = () => {
  saveEditorSelection()

  showBubbleTextPalette.value = !showBubbleTextPalette.value
  showBubbleHighlightPalette.value = false
  showBubbleLineHeightMenu.value = false
}

const toggleBubbleHighlightPalette = () => {
  saveEditorSelection()

  showBubbleHighlightPalette.value = !showBubbleHighlightPalette.value
  showBubbleTextPalette.value = false
  showBubbleLineHeightMenu.value = false
}

const toggleBubbleTextAlignMenu = () => {
  saveEditorSelection()

  showBubbleTextAlignMenu.value = !showBubbleTextAlignMenu.value

  showBubbleLineHeightMenu.value = false
  showBubbleTextPalette.value = false
  showBubbleHighlightPalette.value = false
  showTextAlignMenu.value = false
  showLineHeightMenu.value = false
  showTextColorPalette.value = false
  showHighlightPalette.value = false
}

const toggleBubbleLineHeightMenu = () => {
  saveEditorSelection()

  showBubbleLineHeightMenu.value = !showBubbleLineHeightMenu.value

  showBubbleTextPalette.value = false
  showBubbleHighlightPalette.value = false
}

const openBubbleTextColorPicker = () => {
  saveEditorSelection()
  bubbleTextColorInputRef.value?.click()
}

const openBubbleHighlightColorPicker = () => {
  saveEditorSelection()
  bubbleHighlightColorInputRef.value?.click()
}

const currentTextColor = computed(() => {
  if (!editor.value) return ''

  return normalizeColorToHex(
    editor.value.getAttributes('textStyle')?.color,
    ''
  )
})

const currentFontFamily = computed(() => {
  if (!editor.value) return 'Inter'

  return normalizeFontFamily(
    editor.value.getAttributes('textStyle')?.fontFamily
  ) || 'Inter'
})

const currentFontSize = computed(() => {
  if (!editor.value) return '18px'
  return editor.value.getAttributes('textStyle')?.fontSize || '18px'
})

const currentTextAlign = computed(() => {
  if (!editor.value || editor.value.isDestroyed) return 'left'

  if (editor.value.isActive({ textAlign: 'center' })) return 'center'
  if (editor.value.isActive({ textAlign: 'right' })) return 'right'
  if (editor.value.isActive({ textAlign: 'justify' })) return 'justify'

  return 'left'
})

const currentTextAlignIcon = computed(() => {
  const matched = textAlignOptions.find(
    option => option.value === currentTextAlign.value
  )

  return matched?.icon || 'fa-align-left'
})

const currentLineHeight = computed(() => {
  if (!editor.value) return '1.85'

  const headingAttrs = editor.value.getAttributes('heading')
  const paragraphAttrs = editor.value.getAttributes('paragraph')

  return headingAttrs.lineHeight || paragraphAttrs.lineHeight || '1.85'
})

const currentHighlightColor = computed(() => {
  if (!editor.value) return ''

  return normalizeColorToHex(
    editor.value.getAttributes('highlight')?.color,
    ''
  )
})

const applyBubbleTextColor = (color) => {
  if (!editor.value || editor.value.isDestroyed) return

  const chain = restoreEditorSelection()

  if (!color) {
    chain.unsetColor().run()
    selectedTextColor.value = '#000000'
  } else {
    selectedTextColor.value = color
    bubbleCustomTextColor.value = color
    chain.setColor(color).run()
  }

  savedSelection.value = null
  showBubbleTextPalette.value = false
  debouncedSave()
}

const applyBubbleHighlight = (color) => {
  if (!editor.value || editor.value.isDestroyed) return

  const chain = restoreEditorSelection()

  if (!color) {
    chain.unsetHighlight().run()
  } else {
    selectedHighlightColor.value = color
    bubbleCustomHighlightColor.value = color
    chain.setHighlight({ color }).run()
  }

  savedSelection.value = null
  showBubbleHighlightPalette.value = false
  debouncedSave()
}

const applyBubbleFontFamily = (fontFamily) => {
  if (!editor.value || editor.value.isDestroyed) return

  if (!fontFamily) {
    editor.value.chain().focus().unsetFontFamily().run()
  } else {
    editor.value.chain().focus().setFontFamily(fontFamily).run()
  }

  updateToolbarState()
  debouncedSave()
}

const applyBubbleFontSize = (fontSize) => {
  if (!editor.value || editor.value.isDestroyed) return

  if (!fontSize) {
    editor.value.chain().focus().unsetFontSize().run()
  } else {
    editor.value.chain().focus().setFontSize(fontSize).run()
  }

  updateToolbarState()
  debouncedSave()
}

const applyBubbleTextAlign = (align) => {
  if (!editor.value || editor.value.isDestroyed) return

  restoreEditorSelection()
    .setTextAlign(align)
    .run()

  savedSelection.value = null
  showBubbleTextAlignMenu.value = false

  updateToolbarState()
  debouncedSave()
}

const applyBubbleLineHeight = (lineHeight) => {
  if (!editor.value || editor.value.isDestroyed) return

  selectedLineHeight.value = lineHeight

  const chain = restoreEditorSelection()

  if (!lineHeight) {
    chain.unsetLineHeight().run()
  } else {
    chain.setLineHeight(lineHeight).run()
  }

  savedSelection.value = null
  showBubbleLineHeightMenu.value = false

  updateToolbarState()
  debouncedSave()
}

const clearBubbleFormat = () => {
  if (!editor.value || editor.value.isDestroyed) return

  editor.value
    .chain()
    .focus()
    .unsetColor()
    .unsetHighlight()
    .unsetFontFamily()
    .unsetFontSize()
    .unsetBold()
    .unsetItalic()
    .unsetUnderline()
    .run()

  showBubbleTextPalette.value = false
  showBubbleHighlightPalette.value = false
  debouncedSave()
}

/* =========================
   Media insert / upload
========================= */

const isImageUrl = (url) => {
  const value = String(url || '').trim()

  return (
    /^data:image\//i.test(value) ||
    /^blob:/i.test(value) ||
    value.includes('/uploads/images/') ||
    /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?.*)?$/i.test(value)
  )
}

const isVideoUrl = (url) => {
  const value = String(url || '').trim()

  return (
    /^data:video\//i.test(value) ||
    value.includes('/uploads/videos/') ||
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(value) ||
    value.includes('youtube.com/watch') ||
    value.includes('youtu.be/') ||
    value.includes('youtube.com/embed/') ||
    value.includes('vimeo.com/')
  )
}

const canLoadAsImage = (url) => {
  return new Promise(resolve => {
    const img = new window.Image()

    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)

    img.src = url

    setTimeout(() => {
      resolve(false)
    }, 4000)
  })
}

const canLoadAsVideo = (url) => {
  return new Promise(resolve => {
    const video = document.createElement('video')

    video.onloadedmetadata = () => resolve(true)
    video.onerror = () => resolve(false)

    video.src = url
    video.preload = 'metadata'

    setTimeout(() => {
      resolve(false)
    }, 4000)
  })
}

const normalizeMediaUrl = (url) => {
  const value = String(url || '').trim()

  if (!value) return ''

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    value.startsWith('/uploads/')
  ) {
    return value
  }

  return `https://${value}`
}

const insertMediaByUrl = async (url) => {
  if (!editor.value || editor.value.isDestroyed) return

  const mediaUrl = normalizeMediaUrl(url)

  if (!mediaUrl) return

  if (isImageUrl(mediaUrl)) {
    editor.value
      .chain()
      .focus()
      .setImage({
        src: mediaUrl,
        alt: '圖片',
        width: '420px'
      })
      .run()

    debouncedSave()
    return
  }

  if (isVideoUrl(mediaUrl)) {
    editor.value
      .chain()
      .focus()
      .setVideoEmbed({
        src: mediaUrl,
        width: '560px'
      })
      .run()

    debouncedSave()
    return
  }

  const imageWorks = await canLoadAsImage(mediaUrl)

  if (imageWorks) {
    editor.value
      .chain()
      .focus()
      .setImage({
        src: mediaUrl,
        alt: '圖片',
        width: '420px'
      })
      .run()

    debouncedSave()
    return
  }

  const videoWorks = await canLoadAsVideo(mediaUrl)

  if (videoWorks) {
    editor.value
      .chain()
      .focus()
      .setVideoEmbed({
        src: mediaUrl,
        width: '560px'
      })
      .run()

    debouncedSave()
    return
  }

  alert(
    '無法判斷這個網址是圖片還是影片。\n\n如果你是使用電腦裡的圖片，請選「上傳本機媒體」，不要貼本機路徑。'
  )
}

const openMediaFilePicker = () => {
  if (!mediaFileInputRef.value) {
    console.warn('找不到 mediaFileInputRef，請確認 template 是否有 ref="mediaFileInputRef"')
    return
  }

  mediaFileInputRef.value.click()
}

const handleMediaUpload = async (event) => {
  const file = event.target.files?.[0]

  event.target.value = ''

  if (!file) return

  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  if (!isImage && !isVideo) {
    alert('請選擇圖片或影片檔案')
    return
  }

  try {
    isSaving.value = true

    const uploaded = await uploadMediaFile(file)

    if (uploaded.type === 'image' || isImage) {
      editor.value
        ?.chain()
        .focus()
        .setImage({
          src: uploaded.url,
          alt: file.name,
          width: '420px'
        })
        .run()
    } else if (uploaded.type === 'video' || isVideo) {
      editor.value
        ?.chain()
        .focus()
        .setVideoEmbed({
          src: uploaded.url,
          width: '560px'
        })
        .run()
    }

    debouncedSave()
  } catch (err) {
    console.error('媒體上傳失敗:', err)
    alert('媒體上傳失敗，請稍後再試')
  } finally {
    isSaving.value = false
  }
}

const handleInsertMediaUrlEvent = async (event) => {
  await insertMediaByUrl(event.detail?.url)
}

/* =========================
   Save
========================= */

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return []

  return tags
    .map(tag => String(tag || '').trim().replace('#', ''))
    .filter(Boolean)
}

const isEmptyEditorContent = (html) => {
  const value = String(html || '').trim()

  if (
    !value ||
    value === '<p></p>' ||
    value === '<p><br></p>' ||
    value === '<p></p><p></p>'
  ) {
    return true
  }

  const hasMedia = /<(img|iframe|video)\b/i.test(value)

  if (hasMedia) return false

  const text = new DOMParser()
    .parseFromString(value, 'text/html')
    .body
    .textContent
    ?.trim()

  return !text
}

const buildSavePayload = () => {
  return {
    title: noteTitle.value?.trim() || '未命名文件',
    content: editor.value?.getHTML() || '',
    tags: normalizeTags(noteTags.value)
  }
}

const makeSaveSnapshot = (payload) => {
  return JSON.stringify({
    title: payload.title || '未命名文件',
    content: payload.content || '',
    tags: normalizeTags(payload.tags)
  })
}

const shouldBlockEmptyOverwrite = (payload) => {
  if (isNewNote.value) return false

  const title = String(payload.title || '').trim()
  const tags = normalizeTags(payload.tags)
  const contentIsEmpty = isEmptyEditorContent(payload.content)

  const titleIsEmptyLike =
    !title ||
    title === '未命名文件'

  return titleIsEmptyLike && tags.length === 0 && contentIsEmpty
}

const saveCurrentNoteNow = async () => {
  clearTimeout(saveTimer)

  if (!editor.value || editor.value.isDestroyed || isCreating.value) return null
  if (isLoadingNote.value) return null
  if (!isNewNote.value && !isNoteLoaded.value) return null

  const payload = buildSavePayload()
  const snapshot = makeSaveSnapshot(payload)

  if (!isNewNote.value && snapshot === lastSavedSnapshot.value) {
    return noteId.value
  }

  if (shouldBlockEmptyOverwrite(payload)) {
    console.warn('已阻止空資料覆蓋筆記：', payload)
    return null
  }

  isSaving.value = true

  try {
    if (isNewNote.value) {
      isCreating.value = true

      const newNote = await notesStore.createNote(payload)
      const realId = newNote?.id || newNote?.noteId

      if (realId) {
        noteId.value = realId
        lastSavedSnapshot.value = snapshot

        editorTabsStore.openTab({
          id: realId,
          title: payload.title
        })

        router.replace(`/editor/${realId}`)
      }

      return realId
    }

    await notesStore.updateNote(noteId.value, payload)
    await syncLinksWithEditorContent()
    await linksStore.fetchBacklinks('note', noteId.value)

    lastSavedSnapshot.value = snapshot
    editorTabsStore.updateTabTitle(noteId.value, payload.title)

    return noteId.value
  } catch (err) {
    console.error('立即同步失敗:', err)
    throw err
  } finally {
    isSaving.value = false
    isCreating.value = false
  }
}

const debouncedSave = () => {
  if (isLeavingEditor.value) return
  if (isLoadingNote.value) return
  if (!isNewNote.value && !isNoteLoaded.value) return

  clearTimeout(saveTimer)
  isSaving.value = true

  saveTimer = setTimeout(async () => {
    if (
      isCreating.value ||
      isLeavingEditor.value ||
      isLoadingNote.value ||
      !editor.value ||
      editor.value.isDestroyed
    ) {
      isSaving.value = false
      return
    }

    if (!isNewNote.value && !isNoteLoaded.value) {
      isSaving.value = false
      return
    }

    try {
      const payload = buildSavePayload()
      const snapshot = makeSaveSnapshot(payload)

      if (!isNewNote.value && snapshot === lastSavedSnapshot.value) {
        isSaving.value = false
        return
      }

      if (shouldBlockEmptyOverwrite(payload)) {
        console.warn('已阻止空資料自動覆蓋筆記：', payload)
        isSaving.value = false
        return
      }

      if (isNewNote.value) {
        isCreating.value = true

        const newNote = await notesStore.createNote(payload)

        if (newNote && (newNote.id || newNote.noteId)) {
          const realId = newNote.id || newNote.noteId

          noteId.value = realId
          lastSavedSnapshot.value = snapshot

          editorTabsStore.openTab({
            id: realId,
            title: payload.title
          })

          router.replace(`/editor/${realId}`)
        }

        setTimeout(() => {
          isCreating.value = false
        }, 500)
      } else {
        await notesStore.updateNote(noteId.value, payload)
        await syncLinksWithEditorContent()
        await linksStore.fetchBacklinks('note', noteId.value)

        lastSavedSnapshot.value = snapshot
        editorTabsStore.updateTabTitle(noteId.value, payload.title)
      }
    } catch (err) {
      console.error('同步至雲端失敗:', err)
      isCreating.value = false
    } finally {
      isSaving.value = false
    }
  }, 1000)
}

/* =========================
   Title / Tags
========================= */

const handleTitleBlur = () => {
  isTitleEditing.value = false

  if (!noteTitle.value || !noteTitle.value.trim()) {
    noteTitle.value = '未命名文件'
  }

  if (!isNewNote.value) {
    editorTabsStore.updateTabTitle(noteId.value, noteTitle.value)
  }

  debouncedSave()
}

const handleTitleInput = () => {
  if (!noteTitle.value || !noteTitle.value.trim()) return

  if (!isNewNote.value) {
    editorTabsStore.updateTabTitle(noteId.value, noteTitle.value)
  }

  debouncedSave()
}

const addTag = () => {
  const val = tagInput.value.trim().replace('#', '')

  if (val && !noteTags.value.includes(val)) {
    noteTags.value.push(val)
    debouncedSave()
  }

  tagInput.value = ''
}

const removeTag = (index) => {
  noteTags.value.splice(index, 1)
  debouncedSave()
}

const handleBackspace = () => {
  if (!tagInput.value && noteTags.value.length > 0) {
    noteTags.value.pop()
    debouncedSave()
  }
}

/* =========================
   Links
========================= */

const openLinkModal = () => {
  if (!editor.value || editor.value.isDestroyed) return

  const { from, to } = editor.value.state.selection

  const selectedText = editor.value.state.doc.textBetween(
    from,
    to,
    ' '
  )

  saveEditorSelection()

  linkForm.value = {
    target_type: 'note',
    target_id: '',
    target_url: '',
    display_text: selectedText || ''
  }

  showTextColorPalette.value = false
  showHighlightPalette.value = false
  showBubbleTextPalette.value = false
  showBubbleHighlightPalette.value = false
  showSelectionBubble.value = false

  showLinkModal.value = true
}

const openBubbleLinkModal = () => {
  openLinkModal()
}

const closeLinkModal = () => {
  showLinkModal.value = false
}

const removeLink = async () => {
  if (!editor.value || editor.value.isDestroyed) return

  const attrs = editor.value.getAttributes('link')
  const href = attrs.href

  editor.value
    .chain()
    .focus()
    .extendMarkRange('link')
    .unsetLink()
    .run()

  if (!href || isNewNote.value) {
    debouncedSave()
    return
  }

  try {
    const sourceLinks = await linksStore.fetchLinks('note', noteId.value)

    let targetType = null
    let targetId = null
    let targetUrl = null

    if (href.startsWith('/editor/')) {
      targetType = 'note'
      targetId = href.replace('/editor/', '')
    } else if (href.startsWith('/universe?planet=')) {
      targetType = 'planet'
      targetId = href.replace('/universe?planet=', '')
    } else {
      targetType = 'url'
      targetUrl = href
    }

    const matchedLink = sourceLinks.find(link => {
      if (targetType === 'url') {
        return link.target_type === 'url' && link.target_url === targetUrl
      }

      return (
        String(link.target_type) === String(targetType) &&
        String(link.target_id) === String(targetId)
      )
    })

    if (matchedLink) {
      await linksStore.deleteLink(matchedLink.id)
    }

    await linksStore.fetchBacklinks('note', noteId.value)
  } catch (err) {
    console.error('刪除 links 表資料失敗:', err)
  }

  debouncedSave()
}

const submitLink = async () => {
  if (!editor.value || editor.value.isDestroyed) return

  const displayText = linkForm.value.display_text.trim()

  if (!displayText) {
    alert('請輸入顯示文字')
    return
  }

  let href = ''

  if (linkForm.value.target_type === 'url') {
    if (!linkForm.value.target_url.trim()) {
      alert('請輸入網址')
      return
    }

    href = linkForm.value.target_url.trim()

    if (!href.startsWith('http://') && !href.startsWith('https://')) {
      href = 'https://' + href
    }
  }

  if (linkForm.value.target_type === 'note') {
    if (!linkForm.value.target_id) {
      alert('請選擇筆記')
      return
    }

    href = `/editor/${linkForm.value.target_id}`
  }

  if (linkForm.value.target_type === 'planet') {
    if (!linkForm.value.target_id) {
      alert('請選擇星球')
      return
    }

    href = `/universe?planet=${linkForm.value.target_id}`
  }

  const chain = restoreEditorSelection()

  if (savedSelection.value && savedSelection.value.from !== savedSelection.value.to) {
    chain
      .extendMarkRange('link')
      .setLink({ href })
      .run()
  } else {
    chain
      .insertContent({
        type: 'text',
        text: displayText,
        marks: [{ type: 'link', attrs: { href } }]
      })
      .run()
  }

  savedSelection.value = null

  if (!isNewNote.value) {
    try {
      const existingLinks = await linksStore.fetchLinks('note', noteId.value)

      const alreadyExists = existingLinks.some(link => {
        if (linkForm.value.target_type === 'url') {
          return link.target_type === 'url' && link.target_url === href
        }

        return (
          String(link.target_type) === String(linkForm.value.target_type) &&
          String(link.target_id) === String(linkForm.value.target_id)
        )
      })

      if (!alreadyExists) {
        await linksStore.createLink({
          source_type: 'note',
          source_id: noteId.value,
          target_type: linkForm.value.target_type,
          target_id:
            linkForm.value.target_type === 'url'
              ? null
              : linkForm.value.target_id,
          target_url:
            linkForm.value.target_type === 'url'
              ? href
              : null,
          display_text: displayText
        })
      }

      await linksStore.fetchBacklinks('note', noteId.value)
    } catch (err) {
      console.error('寫入 links 表失敗:', err)
    }
  }

  closeLinkModal()
  debouncedSave()
}

const handleEditorClick = async (event) => {
  const link = event.target.closest('a')
  if (!link) return

  const href = link.getAttribute('href')
  if (!href) return

  event.preventDefault()

  if (href.startsWith('/editor/')) {
    const targetId = href.replace('/editor/', '')

    const targetNote = allNotes.value.find(
      note => String(note.id) === String(targetId)
    )

    editorTabsStore.openTab({
      id: targetId,
      title: targetNote?.title || `卡片 ${targetId}`
    })

    router.push({
      path: href,
      query: { from: noteId.value }
    })

    return
  }

  if (href.startsWith('/universe')) {
    router.push(href)
    return
  }

  window.location.href = href
}

const parseLinkFromHref = (href) => {
  if (!href) return null

  if (href.startsWith('/editor/')) {
    return {
      target_type: 'note',
      target_id: href.replace('/editor/', ''),
      target_url: null
    }
  }

  if (href.startsWith('/universe?planet=')) {
    return {
      target_type: 'planet',
      target_id: href.replace('/universe?planet=', ''),
      target_url: null
    }
  }

  return {
    target_type: 'url',
    target_id: null,
    target_url: href
  }
}

const syncLinksWithEditorContent = async () => {
  if (isNewNote.value || !editor.value || editor.value.isDestroyed) return

  const html = editor.value.getHTML()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const anchors = Array.from(doc.querySelectorAll('a[href]'))

  const currentLinks = anchors
    .map(anchor => parseLinkFromHref(anchor.getAttribute('href')))
    .filter(Boolean)

  const dbLinks = await linksStore.fetchLinks('note', noteId.value)

  for (const dbLink of dbLinks) {
    let stillExists = false

    if (dbLink.target_type === 'url') {
      stillExists = currentLinks.some(link => {
        return link.target_type === 'url' && link.target_url === dbLink.target_url
      })
    } else {
      stillExists = currentLinks.some(link => {
        return (
          String(link.target_type) === String(dbLink.target_type) &&
          String(link.target_id) === String(dbLink.target_id)
        )
      })
    }

    if (!stillExists) {
      await linksStore.deleteLink(dbLink.id)
    }
  }
}

/* =========================
   Navigation / Load
========================= */

const getBacklinkName = (link) => {
  if (link.display_text) return link.display_text

  if (link.source_type === 'planet') {
    const planet = allPlanets.value.find(p => String(p.id) === String(link.source_id))
    return planet?.name || `星球 ${link.source_id}`
  }

  const note = allNotes.value.find(n => String(n.id) === String(link.source_id))
  return note?.title || `卡片 ${link.source_id}`
}

const openBacklink = async (link) => {
  if (link.source_type === 'planet') {
    router.push('/universe')
    return
  }

  const sourceNote = allNotes.value.find(
    note => String(note.id) === String(link.source_id)
  )

  editorTabsStore.openTab({
    id: link.source_id,
    title: sourceNote?.title || getBacklinkName(link)
  })

  router.push({
    path: `/editor/${link.source_id}`,
    query: { from: noteId.value }
  })
}

const loadNote = async (id) => {
  clearTimeout(saveTimer)

  noteId.value = id
  isLoadingNote.value = true
  isNoteLoaded.value = false
  isLeavingEditor.value = false

  try {
    await notesStore.fetchNotes?.()
    await notesStore.refreshData?.()
    await planetsStore.fetchPlanets?.()

    if (String(id) === 'new') {
      noteTitle.value = '未命名文件'
      noteTags.value = []
      linksStore.backlinks = []

      if (editor.value && !editor.value.isDestroyed) {
        editor.value.commands.setContent('', false)
      }

      await nextTick()

      lastSavedSnapshot.value = makeSaveSnapshot(buildSavePayload())
      isNoteLoaded.value = true

      titleRef.value?.focus()
      return
    }

    const note = await notesStore.fetchNoteById(id)

    if (!note) {
      const nextTab = editorTabsStore.removeTab(id)

      alert('這張卡片已不存在，可能已被移到星際回收站或永久刪除。')

      if (nextTab?.id) {
        router.replace(`/editor/${nextTab.id}`)
      } else {
        router.replace({ name: 'Universe' })
      }

      return
    }

    await linksStore.fetchBacklinks('note', id)

    if (editor.value && !editor.value.isDestroyed) {
      noteTitle.value = note.title?.trim() || '未命名文件'
      noteTags.value = normalizeTags(note.tags)

      editor.value.commands.setContent(note.content || '', false)

      await nextTick()

      updateToolbarState()

      lastSavedSnapshot.value = makeSaveSnapshot(buildSavePayload())
      isNoteLoaded.value = true

      editorTabsStore.openTab({
        id: note.id || id,
        title: noteTitle.value
      })

      editorTabsStore.setActiveTab(note.id || id)
    }
  } finally {
    isLoadingNote.value = false
  }
}

const closeFloatingMenus = () => {
  showTextColorPalette.value = false
  showHighlightPalette.value = false
  showBubbleTextPalette.value = false
  showBubbleHighlightPalette.value = false
  showLineHeightMenu.value = false
  showBubbleLineHeightMenu.value = false
  showTextAlignMenu.value = false
  showBubbleTextAlignMenu.value = false
}

const handleSelectEditorTab = async (tab) => {
  if (!tab?.id) return
  if (String(tab.id) === String(noteId.value)) return

  try {
    await saveCurrentNoteNow()
  } catch (err) {
    console.warn('切換分頁前儲存失敗，仍繼續切換:', err)
  }

  editorTabsStore.setActiveTab(tab.id)
  router.push(`/editor/${tab.id}`)
}

const handleCloseEditorTab = async (tab) => {
  if (!tab?.id) return

  const closingCurrent = String(tab.id) === String(noteId.value)

  if (closingCurrent) {
    try {
      await saveCurrentNoteNow()
    } catch (err) {
      console.warn('關閉分頁前儲存失敗:', err)
    }
  }

  const nextTab = editorTabsStore.closeTab(tab.id)

  if (closingCurrent) {
    if (nextTab?.id) {
      router.push(`/editor/${nextTab.id}`)
    } else {
      router.replace({ name: 'Universe' })
    }
  }
}

const handleBack = async () => {
  try {
    if (isNoteLoaded.value && !isLoadingNote.value) {
      await saveCurrentNoteNow()
    }
  } catch (err) {
    console.warn('返回前儲存失敗:', err)
  }

  isLeavingEditor.value = true
  clearTimeout(saveTimer)

  if (route.query.from) {
    router.push(`/editor/${route.query.from}`)
  } else {
    router.replace({ name: 'Universe' })
  }
}

/* =========================
   Lifecycle
========================= */

onMounted(async () => {
  editorTabsStore.loadTabs()

  try {
    const appEl = document.getElementById('app')
    if (appEl) {
      themeObserver.observe(appEl, {
        attributes: true,
        attributeFilter: ['data-theme', 'class']
      })
    }

    applyTheme(getCurrentTheme())

    window.addEventListener('click', closeFloatingMenus)
    window.addEventListener('scroll', updateSelectionBubblePosition, true)
    window.addEventListener('resize', updateSelectionBubblePosition)

    window.addEventListener('novanote:open-media-upload', openMediaFilePicker)
    window.addEventListener('novanote:insert-media-url', handleInsertMediaUrlEvent)

    await nextTick()

    if (editor.value && !editor.value.isDestroyed) {
      editorDom.value = editor.value.view.dom
      editorDom.value.addEventListener('click', handleEditorClick)
    }

    await loadNote(route.params.id)
  } catch (err) {
    console.error('編輯器初始化失敗:', err)
  }
})

watch(
  () => route.params.id,
  async (newId) => {
    await loadNote(newId)
  }
)

onBeforeUnmount(() => {
  isLeavingEditor.value = true
  clearTimeout(saveTimer)

  window.removeEventListener('click', closeFloatingMenus)
  window.removeEventListener('scroll', updateSelectionBubblePosition, true)
  window.removeEventListener('resize', updateSelectionBubblePosition)

  window.removeEventListener('novanote:open-media-upload', openMediaFilePicker)
  window.removeEventListener('novanote:insert-media-url', handleInsertMediaUrlEvent)

  if (themeObserver) {
    themeObserver.disconnect()
    themeObserver = null
  }

  if (editorDom.value) {
    editorDom.value.removeEventListener('click', handleEditorClick)
    editorDom.value = null
  }

  if (editor.value && !editor.value.isDestroyed) {
    editor.value.destroy()
  }
})
</script>

<style scoped>
/* =========================================================
   NovaNote EditorView - Unified Cosmic HUD Style
   風格目標：和 Universe / Planet / NoteCard 保持同一套星際科技語言
========================================================= */

:global(html),
:global(body),
:global(#app) {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #050714;
}

.editor-page {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;

  --editor-accent: #786cff;
  --editor-accent-2: #41c7ff;
  --editor-accent-3: #9f7cff;
  --editor-danger: #ff6b9a;

  --page-bg:
    radial-gradient(circle at 12% 8%, rgba(120, 108, 255, 0.14), transparent 31%),
    radial-gradient(circle at 82% 18%, rgba(65, 199, 255, 0.1), transparent 32%),
    radial-gradient(circle at 62% 90%, rgba(159, 124, 255, 0.08), transparent 34%),
    linear-gradient(180deg, #f7f8ff 0%, #eef3ff 48%, #e8eeff 100%);
  --page-text: #182038;

  --surface-0: rgba(255, 255, 255, 0.98);
  --surface-1: rgba(248, 250, 255, 0.98);
  --surface-2: #ffffff;
  --surface-muted: #eef3ff;
  --surface-border: rgba(116, 132, 210, 0.26);
  --surface-border-strong: rgba(120, 108, 255, 0.38);
  --surface-line: rgba(80, 102, 170, 0.14);

  --text-main: #151c32;
  --text-soft: #3d4868;
  --text-muted: #7d89a6;
  --text-inverse: #ffffff;

  --glow-soft: 0 0 22px rgba(120, 108, 255, 0.12);
  --glow-strong: 0 0 28px rgba(120, 108, 255, 0.22);
  --panel-shadow: 0 20px 50px rgba(54, 66, 120, 0.14);
  --panel-shadow-soft: 0 12px 30px rgba(54, 66, 120, 0.1);

  --control-bg: #ffffff;
  --control-bg-hover: #f3f6ff;
  --control-border: rgba(116, 132, 210, 0.3);
  --control-border-hover: rgba(120, 108, 255, 0.52);
  --control-text: #26304e;
  --control-active-bg: linear-gradient(135deg, rgba(120, 108, 255, 0.14), rgba(65, 199, 255, 0.08));
  --control-active-text: #5147d9;

  --document-bg: #ffffff;
  --document-text: #111827;
  --document-heading: #0c1224;
  --document-border: rgba(120, 108, 255, 0.34);
  --document-inner: rgba(120, 108, 255, 0.13);

  --tag-bg: linear-gradient(135deg, rgba(120, 108, 255, 0.1), rgba(65, 199, 255, 0.08));
  --tag-border: rgba(120, 108, 255, 0.28);
  --tag-text: #5047c9;

  --modal-bg: #ffffff;
  --modal-mask: rgba(14, 18, 32, 0.38);

  background: var(--page-bg);
  color: var(--page-text);
}

.editor-page.dark-editor,
:global(html[data-theme='dark']) .editor-page,
:global(body[data-theme='dark']) .editor-page,
:global(#app[data-theme='dark']) .editor-page,
:global(.dark) .editor-page,
:global(.dark-mode) .editor-page {
  --editor-accent: #8f7cff;
  --editor-accent-2: #51bafc;
  --editor-accent-3: #b79dff;

  --page-bg:
    radial-gradient(circle at 13% 10%, rgba(143, 124, 255, 0.18), transparent 30%),
    radial-gradient(circle at 82% 16%, rgba(81, 186, 252, 0.12), transparent 30%),
    radial-gradient(circle at 58% 86%, rgba(45, 212, 191, 0.07), transparent 34%),
    linear-gradient(180deg, #050714 0%, #080c20 48%, #050714 100%);
  --page-text: #f5f7ff;

  --surface-0: rgba(11, 15, 34, 0.96);
  --surface-1: rgba(14, 18, 42, 0.94);
  --surface-2: rgba(8, 12, 31, 0.98);
  --surface-muted: rgba(255, 255, 255, 0.045);
  --surface-border: rgba(165, 150, 245, 0.2);
  --surface-border-strong: rgba(165, 140, 255, 0.46);
  --surface-line: rgba(232, 238, 255, 0.09);

  --text-main: #f5f7ff;
  --text-soft: #d8ddff;
  --text-muted: rgba(222, 228, 255, 0.62);
  --text-inverse: #050714;

  --glow-soft: 0 0 22px rgba(143, 124, 255, 0.14);
  --glow-strong: 0 0 32px rgba(143, 124, 255, 0.32);
  --panel-shadow: 0 24px 70px rgba(0, 0, 0, 0.4);
  --panel-shadow-soft: 0 14px 38px rgba(0, 0, 0, 0.28);

  --control-bg: rgba(255, 255, 255, 0.055);
  --control-bg-hover: rgba(143, 124, 255, 0.13);
  --control-border: rgba(165, 150, 245, 0.22);
  --control-border-hover: rgba(190, 175, 255, 0.55);
  --control-text: #f4f1ff;
  --control-active-bg: linear-gradient(135deg, rgba(143, 124, 255, 0.26), rgba(81, 186, 252, 0.08));
  --control-active-text: #ded6ff;

  --document-bg: linear-gradient(180deg, rgba(8, 12, 31, 0.96), rgba(5, 8, 22, 0.98));
  --document-text: #f5f7ff;
  --document-heading: #ffffff;
  --document-border: rgba(126, 146, 255, 0.3);
  --document-inner: rgba(190, 198, 255, 0.1);

  --tag-bg: linear-gradient(135deg, rgba(143, 124, 255, 0.24), rgba(81, 186, 252, 0.08));
  --tag-border: rgba(165, 140, 255, 0.42);
  --tag-text: #d8ceff;

  --modal-bg: linear-gradient(180deg, rgba(18, 22, 48, 0.98), rgba(8, 11, 28, 0.98));
  --modal-mask: rgba(0, 0, 0, 0.48);
}

.editor-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(rgba(120, 108, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(120, 108, 255, 0.045) 1px, transparent 1px),
    radial-gradient(circle, rgba(120, 108, 255, 0.24) 1px, transparent 1.5px);
  background-size: 44px 44px, 44px 44px, 96px 96px;
  opacity: 0.45;
}

.editor-page.dark-editor::before {
  background:
    linear-gradient(rgba(165, 140, 255, 0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(165, 140, 255, 0.028) 1px, transparent 1px),
    radial-gradient(circle, rgba(255, 255, 255, 0.12) 1px, transparent 1.5px);
  background-size: 44px 44px, 44px 44px, 98px 98px;
  opacity: 0.62;
}

.editor-page > * {
  position: relative;
  z-index: 1;
}

/* =========================
   Tabs
========================= */

.editor-tabs-row {
  z-index: 2600;
  flex: 0 0 44px;
  height: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 6px 30px 0;
  overflow: hidden;
  background: linear-gradient(180deg, var(--surface-0), var(--surface-1));
  border-bottom: 1px solid var(--surface-border);
  box-shadow: var(--panel-shadow-soft);
}

.editor-tabs-row::after {
  content: '';
  position: absolute;
  left: 30px;
  right: 30px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--editor-accent), var(--editor-accent-2), transparent);
  opacity: 0.48;
}

.editor-tabs-row :deep(.editor-tabs),
.editor-tabs-row :deep(.tabs-bar),
.editor-tabs-row :deep(.editor-tabs-bar),
.editor-tabs-row :deep(.tab-list),
.editor-tabs-row :deep(.tabs-list) {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 7px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.editor-tabs-row :deep(.editor-tabs::-webkit-scrollbar),
.editor-tabs-row :deep(.tabs-bar::-webkit-scrollbar),
.editor-tabs-row :deep(.editor-tabs-bar::-webkit-scrollbar),
.editor-tabs-row :deep(.tab-list::-webkit-scrollbar),
.editor-tabs-row :deep(.tabs-list::-webkit-scrollbar) {
  display: none;
}

.editor-tabs-row :deep(.tab),
.editor-tabs-row :deep(.editor-tab),
.editor-tabs-row :deep(.tab-item),
.editor-tabs-row :deep(.tab-button),
.editor-tabs-row :deep(button[role='tab']) {
  position: relative;
  height: 32px;
  min-width: 112px;
  max-width: 198px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%, 0 8px);
  background: var(--control-bg);
  color: var(--text-soft);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.84rem;
  font-weight: 850;
  transition: 0.18s ease;
}

.editor-tabs-row :deep(.tab:hover),
.editor-tabs-row :deep(.editor-tab:hover),
.editor-tabs-row :deep(.tab-item:hover),
.editor-tabs-row :deep(.tab-button:hover),
.editor-tabs-row :deep(button[role='tab']:hover) {
  color: var(--editor-accent);
  border-color: var(--control-border-hover);
  box-shadow: var(--glow-soft);
}

.editor-tabs-row :deep(.active),
.editor-tabs-row :deep(.is-active),
.editor-tabs-row :deep(.router-link-active),
.editor-tabs-row :deep(.tab.active),
.editor-tabs-row :deep(.editor-tab.active),
.editor-tabs-row :deep(.tab-item.active),
.editor-tabs-row :deep(.tab-button.active),
.editor-tabs-row :deep(button[role='tab'][aria-selected='true']) {
  color: #ffffff !important;
  border-color: rgba(165, 140, 255, 0.82) !important;
  background:
    radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.2), transparent 48%),
    linear-gradient(135deg, rgba(120, 108, 255, 0.98), rgba(65, 86, 230, 0.94)) !important;
  box-shadow: 0 0 0 1px rgba(180, 165, 255, 0.24), 0 0 20px rgba(120, 108, 255, 0.34) !important;
}

.editor-tabs-row :deep(.tab-title),
.editor-tabs-row :deep(.editor-tab-title),
.editor-tabs-row :deep(.tab-name),
.editor-tabs-row :deep(.title),
.editor-tabs-row :deep(.label) {
  min-width: 0;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
}

.editor-tabs-row :deep(.tab-close),
.editor-tabs-row :deep(.editor-tab-close),
.editor-tabs-row :deep(.close-btn),
.editor-tabs-row :deep(.close) {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: currentColor;
  cursor: pointer;
  opacity: 0.72;
}

.editor-tabs-row :deep(.tab-close:hover),
.editor-tabs-row :deep(.editor-tab-close:hover),
.editor-tabs-row :deep(.close-btn:hover),
.editor-tabs-row :deep(.close:hover) {
  opacity: 1;
  background: rgba(255, 255, 255, 0.16);
}

.editor-tabs-row :deep(.add-tab),
.editor-tabs-row :deep(.add-tab-btn),
.editor-tabs-row :deep(.new-tab-btn),
.editor-tabs-row :deep(.tab-add),
.editor-tabs-row :deep(.plus-btn) {
  width: 42px;
  min-width: 42px;
  height: 32px;
  border: 1px solid var(--surface-border-strong);
  border-radius: 8px;
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%, 0 8px);
  background: var(--control-bg);
  color: var(--editor-accent);
  cursor: pointer;
  font-weight: 900;
}

/* =========================
   Header
========================= */

.editor-header {
  z-index: 2500;
  flex: 0 0 66px;
  height: 66px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 42px;
  background: linear-gradient(180deg, var(--surface-0), var(--surface-1));
  border-bottom: 1px solid var(--surface-border);
  box-shadow: var(--panel-shadow-soft);
}

.editor-header::after {
  content: '';
  position: absolute;
  left: 42px;
  right: 42px;
  bottom: -1px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--editor-accent), var(--editor-accent-2), transparent);
  opacity: 0.52;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-left {
  min-width: 0;
  gap: 16px;
}

.header-right {
  gap: 11px;
}

.back-btn,
.header-toolbar-toggle,
.theme-toggle-btn {
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--control-border);
  border-radius: 10px;
  background: var(--control-bg);
  color: var(--control-text);
  cursor: pointer;
  font-family: inherit;
  font-weight: 850;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: 0.18s ease;
}

.back-btn {
  padding: 0 16px;
  font-size: 0.9rem;
  white-space: nowrap;
}

.header-toolbar-toggle,
.theme-toggle-btn {
  width: 38px;
  padding: 0;
}

.back-btn:hover,
.header-toolbar-toggle:hover,
.theme-toggle-btn:hover {
  transform: translateY(-1px);
  background: var(--control-bg-hover);
  border-color: var(--control-border-hover);
  color: var(--editor-accent);
  box-shadow: var(--glow-soft);
}

.header-toolbar-toggle[aria-expanded='true'] {
  background: var(--control-active-bg);
  color: var(--control-active-text);
  border-color: var(--surface-border-strong);
}

.title-slot {
  width: 350px;
  min-width: 220px;
}

.doc-title-input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 10px;
  outline: none;
  background: transparent;
  color: var(--text-main);
  font-family: inherit;
  font-size: 1.36rem;
  font-weight: 950;
  letter-spacing: -0.02em;
}

.doc-title-input::placeholder {
  color: var(--text-muted);
}

.doc-title-input:focus,
.doc-title-input.editing {
  background: var(--surface-muted);
  border-color: var(--surface-border-strong);
  box-shadow: 0 0 0 4px rgba(120, 108, 255, 0.11);
}

.editor-page.dark-editor .doc-title-input {
  text-shadow: 0 0 16px rgba(143, 124, 255, 0.2);
}

.save-status {
  color: var(--text-muted);
  font-size: 0.84rem;
  font-weight: 800;
  white-space: nowrap;
}

.save-status.is-saving {
  color: var(--editor-accent);
}

/* =========================
   Toolbar
========================= */

.toolbar-area {
  z-index: 2400;
  flex: 0 0 auto;
  background: var(--surface-0);
  border-bottom: 1px solid var(--surface-border);
  box-shadow: var(--panel-shadow-soft);
  overflow: visible;
}

.editor-toolbar {
  min-height: 60px;
  padding: 10px 42px;
  display: flex;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  gap: 8px;
  background: transparent;
  overflow: visible;
}

.toolbar-slide-enter-active,
.toolbar-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.24s ease;
  overflow: hidden;
}

.toolbar-slide-enter-from,
.toolbar-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}

.toolbar-slide-enter-to,
.toolbar-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 100px;
}

.toolbar-btn,
.text-align-menu-item,
.line-height-menu-item,
.bubble-btn,
.bubble-text-align-menu-item,
.bubble-line-height-menu-item,
.palette-none-btn,
.custom-picker-btn {
  font-family: inherit;
}

.toolbar-btn {
  height: 36px;
  min-width: 36px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--control-text);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 850;
  white-space: nowrap;
  transition: 0.16s ease;
}

.toolbar-btn:hover {
  background: var(--control-bg-hover);
  border-color: var(--control-border-hover);
  color: var(--editor-accent);
}

.toolbar-btn.active,
.toolbar-btn[aria-expanded='true'],
.toolbar-btn[aria-pressed='true'] {
  background: var(--control-active-bg);
  border-color: var(--surface-border-strong);
  color: var(--control-active-text);
  box-shadow: var(--glow-soft);
}

.toolbar-btn i,
.toolbar-btn span {
  color: inherit;
}

.italic {
  font-style: italic;
}

.toolbar-select,
.bubble-select,
.modal-input {
  border: 1px solid var(--control-border);
  border-radius: 9px;
  background: var(--control-bg);
  color: var(--control-text);
  outline: none;
  font-family: inherit;
  font-weight: 820;
}

.toolbar-select {
  height: 38px;
  min-width: 102px;
  padding: 0 12px;
  font-size: 0.86rem;
  cursor: pointer;
}

.toolbar-select:hover,
.toolbar-select:focus,
.bubble-select:hover,
.bubble-select:focus,
.modal-input:focus {
  border-color: var(--control-border-hover);
  box-shadow: 0 0 0 3px rgba(120, 108, 255, 0.12);
}

.toolbar-select option,
.bubble-select option,
.modal-input option {
  background: var(--surface-2);
  color: var(--text-main);
}

.font-select { min-width: 190px; }
.size-select { width: 86px; min-width: 86px; }
.heading-select { min-width: 128px; }

.toolbar-divider,
.bubble-divider {
  width: 1px;
  flex-shrink: 0;
  background: var(--surface-line);
}

.toolbar-divider {
  height: 26px;
  margin: 0 5px;
}

.bubble-divider {
  height: 24px;
  margin: 0 3px;
}

/* =========================
   Floating menus / palettes
========================= */

.text-align-tool,
.line-height-tool,
.color-tool,
.text-color-tool,
.highlight-tool,
.bubble-color-wrap,
.bubble-text-align-tool,
.bubble-line-height-tool {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
}

.text-align-menu,
.line-height-menu,
.color-palette,
.bubble-text-align-menu,
.bubble-line-height-menu {
  position: absolute;
  z-index: 99999;
  border: 1px solid var(--surface-border-strong);
  border-radius: 14px;
  background: var(--surface-0);
  color: var(--text-main);
  box-shadow: var(--panel-shadow), var(--glow-soft);
}

.text-align-menu {
  top: 44px;
  left: 0;
  width: 224px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.text-align-menu-item,
.bubble-text-align-menu-item {
  height: 42px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  font-size: 1.05rem;
}

.text-align-menu-item:hover,
.text-align-menu-item.active,
.bubble-text-align-menu-item:hover,
.bubble-text-align-menu-item.active {
  background: var(--control-bg-hover);
  border-color: var(--surface-border-strong);
  color: var(--editor-accent);
}

.line-height-btn,
.text-align-btn { padding: 0 8px; }
.text-align-caret { font-size: 0.72rem; opacity: 0.78; }

.line-height-icon,
.bubble-line-height-icon {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  line-height: 1;
}

.line-height-lines,
.bubble-line-height-lines {
  width: 13px;
  display: inline-flex;
  flex-direction: column;
  gap: 3px;
}

.line-height-lines span,
.bubble-line-height-lines span {
  display: block;
  width: 11px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.line-height-menu,
.bubble-line-height-menu {
  top: 44px;
  left: 0;
  width: 220px;
  padding: 10px 0;
}

.line-height-menu-item,
.bubble-line-height-menu-item {
  width: 100%;
  height: 42px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  font-size: 0.94rem;
  font-weight: 800;
  text-align: left;
}

.line-height-menu-item:hover,
.line-height-menu-item.active,
.bubble-line-height-menu-item:hover,
.bubble-line-height-menu-item.active {
  background: var(--control-bg-hover);
  color: var(--editor-accent);
}

.line-height-check,
.bubble-line-height-check {
  width: 20px;
  display: inline-flex;
  justify-content: center;
}

/* color palette */
.color-tool-btn {
  width: 40px;
  height: 36px;
  padding: 0;
}

.google-color-icon,
.bubble-color-icon,
.bubble-marker-icon-wrap {
  position: relative;
  width: 28px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--control-text);
  font-weight: 950;
}

.text-color-letter { font-size: 1rem; color: inherit; }

.markerpen-icon,
.bubble-marker-icon {
  width: 34px;
  object-fit: contain;
  display: block;
  pointer-events: none;
  filter: saturate(0.88);
}

.color-indicator,
.bubble-color-line {
  position: absolute;
  left: 4px;
  right: 4px;
  bottom: 0;
  height: 4px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.14);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3), 0 1px 4px rgba(0, 0, 0, 0.16);
}

.color-palette {
  top: 44px;
  left: 0;
  width: 330px;
  padding: 14px 16px 16px;
}

.palette-none-btn {
  width: 100%;
  height: 36px;
  margin-bottom: 10px;
  padding: 0 9px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 850;
}

.palette-none-btn:hover {
  background: var(--control-bg-hover);
  color: var(--editor-accent);
}

.none-icon {
  width: 24px;
  display: inline-flex;
  justify-content: center;
  color: var(--text-muted);
  font-weight: 950;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(10, 24px);
  gap: 6px;
  margin-bottom: 12px;
}

.palette-color-dot {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.16);
  cursor: pointer;
}

.palette-color-dot:hover {
  transform: scale(1.13);
  box-shadow: 0 0 0 3px rgba(120, 108, 255, 0.16);
}

.palette-color-dot.active {
  border-color: var(--editor-accent);
  box-shadow: 0 0 0 2px var(--surface-0), 0 0 0 4px var(--editor-accent);
}

.custom-color-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 4px;
}

.custom-label {
  margin-right: auto;
  color: var(--text-soft);
  font-size: 0.84rem;
  font-weight: 850;
}

.custom-current-color,
.custom-picker-btn {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--control-text);
  cursor: pointer;
}

.custom-picker-btn:hover {
  color: var(--editor-accent);
  border-color: var(--control-border-hover);
}

.hidden-color-input,
.hidden-media-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

/* =========================
   Main layout
========================= */

.editor-main {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 250px minmax(720px, 920px) 1fr;
  gap: 38px;
  align-items: start;
  padding: 52px 64px 54px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

.editor-content-column {
  width: 100%;
  position: relative;
}

/* =========================
   Mention panel
========================= */

.mention-panel {
  position: sticky;
  top: 18px;
  min-height: 190px;
  padding: 24px 20px 22px;
  color: var(--text-main);
  background: var(--surface-0);
  border: 1px solid var(--surface-border-strong);
  border-radius: 8px;
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  box-shadow: var(--panel-shadow), var(--glow-soft);
  overflow: hidden;
}

.mention-panel::before {
  content: '';
  position: absolute;
  inset: 12px;
  border: 1px solid var(--surface-line);
  pointer-events: none;
  background:
    linear-gradient(var(--surface-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--surface-line) 1px, transparent 1px);
  background-size: 28px 28px;
  opacity: 0.4;
}

.mention-panel > * {
  position: relative;
  z-index: 1;
}

.mention-title {
  margin: 0 0 18px;
  color: var(--text-main);
  font-size: 0.98rem;
  font-weight: 950;
  letter-spacing: 0.04em;
}

.mention-title::after {
  content: '';
  display: block;
  width: 72px;
  height: 2px;
  margin-top: 10px;
  background: linear-gradient(90deg, var(--editor-accent), var(--editor-accent-2), transparent);
  box-shadow: var(--glow-soft);
}

.mention-empty {
  padding: 20px 16px;
  color: var(--text-muted);
  text-align: center;
  font-size: 0.88rem;
  font-weight: 760;
  line-height: 1.8;
  background: var(--surface-muted);
  border: 1px solid var(--surface-line);
  border-radius: 6px;
}

.mention-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  text-align: left;
  transition: 0.18s ease;
}

.mention-item:hover {
  color: var(--editor-accent);
  background: var(--control-active-bg);
  border-color: var(--surface-border-strong);
  transform: translateX(2px);
}

.mention-type {
  min-width: 34px;
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 850;
}

.mention-name {
  min-width: 0;
  color: inherit;
  font-size: 0.88rem;
  font-weight: 850;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* =========================
   Tags
========================= */

.tag-section {
  margin-bottom: 18px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-pill {
  height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  border: 1px solid var(--tag-border);
  background: var(--tag-bg);
  color: var(--tag-text);
  font-size: 0.82rem;
  font-weight: 850;
  box-shadow: var(--glow-soft);
}

.remove-tag-btn {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 950;
}

.remove-tag-btn:hover { color: var(--editor-danger); }

.tag-input {
  min-width: 240px;
  height: 36px;
  padding: 0 16px;
  border: 1px dashed var(--surface-border-strong);
  border-radius: 999px;
  outline: none;
  background: var(--surface-0);
  color: var(--text-main);
  font-family: inherit;
  font-size: 0.86rem;
  font-weight: 820;
  letter-spacing: 0.01em;
  box-shadow: var(--panel-shadow-soft);
}

.tag-input::placeholder {
  color: var(--text-muted);
}

.tag-input:focus {
  border-color: var(--editor-accent);
  box-shadow: 0 0 0 3px rgba(120, 108, 255, 0.12), var(--glow-soft);
}

/* =========================
   Document shell
========================= */

.document-shell {
  position: relative;
  width: 920px;
  min-height: calc(100vh - 300px);
  padding: 56px 52px 72px;
  background: var(--document-bg);
  border: 1px solid var(--document-border);
  border-radius: 8px;
  clip-path: polygon(18px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0 calc(100% - 18px), 0 18px);
  box-shadow: var(--panel-shadow), var(--glow-soft);
  overflow: hidden;
}

.document-shell::before {
  content: '';
  position: absolute;
  inset: 14px;
  border: 1px solid var(--document-inner);
  pointer-events: none;
  z-index: 0;
}

.document-shell::after {
  content: '';
  position: absolute;
  inset: 14px;
  pointer-events: none;
  z-index: 0;
  background:
    linear-gradient(var(--editor-accent), var(--editor-accent)) left top / 54px 2px no-repeat,
    linear-gradient(var(--editor-accent), var(--editor-accent)) left top / 2px 54px no-repeat,
    linear-gradient(var(--editor-accent), var(--editor-accent)) right bottom / 54px 2px no-repeat,
    linear-gradient(var(--editor-accent), var(--editor-accent)) right bottom / 2px 54px no-repeat,
    linear-gradient(var(--editor-accent-2), var(--editor-accent-2)) right top / 34px 1px no-repeat,
    linear-gradient(var(--editor-accent-2), var(--editor-accent-2)) right top / 1px 34px no-repeat,
    linear-gradient(var(--editor-accent-2), var(--editor-accent-2)) left bottom / 34px 1px no-repeat,
    linear-gradient(var(--editor-accent-2), var(--editor-accent-2)) left bottom / 1px 34px no-repeat;
  opacity: 0.44;
  filter: drop-shadow(0 0 10px rgba(120, 108, 255, 0.28));
}

.tiptap-content {
  position: relative;
  z-index: 1;
}

.tiptap-content :deep(.ProseMirror) {
  position: relative;
  min-height: 240px;
  outline: none;
  color: var(--document-text);
  font-size: 18px;
  line-height: 1.85;
}

.tiptap-content :deep(.ProseMirror p) {
  margin: 0 0 1rem;
}

.tiptap-content :deep(.ProseMirror h1),
.tiptap-content :deep(.ProseMirror h2),
.tiptap-content :deep(.ProseMirror h3),
.tiptap-content :deep(.ProseMirror h4),
.tiptap-content :deep(.ProseMirror h5),
.tiptap-content :deep(.ProseMirror h6) {
  color: var(--document-heading);
  font-weight: 950;
}

.tiptap-content :deep(.ProseMirror h1) { margin: 1.5rem 0 1rem; font-size: 2.25rem; line-height: 1.08; letter-spacing: -0.035em; }
.tiptap-content :deep(.ProseMirror h2) { margin: 1.35rem 0 0.85rem; font-size: 1.68rem; line-height: 1.12; letter-spacing: -0.02em; }
.tiptap-content :deep(.ProseMirror h3) { margin: 1.2rem 0 0.75rem; font-size: 1.36rem; line-height: 1.18; }
.tiptap-content :deep(.ProseMirror h4) { margin: 1.1rem 0 0.7rem; font-size: 1.18rem; line-height: 1.2; }
.tiptap-content :deep(.ProseMirror h5) { margin: 1rem 0 0.6rem; font-size: 1rem; line-height: 1.2; }
.tiptap-content :deep(.ProseMirror h6) { margin: 0.9rem 0 0.55rem; font-size: 0.88rem; line-height: 1.2; letter-spacing: 0.06em; text-transform: uppercase; }

.tiptap-content :deep(.ProseMirror ul),
.tiptap-content :deep(.ProseMirror ol) {
  margin: 0 0 1rem;
  padding-left: 1.55rem;
}

.tiptap-content :deep(.ProseMirror li) { margin: 0.35rem 0; }

.tiptap-content :deep(.nova-link),
.tiptap-content :deep(.ProseMirror a) {
  color: var(--editor-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.tiptap-content :deep(.ProseMirror mark) {
  padding: 0.08em 0.16em;
  border-radius: 4px;
}

/* =========================
   Media nodes
========================= */

.tiptap-content :deep(.nova-media-node) {
  position: relative;
  display: block;
  width: fit-content;
  max-width: 100%;
  margin: 18px 0;
  border-radius: 14px;
  line-height: 0;
}

.tiptap-content :deep(.nova-media-node.is-selected) {
  outline: 2px solid rgba(120, 108, 255, 0.56);
  outline-offset: 5px;
}

.tiptap-content :deep(.nova-resizable-image),
.tiptap-content :deep(.nova-editor-image) {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 14px;
  border: 1px solid var(--document-border);
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  box-shadow: 0 14px 36px rgba(10, 16, 32, 0.14);
}

.tiptap-content :deep(.nova-resizable-image) { width: 100%; }
.tiptap-content :deep(.nova-editor-image) { margin: 18px 0; }

.tiptap-content :deep(.nova-resizable-video),
.tiptap-content :deep(.nova-video-wrapper) {
  position: relative;
  max-width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--document-border);
  background: #050714;
  box-shadow: 0 16px 38px rgba(10, 16, 32, 0.18);
}

.tiptap-content :deep(.nova-resizable-video) { width: 100%; }
.tiptap-content :deep(.nova-video-wrapper) { margin: 22px 0; }
.tiptap-content :deep(.nova-video-frame) { width: 100%; height: 100%; display: block; border: none; }

.tiptap-content :deep(.media-resize-dot) {
  position: absolute;
  right: -10px;
  bottom: -10px;
  z-index: 20;
  width: 18px;
  height: 18px;
  padding: 0;
  border-radius: 999px;
  border: 3px solid var(--surface-2);
  background: var(--editor-accent);
  cursor: nwse-resize;
  box-shadow: 0 0 0 1px rgba(120, 108, 255, 0.36), 0 0 18px rgba(120, 108, 255, 0.36);
}

:global(body.is-resizing-media),
:global(body.is-resizing-media *) {
  cursor: nwse-resize !important;
  user-select: none !important;
}

/* =========================
   Selection bubble
========================= */

.selection-bubble-menu {
  position: fixed;
  z-index: 99999;
  width: fit-content;
  max-width: calc(100vw - 32px);
  padding: 7px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--surface-border-strong);
  border-radius: 14px;
  background: var(--surface-0);
  color: var(--text-main);
  box-shadow: var(--panel-shadow), var(--glow-soft);
}

.bubble-btn {
  position: relative;
  width: 34px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 900;
}

.bubble-btn:hover,
.bubble-btn.active {
  background: var(--control-bg-hover);
  border-color: var(--surface-border-strong);
  color: var(--editor-accent);
}

.bubble-btn i,
.bubble-btn span { color: inherit; }

.bubble-select {
  height: 32px;
  padding: 0 9px;
  font-size: 0.8rem;
  cursor: pointer;
}

.bubble-select.font { width: 118px; }
.bubble-select.size { width: 72px; }

.bubble-color-palette {
  position: absolute;
  top: 44px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100000;
  width: 330px;
}

.bubble-text-align-menu,
.bubble-line-height-menu {
  top: 44px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100000;
}

.bubble-text-align-menu {
  width: 214px;
  padding: 9px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}

.bubble-line-height-menu {
  width: 210px;
  padding: 10px 0;
}

.bubble-text-align-btn,
.bubble-line-height-btn {
  width: 36px;
  min-width: 36px;
}

/* =========================
   Modal
========================= */

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--modal-mask);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.link-modal {
  width: min(440px, 92vw);
  padding: 28px;
  border-radius: 18px;
  border: 1px solid var(--surface-border-strong);
  background: var(--modal-bg);
  color: var(--text-main);
  box-shadow: var(--panel-shadow), var(--glow-soft);
}

.link-modal h3 {
  margin: 0 0 8px;
  color: var(--text-main);
  font-size: 1.45rem;
  font-weight: 950;
}

.modal-hint {
  margin: 0 0 22px;
  color: var(--text-muted);
  font-size: 0.88rem;
  line-height: 1.65;
}

.link-modal label {
  display: block;
  margin: 14px 0 8px;
  color: var(--text-main);
  font-weight: 850;
}

.modal-input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  font-size: 0.92rem;
}

.modal-input::placeholder {
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 26px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 44px;
  border-radius: 9px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 950;
}

.cancel-btn {
  background: var(--control-bg);
  color: var(--control-text);
  border: 1px solid var(--control-border);
}

.cancel-btn:hover {
  background: var(--control-bg-hover);
  border-color: var(--control-border-hover);
}

.confirm-btn {
  background: linear-gradient(135deg, var(--editor-accent), #5d52e8);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: var(--glow-strong);
}

.confirm-btn:hover {
  filter: brightness(1.06);
  box-shadow: 0 0 0 5px rgba(120, 108, 255, 0.14), var(--glow-strong);
}

/* =========================
   Tippy / Slash command
========================= */

:global(.tippy-box) { max-width: none !important; }
:global(.tippy-content) { padding: 0 !important; }
:global(.tippy-box[data-theme~='light']) { background: transparent !important; }

/* =========================
   Responsive
========================= */

@media (max-width: 1280px) {
  .editor-toolbar { padding: 10px 32px; }
  .font-select { min-width: 170px; }
  .heading-select { min-width: 120px; }
  .size-select { width: 76px; min-width: 76px; }
}

@media (max-width: 1100px) {
  .editor-main {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 40px 24px 40px;
  }

  .mention-panel { order: 2; position: relative; top: auto; }
  .editor-content-column { order: 1; }
  .document-shell { width: 100%; min-height: auto; padding: 50px 48px 76px; }
}

@media (max-width: 760px) {
  .editor-tabs-row { padding: 6px 14px 0; }
  .editor-tabs-row::after { left: 14px; right: 14px; }

  .editor-tabs-row :deep(.tab),
  .editor-tabs-row :deep(.editor-tab),
  .editor-tabs-row :deep(.tab-item),
  .editor-tabs-row :deep(.tab-button),
  .editor-tabs-row :deep(button[role='tab']) {
    min-width: 92px;
    max-width: 148px;
    padding: 0 10px;
  }

  .editor-header {
    height: auto;
    min-height: 64px;
    flex: 0 0 auto;
    padding: 12px 18px;
    align-items: flex-start;
    gap: 12px;
  }

  .header-left { flex-wrap: wrap; }
  .header-right { margin-left: auto; }
  .title-slot { width: 220px; min-width: 180px; }
  .doc-title-input { font-size: 1.16rem; }

  .editor-toolbar {
    padding: 8px 18px;
    gap: 8px;
  }

  .editor-main {
    padding: 28px 16px 34px;
  }

  .document-shell {
    padding: 34px 28px 64px;
  }

  .document-shell::before,
  .document-shell::after {
    inset: 10px;
  }

  .tiptap-content :deep(.ProseMirror) {
    min-height: 180px;
    font-size: 16px;
  }

  .selection-bubble-menu {
    max-width: calc(100vw - 16px);
    overflow-x: auto;
  }

  .color-palette,
  .bubble-color-palette {
    width: 304px;
  }

  .palette-grid {
    grid-template-columns: repeat(10, 22px);
    gap: 6px;
  }

  .palette-color-dot {
    width: 22px;
    height: 22px;
  }
}

/* =========================================================
   Force Remove Global Fog Overlay
   強制移除淺色模式整頁霧層
========================================================= */

:global(html),
:global(body),
:global(#app) {
  opacity: 1 !important;
  filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.editor-page,
.editor-page::before,
.editor-page::after,
.editor-page > * {
  opacity: 1 !important;
  filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 淺色模式先完全關掉背景網格，確認霧感是不是背景層造成 */
.editor-page:not(.dark-editor)::before,
.editor-page:not(.dark-editor)::after {
  display: none !important;
  content: none !important;
}

/* 淺色模式主體強制實色 */
.editor-page:not(.dark-editor) {
  background: #f6f8ff !important;
  color: #172033 !important;
}

/* 所有主要容器強制不要透明 */
.editor-page:not(.dark-editor) .editor-tabs-row,
.editor-page:not(.dark-editor) .editor-header,
.editor-page:not(.dark-editor) .toolbar-area,
.editor-page:not(.dark-editor) .editor-toolbar,
.editor-page:not(.dark-editor) .mention-panel,
.editor-page:not(.dark-editor) .document-shell,
.editor-page:not(.dark-editor) .tag-input,
.editor-page:not(.dark-editor) .tag-pill {
  opacity: 1 !important;
  filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 文字強制加深 */
.editor-page:not(.dark-editor) .doc-title-input,
.editor-page:not(.dark-editor) .back-btn,
.editor-page:not(.dark-editor) .toolbar-btn,
.editor-page:not(.dark-editor) .toolbar-select,
.editor-page:not(.dark-editor) .save-status,
.editor-page:not(.dark-editor) .mention-title,
.editor-page:not(.dark-editor) .mention-empty,
.editor-page:not(.dark-editor) .tag-input,
.editor-page:not(.dark-editor) .tag-pill,
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror),
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror *) {
  opacity: 1 !important;
  filter: none !important;
  color: #1a2235 !important;
}

/* 標題特別加深 */
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror h1),
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror h2),
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror h3),
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror h4),
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror h5),
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror h6) {
  color: #111827 !important;
}

/* 文件框直接改白底，排除透明霧感 */
.editor-page:not(.dark-editor) .document-shell {
  background: #ffffff !important;
  border: 1px solid rgba(143, 124, 255, 0.28) !important;
  box-shadow:
    0 18px 46px rgba(70, 80, 130, 0.12) !important;
}

/* 提及區直接改白底 */
.editor-page:not(.dark-editor) .mention-panel {
  background: #ffffff !important;
  border: 1px solid rgba(143, 124, 255, 0.22) !important;
  box-shadow:
    0 16px 36px rgba(70, 80, 130, 0.1) !important;
}

.editor-page:not(.dark-editor) .mention-panel::before,
.editor-page:not(.dark-editor) .document-shell::before {
  opacity: 0.18 !important;
}

.editor-page:not(.dark-editor) .tiptap-content :deep(.nova-link),
.editor-page:not(.dark-editor) .tiptap-content :deep(.ProseMirror a) {
  color: #2563eb !important;
  text-decoration-color: rgba(37, 99, 235, 0.65) !important;
}

/* =========================================================
   Selection Bubble Fix
   修正選取文字懸浮工具列被文件框 clip-path 裁切
========================================================= */

.selection-bubble-menu {
  position: fixed !important;
  z-index: 2147483647 !important;
  overflow: visible !important;
}

.selection-bubble-menu .color-palette,
.selection-bubble-menu .bubble-color-palette,
.selection-bubble-menu .bubble-text-align-menu,
.selection-bubble-menu .bubble-line-height-menu {
  z-index: 2147483647 !important;
}
</style>