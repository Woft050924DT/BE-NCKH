const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  createReviewAssignment,
  submitReviewResult,
  submitSupervisionComment,
  submitPeerEvaluation,
  reviewWeeklyReport,
  getThesisScores,
  getSupervisionStudents,
  getReviewStudents,
} = require('../controllers/gradingController');

router.post('/review-assignments', auth, requireRole('ADMIN'), createReviewAssignment);
router.post('/review-results', auth, requireRole('INSTRUCTOR'), submitReviewResult);
router.post('/supervision-comments', auth, requireRole('INSTRUCTOR'), submitSupervisionComment);
router.post('/peer-evaluations', auth, requireRole('STUDENT'), submitPeerEvaluation);
router.put('/weekly-reports/:id/review', auth, requireRole('INSTRUCTOR'), reviewWeeklyReport);
router.get('/thesis-scores/:thesisId', auth, getThesisScores);
router.get('/supervision-students', getSupervisionStudents);
router.get('/review-students', getReviewStudents);

module.exports = router;
