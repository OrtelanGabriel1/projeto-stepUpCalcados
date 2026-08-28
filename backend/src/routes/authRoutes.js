const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /auth/login — pública, não exige token
router.post('/login', authController.login);

module.exports = router;
