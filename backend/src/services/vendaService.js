const vendaRepository = require('../repositories/vendaRepository');
const estoqueRepository = require('../repositories/estoqueRepository');
const produtoRepository = require('../repositories/produtoRepository');

const FORMAS_PAGAMENTO = ['dinheiro', 'pix', 'credito', 'debito', 'boleto'];

const validarCpfCnpj = (valor) => {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (/^(\d)\1+$/.test(digitos)) return false;

  if (digitos.length === 11) {
    const calcularDigito = (base, pesoInicial) => {
      const soma = base
        .split('')
        .reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const primeiro = calcularDigito(digitos.slice(0, 9), 10);
    const segundo = calcularDigito(digitos.slice(0, 9) + primeiro, 11);
    return digitos.endsWith(`${primeiro}${segundo}`);
  }

  if (digitos.length === 14) {
    const calcularDigito = (base, pesos) => {
      const soma = base
        .split('')
        .reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const primeiro = calcularDigito(digitos.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const segundo = calcularDigito(digitos.slice(0, 12) + primeiro, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return digitos.endsWith(`${primeiro}${segundo}`);
  }

  return false;
};

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
    const {
      id_funcionario,
      forma_pagamento,
      itens,
      nome_comprador,
      cnpj,
      endereco,
      data_pedido,
      data_entrega_prevista,
      status_pagamento,
      status_entrega,
    } = dados;

    if (!forma_pagamento || !FORMAS_PAGAMENTO.includes(forma_pagamento)) {
      throw {
        status: 400,
        mensagem: `Forma de pagamento inválida. Use: ${FORMAS_PAGAMENTO.join(', ')}`
      };
    }
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      throw { status: 400, mensagem: 'A venda deve ter pelo menos um item' };
    }
    if (!validarCpfCnpj(cnpj)) {
      throw { status: 400, mensagem: 'Informe um CPF ou CNPJ válido' };
    }
    if (data_pedido && data_entrega_prevista && data_entrega_prevista < data_pedido) {
      throw {
        status: 400,
        mensagem: 'A data prevista de entrega não pode ser anterior à data do pedido'
      };
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
        {
          id_funcionario,
          forma_pagamento,
          valor_total: total,
          nome_comprador,
          cnpj,
          endereco,
          data_pedido,
          data_entrega_prevista,
          status_pagamento: status_pagamento || 'pago',
          status_entrega: status_entrega || 'pendente',
        },
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

  async atualizarStatus(id, dados) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const venda = await vendaRepository.buscarPorId(id);
    if (!venda) {
      throw { status: 404, mensagem: 'Venda não encontrada' };
    }
    await vendaRepository.atualizarStatus(id, dados);
    return { sucesso: true, mensagem: 'Status atualizado com sucesso' };
  }
  async cancelar(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'Venda já concluída e paga. Cancelamento não permitido.' };
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
