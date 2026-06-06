const express = require('express');
const router = express.Router();
const planetController = require('../controllers/planetController');

// 這裡的路徑是相對於 app.js 裡設定的 /api/planets

// 一般星球
router.get('/', planetController.getPlanets);                  // GET /api/planets
router.post('/', planetController.createPlanet);                // POST /api/planets

// 垃圾桶星球
// 注意：/trash 要放在 /:id 前面
router.get('/trash', planetController.getTrashPlanets);         // GET /api/planets/trash
router.put('/:id/restore', planetController.restorePlanet);     // PUT /api/planets/:id/restore
router.delete(
  '/:id/permanent',
  planetController.permanentDeletePlanet
);                                                              // DELETE /api/planets/:id/permanent

// 更新星球
router.put('/:id/position', planetController.updatePlanetPosition); // PUT /api/planets/:id/position
router.put('/:id', planetController.updatePlanet);                  // PUT /api/planets/:id

// 移到垃圾桶，不是真的永久刪除
router.delete('/:id', planetController.deletePlanet);               // DELETE /api/planets/:id

module.exports = router;