const express = require('express');
const router = express.Router();
const funcionarioController = require('../controllers/funcionarioController');
const { autorizar } = require('../middlewares/authMiddleware');

router.use(autorizar('gerente'));

router.get('/', funcionarioController.listar);
router.get('/:id', funcionarioController.buscarPorId);
router.post('/', funcionarioController.cadastrar);
router.put('/:id', funcionarioController.atualizar);
router.delete('/:id', funcionarioController.deletar);

module.exports = router;