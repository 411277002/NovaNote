import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { noteAPI, planetAPI } from '../api'
import { useEditorTabsStore } from './editorTabs'

export const useNotesStore = defineStore('notes', () => {
  const allNotes = ref([])
  const planets = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 漂浮筆記：沒有歸屬星球的筆記
  const floatingNotes = computed(() => {
    return allNotes.value.filter(note => !note.planet_id)
  })

  // 根據星球 ID 取得該星球內的筆記
  const getNotesByPlanetId = (planetId) => {
    return allNotes.value.filter(
      note => String(note.planet_id) === String(planetId)
    )
  }

  const normalizeNote = (note) => {
    return {
      ...note,
      tags: Array.isArray(note.tags)
        ? note.tags
        : note.tags
          ? String(note.tags).split(',')
          : []
    }
  }

  // --- Actions ---

  // 1. 刷新所有資料
  const refreshData = async () => {
    loading.value = true
    error.value = null

    try {
      const [pRes, nRes] = await Promise.all([
        planetAPI.getAll(),
        noteAPI.getAll()
      ])

      planets.value = Array.isArray(pRes.data)
        ? pRes.data
        : pRes.data.planets || []

      allNotes.value = Array.isArray(nRes.data)
        ? nRes.data.map(normalizeNote)
        : []
    } catch (err) {
      console.error('刷新資料失敗:', err)
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  // 2. 獲取單一筆記
  const fetchNoteById = async (id) => {
    try {
      const response = await api.get(`/notes/${id}`)
      return normalizeNote(response.data)
    } catch (err) {
      console.error('抓取單筆筆記失敗:', err)
      return null
    }
  }

  // 3. 建立新筆記
  const createNote = async (noteData = {}) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))

      const payload = {
        title: noteData.title || '未命名文件',
        content: noteData.content || '',
        tags: noteData.tags || [],
        planet_id: noteData.planet_id || null,
        user_id: user?.id || null
      }

      const response = await api.post('/notes', payload)
      const savedNote = response.data

      const normalizedNote = {
        ...savedNote,
        id: savedNote.id || savedNote.noteId,
        title: savedNote.title || payload.title,
        content: savedNote.content ?? payload.content,
        planet_id: savedNote.planet_id ?? payload.planet_id,
        tags: Array.isArray(savedNote.tags)
          ? savedNote.tags
          : payload.tags
      }

      allNotes.value.push(normalizedNote)

      await refreshData()

      return normalizedNote
    } catch (err) {
      console.error('Store 建立筆記失敗:', err)
      throw err
    }
  }

  // 4. 更新筆記內容
  const updateNote = async (id, noteData) => {
    try {
      const payload = {
        title: noteData.title || '未命名文件',
        content: noteData.content || '',
        tags: noteData.tags || []
      }

      const response = await api.put(`/notes/${id}`, payload)

      const updatedNote = response.data.note
        ? normalizeNote(response.data.note)
        : {
            ...payload,
            id
          }

      const index = allNotes.value.findIndex(
        note => String(note.id) === String(id)
      )

      if (index !== -1) {
        allNotes.value[index] = {
          ...allNotes.value[index],
          ...updatedNote,
          tags: payload.tags
        }
      }

      return updatedNote
    } catch (err) {
      console.error('更新筆記失敗:', err)
      throw err
    }
  }

  // 5. 更新座標
  const updateNotePosition = async (id, x_pos, y_pos) => {
    try {
      await api.put(`/notes/${id}/position`, {
        x_pos,
        y_pos
      })

      const note = allNotes.value.find(
        note => String(note.id) === String(id)
      )

      if (note) {
        note.x_pos = x_pos
        note.y_pos = y_pos
      }
    } catch (err) {
      console.error('座標同步失敗:', err)
      throw err
    }
  }

  // 6. 將筆記移入星球 / 離開星球
  const moveNoteToPlanet = async (noteId, planetId) => {
    try {
      await api.put(`/notes/${noteId}/move`, {
        planet_id: planetId
      })

      const note = allNotes.value.find(
        note => String(note.id) === String(noteId)
      )

      if (note) {
        note.planet_id = planetId || null
      }

      await refreshData()
    } catch (err) {
      console.error('歸類星球失敗:', err)
      throw err
    }
  }

  // 7. 刪除筆記：移到垃圾桶
  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`)

      // 後端是軟刪除，前端先從宇宙畫面移除
      allNotes.value = allNotes.value.filter(
        note => String(note.id) !== String(id)
      )

      const editorTabsStore = useEditorTabsStore()
      editorTabsStore.removeTab(id)

      return true
    } catch (err) {
      console.error('刪除筆記失敗:', err)
      throw err
    }
  }

  // 8. 取得垃圾桶筆記
  const fetchTrashNotes = async () => {
    try {
      const res = await api.get('/notes/trash')

      return Array.isArray(res.data)
        ? res.data.map(normalizeNote)
        : []
    } catch (err) {
      console.error('取得垃圾桶筆記失敗:', err)
      throw err
    }
  }

  // 9. 復原筆記
  const restoreNote = async (id) => {
    try {
      const res = await api.put(`/notes/${id}/restore`)

      const restoredNote = res.data.note
        ? normalizeNote(res.data.note)
        : null

      if (restoredNote) {
        const exists = allNotes.value.some(
          note => String(note.id) === String(restoredNote.id)
        )

        if (!exists) {
          allNotes.value.push(restoredNote)
        }
      }

      await refreshData()

      return res.data
    } catch (err) {
      console.error('復原筆記失敗:', err)
      throw err
    }
  }

  // 10. 永久刪除筆記
  const permanentDeleteNote = async (id) => {
    try {
      const res = await api.delete(`/notes/${id}/permanent`)

      allNotes.value = allNotes.value.filter(
        note => String(note.id) !== String(id)
      )

      return res.data
    } catch (err) {
      console.error('永久刪除筆記失敗:', err)
      throw err
    }
  }

  // 11. 建立新星球
  // 這個其實比較適合放在 planets store，但你原本有，我先保留避免其他檔案壞掉
  const createPlanet = async (planetData) => {
    try {
      await api.post('/planets', planetData)
      await refreshData()
    } catch (err) {
      console.error('建立星球失敗:', err)
      throw err
    }
  }

  return {
    allNotes,
    planets,
    loading,
    error,

    floatingNotes,
    getNotesByPlanetId,

    refreshData,
    fetchNoteById,
    createNote,
    updateNote,
    updateNotePosition,
    moveNoteToPlanet,
    deleteNote,

    fetchTrashNotes,
    restoreNote,
    permanentDeleteNote,

    createPlanet
  }
})