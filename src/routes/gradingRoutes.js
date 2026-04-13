const express = require('express');
const router = express.Router();
const {
  createReviewAssignment,
  submitReviewResult,
  submitSupervisionComment,
  submitPeerEvaluation,
  reviewWeeklyReport,
  getThesisScores,
} = require('../controllers/gradingController');

router.post('/review-assignments', createReviewAssignment);
router.post('/review-results', submitReviewResult);
router.post('/supervision-comments', submitSupervisionComment);
router.post('/peer-evaluations', submitPeerEvaluation);
router.put('/weekly-reports/:id/review', reviewWeeklyReport);
router.get('/thesis-scores/:thesisId', getThesisScores);

module.exports = router;
