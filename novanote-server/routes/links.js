const express = require('express');
const router = express.Router();
const {
  createLink,
  getAllLinks,
  getLinksBySource,
  getBacklinks,
  deleteLink
} = require('../controllers/linkController');

router.post('/', createLink);
router.get('/', getAllLinks);
router.get('/:source_type/:source_id', getLinksBySource);
router.get('/backlinks/:target_type/:target_id', getBacklinks);
router.delete('/:id', deleteLink);

module.exports = router;