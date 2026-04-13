const express = require('express');
const router = express.Router();
const {
  createDefenseCouncil,
  addCouncilMember,
  createDefenseAssignment,
  submitDefenseResult,
  completeDefenseCouncil,
  getDefenseSchedule,
  getDefenseResults,
  finalizeThesis,
} = require('../controllers/defenseController');

router.post('/defense-councils', createDefenseCouncil);
router.post('/defense-councils/:id/members', addCouncilMember);
router.post('/defense-assignments', createDefenseAssignment);
router.post('/defense-results', submitDefenseResult);
router.put('/defense-councils/:id/complete', completeDefenseCouncil);
router.get('/defense-schedule/:thesisId', getDefenseSchedule);
router.get('/defense-results/:thesisId', getDefenseResults);
router.put('/theses/:id/finalize', finalizeThesis);

module.exports = router;
