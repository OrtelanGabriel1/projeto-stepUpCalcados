const funcionarioService = require('../services/funcionarioService');

class FuncionarioController {
  async listar(req, res) {
    try {
      const funcionarios = await funcionarioService.listar();
      res.status(200).json(funcionarios);
    } catch (erro) {
      res.status(erro.status || 500).json({ mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const funcionario = await funcionarioService.buscarPorId(req.params.id);
      res.status(200).json(funcionario);
    } catch (erro) {
      res.status(erro.status || 500).json({ mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async cadastrar(req, res) {
    try {
      const novoFuncionario = await funcionarioService.cadastrar(req.body);
      res.status(201).json(novoFuncionario);
    } catch (erro) {
      res.status(erro.status || 500).json({ mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async atualizar(req, res) {
    try {
      const funcionarioAtualizado = await funcionarioService.atualizar(req.params.id, req.body);
      res.status(200).json(funcionarioAtualizado);
    } catch (erro) {
      res.status(erro.status || 500).json({ mensagem: erro.mensagem || 'Erro interno' });
    }
  }

  async deletar(req, res) {
    try {
      await funcionarioService.deletar(req.params.id);
      res.status(204).send();
    } catch (erro) {
      res.status(erro.status || 500).json({ mensagem: erro.mensagem || 'Erro interno' });
    }
  }
}

module.exports = new FuncionarioController();