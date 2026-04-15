const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createGroup, inviteToGroup, respondToInvitation, registerTopic } = require('../controllers/groupController');

router.post('/thesis-rounds/:roundId/groups', auth, createGroup);
router.post('/groups/:groupId/invite', auth, inviteToGroup);
router.patch('/invitations/:invitationId/respond', auth, respondToInvitation);
router.post('/groups/:groupId/register-topic', auth, registerTopic);

module.exports = router;
