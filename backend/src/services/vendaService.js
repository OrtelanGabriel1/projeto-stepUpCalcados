const vendaRepository = require('../repositories/vendaRepository');
const estoqueRepository = require('../repositories/estoqueRepository');
const produtoRepository = require('../repositories/produtoRepository');

const FORMAS_PAGAMENTO = ['dinheiro', 'pix', 'credito', 'debito'];

class VendaService {
  async listar() {
    const vendas = await vendaRepository.buscarTodos();
    return { sucesso: true, dados: vendas };
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const venda = await vendaRepository.buscarPorId(id);
    if (!venda) {
      throw { status: 404, mensagem: 'Venda não encontrada' };
    }
    const itens = await vendaRepository.buscarItensDaVenda(id);
    return { sucesso: true, dados: { ...venda, itens } };
  }

  async registrar(dados) {
    const { id_funcionario, forma_pagamento, itens } = dados;

    if (!forma_pagamento || !FORMAS_PAGAMENTO.includes(forma_pagamento)) {
      throw {
        status: 400,
        mensagem: `Forma de pagamento inválida. Use: ${FORMAS_PAGAMENTO.join(', ')}`
      };
    }
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      throw { status: 400, mensagem: 'A venda deve ter pelo menos um item' };
    }

    // Valida cada item e calcula total
    let total = 0;
    const itensValidados = [];

    for (const item of itens) {
      const { id_produto, quantidade } = item;

      if (!id_produto || isNaN(id_produto) || !quantidade || isNaN(quantidade) || quantidade <= 0) {
        throw { status: 400, mensagem: 'Cada item deve ter id_produto e quantidade válidos' };
      }

      const produto = await produtoRepository.buscarPorId(id_produto);
      if (!produto) {
        throw { status: 404, mensagem: `Produto id ${id_produto} não encontrado` };
      }

      const estoque = await estoqueRepository.buscarPorProduto(id_produto);
      if (!estoque || estoque.quantidade < quantidade) {
        throw {
          status: 400,
          mensagem: `Estoque insuficiente para "${produto.nome}". Disponível: ${estoque?.quantidade ?? 0}`
        };
      }

      const preco_unitario = produto.preco_venda;
      total += preco_unitario * quantidade;
      itensValidados.push({ id_produto, quantidade, preco_unitario });
    }

    // Executa em transação
    const connection = await vendaRepository.getConnection();
    try {
      await connection.beginTransaction();

      const id_venda = await vendaRepository.criar(
        { id_funcionario, forma_pagamento, valor_total: total },
        connection
      );

      for (const item of itensValidados) {
        await vendaRepository.inserirItem(id_venda, item, connection);
        await connection.query(
          'UPDATE estoque SET quantidade = quantidade - ? WHERE id_produto = ?',
          [item.quantidade, item.id_produto]
        );
      }

      await connection.commit();
      return {
        sucesso: true,
        mensagem: 'Venda registrada com sucesso',
        dados: { id_venda, total: total.toFixed(2), itens: itensValidados.length }
      };
    } catch (err) {
      await connection.rollback();
      throw { status: 500, mensagem: 'Erro ao registrar venda: ' + (err.mensagem || err.message) };
    } finally {
      connection.release();
    }
  }

  async cancelar(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const venda = await vendaRepository.buscarPorId(id);
    if (!venda) {
      throw { status: 404, mensagem: 'Venda não encontrada' };
    }

    const itens = await vendaRepository.buscarItensDaVenda(id);

    const connection = await vendaRepository.getConnection();
    try {
      await connection.beginTransaction();

      // Devolve estoque
      for (const item of itens) {
        await connection.query(
          'UPDATE estoque SET quantidade = quantidade + ? WHERE id_produto = ?',
          [item.quantidade, item.id_produto]
        );
      }

      await vendaRepository.deletar(id, connection);
      await connection.commit();

      return { sucesso: true, mensagem: 'Venda cancelada e estoque revertido' };
    } catch (err) {
      await connection.rollback();
      throw { status: 500, mensagem: 'Erro ao cancelar venda' };
    } finally {
      connection.release();
    }
  }
}

module.exports = new VendaService();
