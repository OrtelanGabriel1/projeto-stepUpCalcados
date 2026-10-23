
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { autenticar } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);

router.put(
  '/alterar-senha',
  autenticar,
  authController.alterarSenha
);

module.exports = router;
