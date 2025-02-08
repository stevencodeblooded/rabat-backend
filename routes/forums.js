const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const authMiddleware = require('../middleware/auth');

// Create a new forum (protected route)
router.post('/', authMiddleware, forumController.createForum);

// Get all forums
router.get('/', authMiddleware, forumController.getAllForums);

// Send a message in a forum
router.post('/:forumId/messages', authMiddleware, forumController.sendForumMessage);

// Add this route
router.get('/:forumId', authMiddleware, forumController.getForumMessages);

module.exports = router;