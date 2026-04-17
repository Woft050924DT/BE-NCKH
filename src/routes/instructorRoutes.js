const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getInstructors, getInstructorById, getInstructorByUserId, createInstructor, getSupervisedStudents } = require('../controllers/instructorController');
const { getActiveThesisRounds } = require('../controllers/thesisRoundController');

router.get('/thesis-rounds/active', auth, getActiveThesisRounds);
router.get('/thesis-rounds', auth, getActiveThesisRounds);
router.get('/by-user/:user_id', getInstructorByUserId);
router.get('/', getInstructors);
router.get('/:id', getInstructorById);
router.get('/:id/supervised-students', auth, getSupervisedStudents);
router.post('/', createInstructor);

module.exports = router;
