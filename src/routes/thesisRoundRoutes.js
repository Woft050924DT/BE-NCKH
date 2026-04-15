const express = require('express');
const router = express.Router();
const {
  createThesisRound,
  activateThesisRound,
  startThesisRound,
  autoUpdateThesisRoundStatus,
  assignInstructors,
  assignClasses,
  addGuidanceProcess,
  getThesisRounds,
  getActiveThesisRounds,
  getThesisRoundById,
} = require('../controllers/thesisRoundController');

router.post('/', createThesisRound);
router.put('/:id/activate', activateThesisRound);
router.put('/:id/start', startThesisRound);
router.post('/auto-update-status', autoUpdateThesisRoundStatus);
router.post('/:id/assign-instructors', assignInstructors);
router.post('/:id/assign-classes', assignClasses);
router.post('/:id/guidance-process', addGuidanceProcess);
router.get('/', getThesisRounds);
router.get('/active', getActiveThesisRounds);
router.get('/:id', getThesisRoundById);

module.exports = router;
