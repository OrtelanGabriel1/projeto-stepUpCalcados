const historicoPrecoService = require('../services/historicoPrecoService');

class HistoricoPrecoController {
  async listar(req, res) {
    try {
      const resultado = await historicoPrecoService.listar();
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await historicoPrecoService.buscarPorId(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarPorProduto(req, res) {
    try {
      const resultado = await historicoPrecoService.buscarPorProduto(req.params.id_produto);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async registrar(req, res) {
    try {
      const resultado = await historicoPrecoService.registrar(req.body);
      res.status(201).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }
}

module.exports = new HistoricoPrecoController();
