const express = require('express');
const multer = require('multer');
const { verifyToken } = require('./auth');
const incidentsController = require('../controllers/incidentsController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/ocr', verifyToken, upload.single('screenshot'), incidentsController.processOcr);
router.post('/test-gemini', incidentsController.testAi);
router.post('/', verifyToken, incidentsController.createIncident);

module.exports = { router };
