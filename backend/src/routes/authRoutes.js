const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /auth/login — pública
router.post('/login', authController.login);

// POST /auth/register — pública
router.post('/register', authController.register);

module.exports = router;