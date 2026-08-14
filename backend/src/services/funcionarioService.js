const funcionarioRepository = require('../repositories/funcionarioRepository');

class FuncionarioService {
  async listar() {
    const funcionario = await funcionarioRepository.buscarTodos();
    return {
      sucesso:true,
      dados:funcionario
    };
  }

  async buscarPorId(id) {
    const funcionario = await funcionarioRepository.buscarPorId(id);
    if (!funcionario) {
      throw { status: 404, mensagem: 'Funcionário não encontrado' };
    }
    return {
      sucesso:true,
      dados:funcionario
    };
  }

  async cadastrar(dados) {
    const { nome, email, senha, tipo_funcionario } = dados;

    if (!nome || !email || !senha || !tipo_funcionario) {
      throw { status: 400, mensagem: 'Todos os campos são obrigatórios' };
    }
    const novoFuncionario = { nome, email, senha, tipo_funcionario };
    const funcionarioCriado = await funcionarioRepository.criar(novoFuncionario);

    return {
      sucesso: true,
      dados: funcionarioCriado
    };
}

  async atualizar(id, dados) {

    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existe = await funcionarioRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: "Funcionário não encontrado" };
    }

    const { nome, email, senha, tipo_funcionario } = dados;
    if (!nome || !email || !senha || !tipo_funcionario) {
      throw { status: 400, mensagem: "Todos os campos são obrigatórios" };
    }

    await funcionarioRepository.atualizar(id, { nome, email, senha, tipo_funcionario });

    return {
      sucesso: true,
      mensagem: "Funcionário atualizado com sucesso",
    }
  }



async deletar(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: "ID inválido" };
    }

    const existe = await funcionarioRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: "Funcionário não encontrado" };
    }

    await funcionarioRepository.deletar(id);
    return {
      sucesso: true,
      mensagem: "Funcionário deletado com sucesso",
    }
  }}

module.exports = new FuncionarioService();