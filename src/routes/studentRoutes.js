const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getActiveThesisRounds } = require('../controllers/thesisRoundController');
const { getInstructors } = require('../controllers/instructorController');

// Get active thesis rounds for students
router.get('/thesis-rounds', auth, getActiveThesisRounds);

// Get list of instructors for students
router.get('/instructors', getInstructors);

module.exports = router;
