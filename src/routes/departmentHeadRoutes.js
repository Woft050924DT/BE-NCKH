const express = require('express');
const router = express.Router();
const { getInstructorsByDepartmentHead } = require('../controllers/instructorController');

// Get list of instructors in the department head's department
router.get('/instructors', getInstructorsByDepartmentHead);

module.exports = router;
