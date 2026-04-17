const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getActiveThesisRounds } = require('../controllers/thesisRoundController');
const { getInstructors } = require('../controllers/instructorController');
const { getClasses, getClassById } = require('../controllers/adminController');

// Get active thesis rounds for students
router.get('/thesis-rounds', auth, getActiveThesisRounds);

// Get list of instructors for students
router.get('/instructors', getInstructors);

// Get list of classes for students
router.get('/classes', getClasses);

// Get class details with students list
router.get('/classes/:id', getClassById);

module.exports = router;
