const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getInstructorRegistrations, instructorReview, getHeadRegistrations, headReview } = require('../controllers/registrationController');

router.get('/instructor/registrations', auth, getInstructorRegistrations);
router.patch('/registrations/:registrationId/instructor-review', auth, instructorReview);
router.get('/head/registrations', auth, getHeadRegistrations);
router.patch('/registrations/:registrationId/head-review', auth, headReview);

module.exports = router;
