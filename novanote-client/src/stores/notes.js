import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import { noteAPI, planetAPI } from '../api';

export const useNotesStore = defineStore('notes', () => {
  // --- 狀態 (State) ---
  const allNotes = ref([]);
  const planets = ref([]);
  const loading = ref(false); // 修正：定義 loading 防止黑屏報錯

  // --- 計算屬性 (Getters) ---
  
  // 1. 漂浮筆記：過濾出沒有歸屬星球的筆記
  const floatingNotes = computed(() => {
    return allNotes.value.filter(n => !n.planet_id);
  });

  // 2. 星球筆記：根據星球 ID 過濾
  const getNotesByPlanetId = (planetId) => {
    return allNotes.value.filter(n => n.planet_id === planetId);
  };

  // --- 行動 (Actions) ---

  // 1. 刷新所有資料
  const refreshData = async () => {
    loading.value = true;
    try {
      const [pRes, nRes] = await Promise.all([
        planetAPI.getAll(),
        noteAPI.getAll()
      ]);
      planets.value = pRes.data;
      
      // 重要：後端透過 GROUP_CONCAT 傳回來的 tags 可能是 null 或 "tag1,tag2"
      // 我們在這裡統一將其格式化為陣列
      allNotes.value = nRes.data.map(note => ({
        ...note,
        tags: Array.isArray(note.tags) 
              ? note.tags 
              : (note.tags ? note.tags.split(',') : [])
      }));
    } catch (err) {
      console.error("刷新資料失敗", err);
    } finally {
      loading.value = false;
    }
  };

  // 2. 獲取單一筆記 (編輯器使用)
  const fetchNoteById = async (id) => {
    try {
      const response = await api.get(`/notes/${id}`);
      const note = response.data;
      
      // 確保傳回編輯器的 note.tags 是一個陣列
      if (note && !Array.isArray(note.tags)) {
        note.tags = note.tags ? note.tags.split(',') : [];
      }
      return note;
    } catch (err) {
      console.error("抓取單筆筆記失敗", err);
      return null;
    }
  };

  // 3. 建立新筆記
  const createNote = async (noteData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // noteData 裡面現在會包含 tags 陣列
      const payload = { ...noteData, user_id: user?.id };
      
      const response = await api.post('/notes', payload);
      const savedNote = response.data; 

      // 同步到本地陣列
      allNotes.value.push({
        ...savedNote,
        tags: noteData.tags || [] // 保持前端傳入的標籤格式
      }); 

      return savedNote; 
    } catch (err) {
      console.error("Store 建立失敗:", err);
      throw err;
    }
  };

  // 4. 更新筆記內容 (標題、內文)
  const updateNote = async (id, noteData) => {
    try {
      // noteData 包含 { title, content, tags }
      await api.put(`/notes/${id}`, noteData);
      
      // 本地同步更新
      const index = allNotes.value.findIndex(n => n.id == id);
      if (index !== -1) {
        allNotes.value[index] = { 
          ...allNotes.value[index], 
          ...noteData 
        };
      }
    } catch (err) {
      console.error("更新筆記失敗", err);
      throw err;
    }
  };

  // 5. 更新座標 (拖拽持久化)
  const updateNotePosition = async (id, x_pos, y_pos) => {
    try {
      await api.put(`/notes/${id}/position`, { x_pos, y_pos });
      const note = allNotes.value.find(n => n.id == id);
      if (note) {
        note.x_pos = x_pos;
        note.y_pos = y_pos;
      }
    } catch (err) {
      console.error("座標同步失敗", err);
    }
  };

  // 6. 將筆記移入星球
  const moveNoteToPlanet = async (noteId, planetId) => {
    try {
      await api.put(`/notes/${noteId}/move`, { planet_id: planetId });
      await refreshData();
    } catch (err) {
      console.error("歸類星球失敗", err);
    }
  };

  // 7. 刪除筆記
  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      // 本地過濾掉已刪除的筆記
      allNotes.value = allNotes.value.filter(n => n.id != id);
    } catch (err) {
      console.error("刪除失敗", err);
      throw err;
    }
  };

  // 8. 建立新星球
  const createPlanet = async (planetData) => {
    try {
      await api.post('/planets', planetData);
      await refreshData();
    } catch (err) {
      console.error("建立星球失敗", err);
      throw err;
    }
  };

  return {
    allNotes,
    planets,
    loading,
    floatingNotes,
    getNotesByPlanetId,
    refreshData,
    fetchNoteById,
    createNote,
    updateNote,
    updateNotePosition,
    moveNoteToPlanet,
    deleteNote,
    createPlanet
  };
});