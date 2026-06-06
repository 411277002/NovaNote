const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// 這裡的路徑是相對於 app.js 裡設定的 /api/notes

// 一般筆記
router.get('/', noteController.getNotes);                // GET /api/notes
router.post('/', noteController.createNote);              // POST /api/notes

// 垃圾桶筆記
// 注意：/trash 要放在 /:id 前面，不然 /trash 會被當成 id
router.get('/trash', noteController.getTrashNotes);       // GET /api/notes/trash
router.put('/:id/restore', noteController.restoreNote);   // PUT /api/notes/:id/restore
router.delete(
  '/:id/permanent',
  noteController.permanentDeleteNote
);                                                        // DELETE /api/notes/:id/permanent

// 單一筆記
router.get('/:id', noteController.getNoteById);           // GET /api/notes/:id

// 更新筆記
router.put('/:id/move', noteController.moveNote);         // PUT /api/notes/:id/move
router.put('/:id/position', noteController.updatePosition); // PUT /api/notes/:id/position
router.put('/:id', noteController.updateNote);            // PUT /api/notes/:id

// 移到垃圾桶，不是真的永久刪除
router.delete('/:id', noteController.deleteNote);         // DELETE /api/notes/:id

module.exports = router;