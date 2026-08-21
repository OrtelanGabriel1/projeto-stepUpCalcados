const estoqueService = require('../services/estoqueService');

class EstoqueController {
  async listar(req, res) {
    try {
      const resultado = await estoqueService.listar();
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await estoqueService.buscarPorId(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarEstoqueBaixo(req, res) {
    try {
      const resultado = await estoqueService.buscarEstoqueBaixo();
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async cadastrar(req, res) {
    try {
      const resultado = await estoqueService.cadastrar(req.body);
      res.status(201).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async atualizar(req, res) {
    try {
      const resultado = await estoqueService.atualizar(req.params.id, req.body);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async deletar(req, res) {
    try {
      const resultado = await estoqueService.deletar(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }
}

module.exports = new EstoqueController();
