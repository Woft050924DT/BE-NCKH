const express = require('express');
const router = express.Router();
const { getInstructors, getInstructorById, getInstructorByUserId, createInstructor } = require('../controllers/instructorController');
const { getActiveThesisRounds } = require('../controllers/thesisRoundController');

router.get('/', getInstructors);
router.get('/:id', getInstructorById);
router.get('/by-user/:user_id', getInstructorByUserId);
router.post('/', createInstructor);
router.get('/thesis-rounds/active', getActiveThesisRounds);

module.exports = router;
