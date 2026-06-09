const express = require('express');
const { verifyToken } = require('./auth');
const reportsController = require('../controllers/reportsController');

const router = express.Router();

router.get('/', verifyToken, reportsController.getAllReports);
router.get('/:id', verifyToken, reportsController.getReportById);
router.get('/:id/pdf', verifyToken, reportsController.downloadPdf);
router.post('/:id/email', verifyToken, reportsController.emailReport);
router.post('/:id/submit', verifyToken, reportsController.submitReport);
router.delete('/:id', verifyToken, reportsController.deleteReport);
router.post('/:id/approve', verifyToken, reportsController.approveReport);
router.post('/:id/reject', verifyToken, reportsController.rejectReport);
router.post('/:id/mark-notified', verifyToken, reportsController.markNotified);

module.exports = { router };
