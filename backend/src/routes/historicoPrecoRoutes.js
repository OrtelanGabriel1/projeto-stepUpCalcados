const express = require('express');
const router = express.Router();
const historicoPrecoController = require('../controllers/historicoPrecoController');

router.get('/', historicoPrecoController.listar);
router.get('/:id', historicoPrecoController.buscarPorId);
router.get('/produto/:id_produto', historicoPrecoController.buscarPorProduto);
router.post('/', historicoPrecoController.registrar);

module.exports = router;
