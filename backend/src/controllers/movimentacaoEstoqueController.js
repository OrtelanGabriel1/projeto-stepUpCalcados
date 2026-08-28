const movimentacaoService = require('../services/movimentacaoEstoqueService');

class MovimentacaoEstoqueController {
  async listar(req, res) {
    try {
      const { id_produto, tipo, limit, offset } = req.query;
      const resultado = await movimentacaoService.listar({ id_produto, tipo, limit, offset });
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await movimentacaoService.buscarPorId(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async historicoPorProduto(req, res) {
    try {
      const resultado = await movimentacaoService.historicoPorProduto(req.params.id_produto);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async registrar(req, res) {
    try {
      const resultado = await movimentacaoService.registrar(req.body);
      res.status(201).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }
}

module.exports = new MovimentacaoEstoqueController();
