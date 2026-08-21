const vendaService = require('../services/vendaService');

class VendaController {
  async listar(req, res) {
    try {
      const resultado = await vendaService.listar();
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await vendaService.buscarPorId(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async registrar(req, res) {
    try {
      const resultado = await vendaService.registrar(req.body);
      res.status(201).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async cancelar(req, res) {
    try {
      const resultado = await vendaService.cancelar(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }
}

module.exports = new VendaController();
