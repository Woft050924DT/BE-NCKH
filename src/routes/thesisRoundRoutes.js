const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createThesisRound,
  activateThesisRound,
  startThesisRound,
  autoUpdateThesisRoundStatus,
  assignInstructors,
  getInstructorAssignments,
  assignClasses,
  addGuidanceProcess,
  getThesisRounds,
  getActiveThesisRounds,
  getThesisRoundById,
  updateRoundStatus,
} = require('../controllers/thesisRoundController');

router.post('/', auth, createThesisRound);
router.put('/:id/activate', auth, activateThesisRound);
router.put('/:id/start', auth, startThesisRound);
router.post('/auto-update-status', autoUpdateThesisRoundStatus);
router.post('/:id/assign-instructors', assignInstructors);
router.get('/:id/instructors', getInstructorAssignments);
router.post('/:id/assign-classes', auth, assignClasses);
router.post('/:id/guidance-process', auth, addGuidanceProcess);
router.patch('/:roundId/status', auth, updateRoundStatus);
router.get('/', auth, getThesisRounds);
router.get('/active', auth, getActiveThesisRounds);
router.get('/:id', auth, getThesisRoundById);

module.exports = router;
