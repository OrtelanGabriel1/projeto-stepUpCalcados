
const bcrypt = require('bcryptjs');
const funcionarioRepository = require('../repositories/funcionarioRepository');

const SALT_ROUNDS = 10;

class FuncionarioService {
  async listar() {
    const funcionarios = await funcionarioRepository.buscarTodos();
    return {
      sucesso: true,
      dados: funcionarios
    };
  }

  async buscarPorId(id) {
    const funcionario = await funcionarioRepository.buscarPorId(id);

    if (!funcionario) {
      throw { status: 404, mensagem: 'Funcionário não encontrado' };
    }

    return {
      sucesso: true,
      dados: funcionario
    };
  }

  async cadastrar(dados) {
    const { nome, email, senha, tipo_funcionario } = dados;

    if (!nome || !email || !senha || !tipo_funcionario) {
      throw { status: 400, mensagem: 'Todos os campos são obrigatórios' };
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const novoFuncionario = {
      nome,
      email,
      senha: senhaHash,
      tipo_funcionario
    };

    const funcionarioCriado = await funcionarioRepository.criar(novoFuncionario);

    return {
      sucesso: true,
      dados: funcionarioCriado
    };
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }

    const existe = await funcionarioRepository.buscarPorId(id);

    if (!existe) {
      throw { status: 404, mensagem: 'Funcionário não encontrado' };
    }

    const { nome, email, senha, tipo_funcionario } = dados;

    if (!nome || !email || !tipo_funcionario) {
      throw {
        status: 400,
        mensagem: 'Nome, email e tipo do funcionário são obrigatórios'
      };
    }

    // A senha é opcional na edição.
    const dadosAtualizacao = {
      nome,
      email,
      tipo_funcionario
    };

    if (senha && String(senha).trim()) {
      if (String(senha).length < 6) {
        throw {
          status: 400,
          mensagem: 'A senha deve ter pelo menos 6 caracteres'
        };
      }

      dadosAtualizacao.senha = await bcrypt.hash(senha, SALT_ROUNDS);
    }

    await funcionarioRepository.atualizar(id, dadosAtualizacao);

    return {
      sucesso: true,
      mensagem: 'Funcionário atualizado com sucesso'
    };
  }

  async deletar(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }

    const existe = await funcionarioRepository.buscarPorId(id);

    if (!existe) {
      throw { status: 404, mensagem: 'Funcionário não encontrado' };
    }

    // Desativa o funcionário para preservar o histórico de vendas.
    await funcionarioRepository.desativar(id);

    return {
      sucesso: true,
      mensagem: 'Funcionário desativado com sucesso'
    };
  }
}

module.exports = new FuncionarioService();
