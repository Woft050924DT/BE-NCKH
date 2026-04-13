const express = require('express');
const router = express.Router();
const {
  createThesisRound,
  activateThesisRound,
  assignInstructors,
  assignClasses,
  addGuidanceProcess,
  getThesisRounds,
  getThesisRoundById,
} = require('../controllers/thesisRoundController');

router.post('/', createThesisRound);
router.put('/:id/activate', activateThesisRound);
router.post('/:id/assign-instructors', assignInstructors);
router.post('/:id/assign-classes', assignClasses);
router.post('/:id/guidance-process', addGuidanceProcess);
router.get('/', getThesisRounds);
router.get('/:id', getThesisRoundById);

module.exports = router;
