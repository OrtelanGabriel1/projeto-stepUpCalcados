const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');
const { autorizar } = require('../middlewares/authMiddleware');


router.get('/', vendaController.listar);
router.get('/:id', vendaController.buscarPorId);


router.post('/', autorizar('vendedor', 'gerente'), vendaController.registrar);

router.patch('/:id/cancelar', vendaController.cancelar);

module.exports = router;