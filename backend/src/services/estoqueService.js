const estoqueRepository = require('../repositories/estoqueRepository');
const produtoRepository = require('../repositories/produtoRepository');

class EstoqueService {
  async listar() {
    const estoques = await estoqueRepository.buscarTodos();
    return { sucesso: true, dados: estoques };
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const estoque = await estoqueRepository.buscarPorId(id);
    if (!estoque) {
      throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
    }
    return { sucesso: true, dados: estoque };
  }

  async buscarEstoqueBaixo() {
    const itens = await estoqueRepository.buscarEstoqueBaixo();
    return { sucesso: true, dados: itens, total: itens.length };
  }

  async cadastrar(dados) {
    const { id_produto, quantidade } = dados;

    if (!id_produto || isNaN(id_produto)) {
      throw { status: 400, mensagem: 'id_produto é obrigatório e deve ser um número' };
    }
    if (quantidade === undefined || isNaN(quantidade) || quantidade < 0) {
      throw { status: 400, mensagem: 'Quantidade inválida' };
    }

    const produto = await produtoRepository.buscarPorId(id_produto);
    if (!produto) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }

    const jaExiste = await estoqueRepository.buscarPorProduto(id_produto);
    if (jaExiste) {
      throw { status: 409, mensagem: 'Já existe um registro de estoque para este produto. Use a atualização.' };
    }

    const novo = await estoqueRepository.criar({ id_produto, quantidade });
    return { sucesso: true, mensagem: 'Estoque cadastrado com sucesso', dados: novo };
  }

  async atualizar(id, dados) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const existe = await estoqueRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
    }

    const { quantidade } = dados;
    if (quantidade === undefined || isNaN(quantidade) || quantidade < 0) {
      throw { status: 400, mensagem: 'Quantidade inválida' };
    }

    await estoqueRepository.atualizar(id, { quantidade });
    return { sucesso: true, mensagem: 'Estoque atualizado com sucesso' };
  }

  async deletar(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const existe = await estoqueRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: 'Registro de estoque não encontrado' };
    }
    await estoqueRepository.deletar(id);
    return { sucesso: true, mensagem: 'Estoque deletado com sucesso' };
  }
}

module.exports = new EstoqueService();
