const express = require('express');

const isAuth = require('../middleware/is-auth');
const statusController = require('../controllers/status');

const router = express.Router();

// GET /status
router.get('/status', isAuth, statusController.getStatus);

// PUT /status
router.put('/status', isAuth, statusController.updateStatus);

module.exports = router;
