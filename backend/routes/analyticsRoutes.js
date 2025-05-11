const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyticsController');

// Get all analytics data
router.get('/dashboard', controller.getAnalytics);

module.exports = router; 