const express = require('express');
const router = express.Router();
const planetController = require('../controllers/planetController');

router.get('/', planetController.getPlanets);
router.post('/', planetController.createPlanet);
router.put('/:id/position', planetController.updatePlanetPosition);
router.put('/:id', planetController.updatePlanet);
router.delete('/:id', planetController.deletePlanet);

module.exports = router;