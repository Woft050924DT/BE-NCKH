const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createTopic, getTopics } = require('../controllers/topicController');

router.post('/:roundId/topics', auth, createTopic);
router.get('/:roundId/topics', auth, getTopics);

module.exports = router;
