<template>
  <div class="notion-editor-root">
    <nav class="editor-header">
      <div class="header-left">
        <button class="back-btn" @click="handleBack">← 宇宙</button>
        <span class="mode-tag">{{ isNewNote ? '新碎片' : '編輯中' }}</span>
      </div>
      <div class="header-right">
        <span class="save-status" :class="{ 'is-saving': isSaving }">
          {{ isSaving ? '同步中...' : '已雲端儲存' }}
        </span>
      </div>
    </nav>

    <main class="notion-scroller">
      <div class="page-body">
        
        <div class="tag-section">
          <div class="tags-container">
            <span v-for="(tag, index) in noteTags" :key="index" class="tag-pill">
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

        <textarea
          ref="titleRef"
          v-model="noteTitle"
          class="title-textarea"
          placeholder="在此輸入標題..."
          rows="1"
          @input="handleTitleInput"
        ></textarea>

        <div class="editor-wrapper">
          <editor-content 
            v-if="editor" 
            :editor="editor" 
            class="tiptap-content" 
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useNotesStore } from '../stores/notes';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const route = useRoute();
const router = useRouter();
const notesStore = useNotesStore();

// 核心狀態
const noteId = ref(route.params.id);
const isNewNote = computed(() => noteId.value === 'new');
const noteTitle = ref('');
const isSaving = ref(false);
const titleRef = ref(null);

// 標籤狀態
const noteTags = ref([]);
const tagInput = ref('');

// --- 1. 初始化 TipTap 編輯器 ---
const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({ 
      placeholder: '開始書寫靈感，輸入 / 喚醒指令...',
    }),
  ],
  content: '',
  onUpdate: () => {
    if (editor.value) debouncedSave();
  },
});

// --- 2. 標籤邏輯 ---
const addTag = () => {
  const val = tagInput.value.trim().replace('#', '');
  if (val && !noteTags.value.includes(val)) {
    noteTags.value.push(val);
    debouncedSave(); // 新增標籤後觸發儲存
  }
  tagInput.value = '';
};

const removeTag = (index) => {
  noteTags.value.splice(index, 1);
  debouncedSave(); // 刪除標籤後觸發儲存
};

const handleBackspace = () => {
  // 如果輸入框是空的且按下 Backspace，則刪除最後一個標籤
  if (!tagInput.value && noteTags.value.length > 0) {
    noteTags.value.pop();
    debouncedSave();
  }
};

// --- 3. 標題自動調整高度 ---
const handleTitleInput = () => {
  if (!titleRef.value) return;
  titleRef.value.style.height = 'auto';
  titleRef.value.style.height = titleRef.value.scrollHeight + 'px';
  debouncedSave();
};

// --- 4. 自動儲存邏輯 ---
const isCreating = ref(false);
let saveTimer = null;

const debouncedSave = () => {
  clearTimeout(saveTimer);
  isSaving.value = true;
  saveTimer = setTimeout(async () => {
    // 安全檢查
    if (isCreating.value || !editor.value) return;

    try {
      const payload = {
        title: noteTitle.value || '無標題',
        content: editor.value.getHTML(),
        tags: noteTags.value // 關鍵：將標籤陣列包含在 Payload 中
      };

      if (isNewNote.value) {
        isCreating.value = true;
        const newNote = await notesStore.createNote(payload);
        if (newNote && (newNote.id || newNote.noteId)) {
          const realId = newNote.id || newNote.noteId;
          noteId.value = realId;
          router.replace(`/editor/${realId}`);
        }
        setTimeout(() => { isCreating.value = false; }, 500);
      } else {
        await notesStore.updateNote(noteId.value, payload);
      }
    } catch (err) {
      console.error("同步至雲端失敗:", err);
      isCreating.value = false;
    } finally {
      isSaving.value = false;
    }
  }, 1000);
};

// --- 5. 初始化載入 ---
onMounted(async () => {
  try {
    if (!isNewNote.value) {
      const note = await notesStore.fetchNoteById(noteId.value);
      await nextTick();
      
      if (note && editor.value) {
        noteTitle.value = note.title || '';
        // 載入標籤，若後端未回傳則給空陣列
        noteTags.value = note.tags || []; 
        editor.value.commands.setContent(note.content || '');
        
        // 初始高度調整
        setTimeout(handleTitleInput, 100);
      }
    } else {
      await nextTick();
      titleRef.value?.focus();
    }
  } catch (err) {
    console.error("編輯器初始化失敗:", err);
  }
});

const handleBack = () => {
  clearTimeout(saveTimer);
  router.push('/universe');
};

onBeforeUnmount(() => {
  clearTimeout(saveTimer);
  if (editor.value) editor.value.destroy();
});
</script>

<style scoped>
/* 基礎樣式與主題連動 */
.notion-editor-root {
  min-height: 100vh;
  background: var(--editor-bg, #0f1015); 
  color: var(--text-color, #efeff1);
  display: flex;
  flex-direction: column;
  transition: background-color 0.4s ease, color 0.4s ease;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 30px;
  background: var(--editor-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

/* 標籤區樣式 */
.tag-section {
  margin-bottom: 20px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-pill {
  background: var(--accent-color);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(100, 108, 255, 0.2);
}

.remove-tag-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
}

.remove-tag-btn:hover { color: white; }

.tag-input {
  background: transparent;
  border: 1px dashed var(--border-color);
  color: var(--text-color);
  padding: 4px 12px;
  border-radius: 15px;
  outline: none;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.tag-input:focus {
  border-color: var(--accent-color);
  border-style: solid;
}

/* 內容區 */
.notion-scroller {
  flex: 1;
  overflow-y: auto;
}

.page-body {
  max-width: 750px;
  margin: 0 auto;
  padding: 60px 40px;
}

.title-textarea {
  width: 100%;
  font-size: 3rem;
  font-weight: 800;
  background: transparent;
  border: none;
  color: var(--text-color);
  outline: none;
  resize: none;
  margin-bottom: 20px;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

/* TipTap 編輯器內容 */
:deep(.tiptap) {
  outline: none;
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--text-color);
  min-height: 500px;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--border-color);
  opacity: 0.5;
  pointer-events: none;
  height: 0;
}

:deep(.tiptap h1) { font-size: 2rem; margin-top: 1.8em; color: var(--text-color); }
:deep(.tiptap h2) { font-size: 1.6rem; margin-top: 1.4em; color: var(--text-color); }

/* 功能組件 */
.back-btn {
  background: var(--search-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover { background: var(--accent-color); color: white; }

.mode-tag {
  background: var(--accent-color);
  color: white;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: bold;
}

.save-status {
  font-size: 0.85rem;
  color: var(--border-color);
}

.save-status.is-saving {
  color: var(--accent-color);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.notion-scroller::-webkit-scrollbar { width: 6px; }
.notion-scroller::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
</style>