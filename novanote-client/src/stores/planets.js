import { defineStore } from 'pinia';
import { ref } from 'vue';
import { planetAPI } from '../api'; // 確保這裡引入的是你在 index.js 定義的封裝

export const usePlanetsStore = defineStore('planets', () => {
  // --- 狀態 (State) ---
  const planets = ref([]);
  const loading = ref(false);

  // --- 行動 (Actions) ---

  // 1. 抓取所有星球：初始化宇宙時調用
  const fetchPlanets = async () => {
    loading.value = true;
    try {
      const res = await planetAPI.getAll();
      planets.value = res.data;
    } catch (err) {
      console.error("星球同步失敗:", err);
    } finally {
      loading.value = false;
    }
  };

  // 2. 誕生新星球 (修正：解決新增後不即時顯示與紋路遺失問題)
  const createPlanet = async (planetData) => {
    try {
      const res = await planetAPI.create(planetData);
      
      // 核心修正邏輯：
      // 由於你的後端回傳格式為 { msg: '...', planetId: 15 }
      // 如果直接 push(res.data)，陣列裡會缺少名稱、顏色與最重要的 texture_type。
      // 我們在這裡手動「組合」前端原本的資料與後端發放的 ID。
      const completeNewPlanet = {
        ...planetData, // 包含 name, color, texture_type, x_pos, y_pos
        id: res.data.planetId || res.data.id // 結合後端生成的 ID
      };

      // 只要推入響應式陣列，UniverseView 的 v-for 就會立刻感知並渲染
      planets.value.push(completeNewPlanet); 
      
      return completeNewPlanet;
    } catch (err) {
      console.error("星球誕生失敗:", err);
      throw err;
    }
  };

  // 3. 更新星球座標 (修正：解決 ReferenceError: api is not defined)
  const updatePlanetPosition = async (id, x_pos, y_pos) => {
    try {
      // 修正：必須使用你 import 進來的 planetAPI，而非直接寫 api.put
      // 這會對應到你 index.js 裡的 updatePosition 定義
      await planetAPI.updatePosition(id, { x_pos, y_pos }); 
      
      // 同步本地 Pinia 狀態，確保拖曳後的座標保存在記憶體中，不因組件重繪而跑位
      const planet = planets.value.find(p => p.id === id);
      if (planet) {
        planet.x_pos = x_pos;
        planet.y_pos = y_pos;
      }
    } catch (err) {
      console.error("星球軌道偏移失敗:", err);
    }
  };

  // 4. 抹除星球
  const deletePlanet = async (id) => {
    try {
      await planetAPI.delete(id);
      // 透過過濾掉該 ID 來從畫面移除，不需要刷新頁面
      planets.value = planets.value.filter(p => p.id !== id);
    } catch (err) {
      console.error("星球毀滅失敗:", err);
      throw err;
    }
  };

  return {
    planets,
    loading,
    fetchPlanets,
    createPlanet,
    updatePlanetPosition,
    deletePlanet
  };
});