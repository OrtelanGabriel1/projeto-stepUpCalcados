const ProdutoRepository = require('../repositories/produtoRepository');
const historicoPrecoRepository = require('../repositories/historicoPrecoRepository');

class ProdutoService {
  async buscarTodosProduto() {
    const produtos = await ProdutoRepository.buscarTodos();
    return { sucesso: true, dados: produtos };
  }

  async buscarProdutoPorId(id) {
    if (id === undefined || isNaN(id)) {
      throw { status: 400, mensagem: 'id é obrigatório e deve ser um número' };
    }
    const produto = await ProdutoRepository.buscarPorId(id);
    if (!produto) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }
    return { sucesso: true, dados: produto };
  }

  async criarProduto(dados) {
    let { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria } = dados;

    if (!nome || !cor || preco_venda === undefined || preco_custo === undefined || tamanho === undefined) {
      throw {
        status: 400,
        mensagem: 'Nome, cor, preço de venda, preço de custo e tamanho são obrigatórios'
      };
    }
    if (isNaN(preco_venda) || isNaN(preco_custo) || isNaN(tamanho)) {
      throw { status: 400, mensagem: 'Preço de venda, preço de custo e tamanho devem ser números' };
    }
    if (preco_venda <= 0 || preco_custo <= 0) {
      throw { status: 400, mensagem: 'Preço deve ser um número positivo' };
    }

    const novoProduto = { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria };
    const id = await ProdutoRepository.criar(novoProduto);

    return { sucesso: true, mensagem: 'Produto cadastrado com sucesso', id };
  }

  async atualizarProduto(id, dados) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }

    const existe = await ProdutoRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }

    const { preco_venda } = dados;
    if (preco_venda !== undefined) {
      const precoVendaMudou = Number(preco_venda) !== Number(existe.preco_venda);
      if (precoVendaMudou) {
        await historicoPrecoRepository.criar({
          id_produto: id,
          preco_anterior: existe.preco_venda,
          preco_novo: preco_venda
        });
      }
    }

    await ProdutoRepository.atualizar(id, dados);
    return { sucesso: true, mensagem: 'Produto atualizado com sucesso' };
  }

  async deletarProduto(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }

    const existe = await ProdutoRepository.buscarPorId(id);
    if (!existe) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }

    const temEstoque = await ProdutoRepository.temEstoque(id);
    if (temEstoque) {
      throw {
        status: 409,
        mensagem: 'Não é possível excluir o produto pois ele possui registros de estoque vinculados. Remova o estoque primeiro ou desative o produto.'
      };
    }

    const temVendas = await ProdutoRepository.temVendas(id);
    if (temVendas) {
      throw {
        status: 409,
        mensagem: 'Não é possível excluir o produto pois ele possui vendas registradas. O produto foi desativado para preservar o histórico.',
        acao: 'desativado'
      };
    }

    await ProdutoRepository.desativar(id);
    return { sucesso: true, mensagem: 'Produto desativado com sucesso' };
  }
}

module.exports = new ProdutoService();
