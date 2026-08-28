const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/movimentacaoEstoqueController');

router.get('/',                    controller.listar);
router.get('/produto/:id_produto', controller.historicoPorProduto);
router.get('/:id',                 controller.buscarPorId);
router.post('/',                   controller.registrar);

module.exports = router;
