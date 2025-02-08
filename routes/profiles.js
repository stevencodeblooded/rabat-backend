const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/auth');

// Get user profile
router.get('/', authMiddleware, profileController.getUserProfile);

// Update user profile
router.put('/', authMiddleware, profileController.updateUserProfile);

module.exports = router;