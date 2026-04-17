const express = require('express');
const router = express.Router();
const {
  createThesisGroup,
  getThesisGroups,
  createGroupInvitation,
  acceptInvitation,
  rejectInvitation,
  getInvitations,
  leaveGroup,
} = require('../controllers/thesisGroupController');

router.post('/', createThesisGroup);
router.get('/', getThesisGroups);
router.post('/invitations', createGroupInvitation);
router.put('/invitations/:id/accept', acceptInvitation);
router.put('/invitations/:id/reject', rejectInvitation);
router.get('/invitations', getInvitations);
router.post('/leave', leaveGroup);

module.exports = router;
