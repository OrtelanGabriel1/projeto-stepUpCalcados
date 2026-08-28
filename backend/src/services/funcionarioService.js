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
    const novoFuncionario = { nome, email, senha: senhaHash, tipo_funcionario };
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
    if (!nome || !email || !senha || !tipo_funcionario) {
      throw { status: 400, mensagem: 'Todos os campos são obrigatórios' };
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    await funcionarioRepository.atualizar(id, { nome, email, senha: senhaHash, tipo_funcionario });

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

    const temVendas = await funcionarioRepository.temVendas(id);
    if (temVendas) {
      throw {
        status: 409,
        mensagem: 'Não é possível excluir o funcionário pois ele possui vendas registradas. O funcionário foi desativado para preservar o histórico.',
        acao: 'desativado'
      };
    }

    await funcionarioRepository.desativar(id);
    return {
      sucesso: true,
      mensagem: 'Funcionário desativado com sucesso'
    };
  }
}

module.exports = new FuncionarioService();
