const express = require('express');
const { verifyToken } = require('./auth');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.get('/status', aiController.getStatus);
router.get('/health', aiController.getHealth);
router.post('/chat', verifyToken, aiController.chat);

module.exports = { router };
