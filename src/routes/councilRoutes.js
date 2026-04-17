const express = require('express');
const router = express.Router();
const {
  createCouncil,
  getCouncils,
  getCouncilById,
  updateCouncil,
  deleteCouncil,
} = require('../controllers/councilController');

router.post('/', createCouncil);
router.get('/', getCouncils);
router.get('/:id', getCouncilById);
router.put('/:id', updateCouncil);
router.delete('/:id', deleteCouncil);

module.exports = router;
