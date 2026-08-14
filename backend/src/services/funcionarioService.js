const funcionarioRepository = require('../repositories/funcionarioRepository');

class FuncionarioService {
  async listar() {
    return await funcionarioRepository.buscarTodos();
  }

  async buscarPorId(id) {
    const funcionario = await funcionarioRepository.buscarPorId(id);
    if (!funcionario) {
      throw { status: 404, mensagem: 'Funcionário não encontrado' };
    }
    return funcionario;
  }

  async cadastrar(dados) {
    const { nome, email, senha, tipo_funcionario } = dados;

    if (!nome || !email || !senha || !tipo_funcionario) {
      throw { status: 400, mensagem: 'Todos os campos são obrigatórios' };
    }

    return await funcionarioRepository.criar({ nome, email, senha, tipo_funcionario });
  }

  async atualizar(id, dados) {
    await this.buscarPorId(id); // garante que existe, já lança 404 se não existir

    const { nome, email, senha, tipo_funcionario } = dados;
    if (!nome || !email || !senha || !tipo_funcionario) {
      throw { status: 400, mensagem: 'Todos os campos são obrigatórios' };
    }

    const atualizado = await funcionarioRepository.atualizar(id, { nome, email, senha, tipo_funcionario });
    if (!atualizado) {
      throw { status: 500, mensagem: 'Erro ao atualizar funcionário' };
    }
    return { id_funcionario: id, nome, email, tipo_funcionario };
  }

  async deletar(id) {
    await this.buscarPorId(id);

    const deletado = await funcionarioRepository.deletar(id);
    if (!deletado) {
      throw { status: 500, mensagem: 'Erro ao deletar funcionário' };
    }
  }
}

module.exports = new FuncionarioService();