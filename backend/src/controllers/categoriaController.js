const categoriaService = require('../services/categoriaService');

class CategoriaController {
  async listar(req, res) {
    try {
      const resultado = await categoriaService.listar();
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const resultado = await categoriaService.buscarPorId(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async cadastrar(req, res) {
    try {
      const resultado = await categoriaService.cadastrar(req.body);
      res.status(201).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async atualizar(req, res) {
    try {
      const resultado = await categoriaService.atualizar(req.params.id, req.body);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async deletar(req, res) {
    try {
      const resultado = await categoriaService.deletar(req.params.id);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }
}

module.exports = new CategoriaController();
