const historicoPrecoRepository = require('../repositories/historicoPrecoRepository');
const produtoRepository = require('../repositories/produtoRepository');

class HistoricoPrecoService {
  async listar() {
    const historicos = await historicoPrecoRepository.buscarTodos();
    return { sucesso: true, dados: historicos };
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const historico = await historicoPrecoRepository.buscarPorId(id);
    if (!historico) {
      throw { status: 404, mensagem: 'Registro de histórico não encontrado' };
    }
    return { sucesso: true, dados: historico };
  }

  async buscarPorProduto(id_produto) {
    if (!id_produto || isNaN(id_produto)) {
      throw { status: 400, mensagem: 'id_produto inválido' };
    }
    const produto = await produtoRepository.buscarPorId(id_produto);
    if (!produto) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }
    const historicos = await historicoPrecoRepository.buscarPorProduto(id_produto);
    return { sucesso: true, dados: historicos };
  }

  async registrar(dados) {
    const { id_produto, preco_anterior, preco_novo } = dados;

    if (!id_produto || isNaN(id_produto)) {
      throw { status: 400, mensagem: 'id_produto é obrigatório' };
    }
    if (preco_anterior === undefined || preco_novo === undefined) {
      throw { status: 400, mensagem: 'Os preços anterior e novo são obrigatórios' };
    }

    const produto = await produtoRepository.buscarPorId(id_produto);
    if (!produto) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }

    const novo = await historicoPrecoRepository.criar({
      id_produto, preco_anterior, preco_novo
    });
    return { sucesso: true, mensagem: 'Histórico registrado com sucesso', dados: novo };
  }
}

module.exports = new HistoricoPrecoService();
