const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const authMiddleware = require('../middleware/auth');

// Generate a new route (protected route)
router.post('/generate', authMiddleware, routeController.generateRoute);

// Get saved routes
router.get('/saved', authMiddleware, routeController.getSavedRoutes);

module.exports = router;