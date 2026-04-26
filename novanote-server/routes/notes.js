const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// 這裡的路徑是相對於 app.js 裡設定的 /api/notes
router.get('/', noteController.getNotes);             // GET /api/notes
router.get('/:id', noteController.getNoteById);
router.post('/', noteController.createNote);          // POST /api/notes
router.put('/:id/move', noteController.moveNote);     // PUT /api/notes/:id/move
router.put('/:id/position', noteController.updatePosition); // PUT /api/notes/:id/position
router.put('/:id', noteController.updateNote);        // PUT /api/notes/:id (編輯)
router.delete('/:id', noteController.deleteNote);     // DELETE /api/notes/:id (刪除)

module.exports = router;