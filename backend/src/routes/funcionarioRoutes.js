const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');

router.get('/', funcionarioController.listar);
router.get('/:id', funcionarioController.buscarPorId);
router.post('/', funcionarioController.cadastrar);
router.put('/:id', funcionarioController.atualizar);
router.delete('/:id', funcionarioController.deletar);

module.exports = router;