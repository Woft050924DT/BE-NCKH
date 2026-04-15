const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { login, logout, getProfile } = require('../controllers/authController');

router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', auth, getProfile);

module.exports = router;
