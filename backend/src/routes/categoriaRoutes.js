const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.buscarPorId);
router.post('/', categoriaController.cadastrar);
router.put('/:id', categoriaController.atualizar);
router.delete('/:id', categoriaController.deletar);

module.exports = router;
