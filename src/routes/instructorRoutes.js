const express = require('express');
const router = express.Router();
const { getInstructors, getInstructorById, createInstructor } = require('../controllers/instructorController');

router.get('/', getInstructors);
router.get('/:id', getInstructorById);
router.post('/', createInstructor);

module.exports = router;
