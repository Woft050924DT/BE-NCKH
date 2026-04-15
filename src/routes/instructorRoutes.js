const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getInstructors, getInstructorById, getInstructorByUserId, createInstructor } = require('../controllers/instructorController');
const { getActiveThesisRounds } = require('../controllers/thesisRoundController');

router.get('/thesis-rounds/active', auth, getActiveThesisRounds);
router.get('/thesis-rounds', auth, getActiveThesisRounds);
router.get('/by-user/:user_id', getInstructorByUserId);
router.get('/', getInstructors);
router.get('/:id', getInstructorById);
router.post('/', createInstructor);

module.exports = router;
