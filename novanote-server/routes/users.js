const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/:id/profile', userController.getProfile)
router.put('/:id/profile', userController.updateProfile)
router.put('/:id/password', userController.updatePassword)

module.exports = router