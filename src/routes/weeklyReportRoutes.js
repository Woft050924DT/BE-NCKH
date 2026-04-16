const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createWeeklyReport, getWeeklyReports, provideFeedback } = require('../controllers/weeklyReportController');

router.post('/theses/:thesisId/weekly-reports', createWeeklyReport);
router.get('/theses/:thesisId/weekly-reports', auth, getWeeklyReports);
router.patch('/weekly-reports/:reportId/feedback', auth, provideFeedback);

module.exports = router;
