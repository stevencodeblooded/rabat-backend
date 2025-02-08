const express = require('express');
const router = express.Router();
const contributionController = require('../controllers/contributionController');
const authMiddleware = require('../middleware/auth');

// Create a new contribution (protected route)
router.post('/', authMiddleware, contributionController.createContribution);

// Get contributions (can be public)
router.get('/', contributionController.getContributions);

// Get user-specific contributions (protected route)
router.get('/user', authMiddleware, contributionController.getUserContributions);

module.exports = router;