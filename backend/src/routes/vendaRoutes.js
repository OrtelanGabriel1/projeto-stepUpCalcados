const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');

router.get('/', vendaController.listar);
router.get('/:id', vendaController.buscarPorId);
router.post('/', vendaController.registrar);
router.patch('/:id/cancelar', vendaController.cancelar);

module.exports = router;
