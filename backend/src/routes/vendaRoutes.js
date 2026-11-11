const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');
const { autorizar } = require('../middlewares/authMiddleware');

router.get('/', autorizar('vendedor', 'gerente'), vendaController.listar);
router.get('/:id', autorizar('vendedor', 'gerente'), vendaController.buscarPorId);

router.post('/', autorizar('vendedor', 'gerente'), vendaController.registrar);

router.patch('/:id/cancelar', autorizar('vendedor', 'gerente'), vendaController.cancelar);
router.patch('/:id/status', autorizar('vendedor', 'gerente'), vendaController.atualizarStatus);

module.exports = router;