const categoriaRepository = require('../repositories/categoriaRepository');

class CategoriaService {
  async listar() {
    const categorias = await categoriaRepository.buscarTodos();
    return { sucesso: true, dados: categorias };
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const categoria = await categoriaRepository.buscarPorId(id);
    if (!categoria) {
      throw { status: 404, mensagem: 'Categoria não encontrada' };
    }
    return { sucesso: true, dados: categoria };
  }

  async cadastrar(dados) {
    const { nome, descricao } = dados;
    if (!nome) {
      throw { status: 400, mensagem: 'O nome da categoria é obrigatório' };
    }
    const existe = await categoriaRepository.buscarPorNome(nome);
    if (existe) {
      throw { status: 409, mensagem: 'Já existe uma categoria com esse nome' };
    }
    const nova = await categoriaRepository.criar({ nome, descricao });
    return { sucesso: true, mensagem: 'Categoria cadastrada com sucesso', dados: nova };
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const existe = await categoriaRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: 'Categoria não encontrada' };
    }
    const { nome, descricao } = dados;
    if (!nome) {
      throw { status: 400, mensagem: 'O nome da categoria é obrigatório' };
    }
    await categoriaRepository.atualizar(id, { nome, descricao });
    return { sucesso: true, mensagem: 'Categoria atualizada com sucesso' };
  }

  async deletar(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const existe = await categoriaRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: 'Categoria não encontrada' };
    }
    await categoriaRepository.deletar(id);
    return { sucesso: true, mensagem: 'Categoria deletada com sucesso' };
  }
}

module.exports = new CategoriaService();
