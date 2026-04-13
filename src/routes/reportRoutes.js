const express = require('express');
const router = express.Router();
const {
  createThesisTask,
  updateThesisTask,
  getThesisTasks,
  createWeeklyReport,
  updateWeeklyReport,
  getWeeklyReports,
  addIndividualContribution,
  submitFinalReport,
  getThesisProgress,
} = require('../controllers/reportController');

router.post('/thesis-tasks', createThesisTask);
router.put('/thesis-tasks/:id', updateThesisTask);
router.get('/thesis-tasks', getThesisTasks);
router.post('/weekly-reports', createWeeklyReport);
router.put('/weekly-reports/:id', updateWeeklyReport);
router.get('/weekly-reports', getWeeklyReports);
router.post('/weekly-report-contributions', addIndividualContribution);
router.put('/theses/:id/submit-final-report', submitFinalReport);
router.get('/thesis-progress/:thesisId', getThesisProgress);

module.exports = router;
