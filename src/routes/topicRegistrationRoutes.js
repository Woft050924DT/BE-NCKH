const express = require('express');
const router = express.Router();
const {
  createProposedTopic,
  getProposedTopics,
  createTopicRegistration,
  getTopicRegistrations,
  getPendingRegistrations,
  approveRegistration,
  headApproveRegistration,
} = require('../controllers/topicRegistrationController');

router.post('/proposed-topics', createProposedTopic);
router.get('/proposed-topics', getProposedTopics);
router.post('/', createTopicRegistration);
router.get('/', getTopicRegistrations);
router.get('/pending', getPendingRegistrations);
router.put('/:id/approve', approveRegistration);
router.put('/:id/head-approve', headApproveRegistration);

module.exports = router;
