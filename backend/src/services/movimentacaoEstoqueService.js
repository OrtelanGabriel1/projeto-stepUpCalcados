const movimentacaoRepo = require('../repositories/movimentacaoEstoqueRepository');
const estoqueRepo      = require('../repositories/estoqueRepository');
const produtoRepo      = require('../repositories/produtoRepository');

const TIPOS_VALIDOS = ['entrada', 'saida', 'ajuste'];

class MovimentacaoEstoqueService {

  async listar({ id_produto, tipo, limit, offset } = {}) {
    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
      throw { status: 400, mensagem: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(', ')}` };
    }
    const dados = await movimentacaoRepo.buscarTodos({ id_produto, tipo, limit, offset });
    return { sucesso: true, dados, total: dados.length };
  }

  async buscarPorId(id) {
    if (!id || isNaN(id)) {
      throw { status: 400, mensagem: 'ID inválido' };
    }
    const mov = await movimentacaoRepo.buscarPorId(id);
    if (!mov) {
      throw { status: 404, mensagem: 'Movimentação não encontrada' };
    }
    return { sucesso: true, dados: mov };
  }

  async historicoPorProduto(id_produto) {
    if (!id_produto || isNaN(id_produto)) {
      throw { status: 400, mensagem: 'id_produto inválido' };
    }
    const produto = await produtoRepo.buscarPorId(id_produto);
    if (!produto) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }
    const dados = await movimentacaoRepo.buscarPorProduto(id_produto);
    return { sucesso: true, dados, total: dados.length };
  }

  async registrar({ id_produto, id_funcionario, tipo, quantidade, motivo }) {
    // Validações
    if (!id_produto || isNaN(id_produto)) {
      throw { status: 400, mensagem: 'id_produto é obrigatório' };
    }
    if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
      throw { status: 400, mensagem: `Tipo inválido. Use: ${TIPOS_VALIDOS.join(', ')}` };
    }
    if (!quantidade || isNaN(quantidade) || quantidade <= 0) {
      throw { status: 400, mensagem: 'quantidade deve ser um inteiro positivo' };
    }
    if (!Number.isInteger(Number(quantidade))) {
      throw { status: 400, mensagem: 'quantidade deve ser um número inteiro' };
    }

    const produto = await produtoRepo.buscarPorId(id_produto);
    if (!produto) {
      throw { status: 404, mensagem: 'Produto não encontrado' };
    }

    const estoque = await estoqueRepo.buscarPorProduto(id_produto);
    if (!estoque) {
      throw {
        status: 404,
        mensagem: 'Registro de estoque não encontrado. Cadastre o estoque inicial antes de movimentar.'
      };
    }

    // Saída não pode deixar negativo
    if (tipo === 'saida' && estoque.quantidade < quantidade) {
      throw {
        status: 400,
        mensagem: `Estoque insuficiente para "${produto.nome}". ` +
                  `Disponível: ${estoque.quantidade}, solicitado: ${quantidade}`
      };
    }

    // Calcula delta e quantidade a gravar no histórico
    const delta = tipo === 'entrada'
      ? +Number(quantidade)
      : tipo === 'saida'
        ? -Number(quantidade)
        : Number(quantidade) - estoque.quantidade; // ajuste: novo valor absoluto

    const qtdRegistro = tipo === 'ajuste' ? Math.abs(delta) : Number(quantidade);

    if (tipo === 'ajuste' && delta === 0) {
      return { sucesso: true, mensagem: 'Estoque já está na quantidade informada. Nenhuma alteração feita.' };
    }

    const connection = await movimentacaoRepo.getConnection();
    try {
      await connection.beginTransaction();

      // Atualiza tabela estoque
      if (tipo === 'ajuste') {
        await connection.query(
          'UPDATE estoque SET quantidade = ? WHERE id_produto = ?',
          [Number(quantidade), id_produto]
        );
      } else {
        await connection.query(
          'UPDATE estoque SET quantidade = quantidade + ? WHERE id_produto = ?',
          [delta, id_produto]
        );
      }

      // Grava no histórico
      await movimentacaoRepo.registrar(
        { id_produto, id_funcionario, tipo, quantidade: qtdRegistro, motivo },
        connection
      );

      await connection.commit();

      const estoqueAtualizado = await estoqueRepo.buscarPorProduto(id_produto);
      return {
        sucesso: true,
        mensagem: `Movimentação de ${tipo} registrada com sucesso`,
        dados: {
          produto: produto.nome,
          tipo,
          quantidade: qtdRegistro,
          quantidade_atual: estoqueAtualizado.quantidade
        }
      };
    } catch (err) {
      await connection.rollback();
      throw { status: 500, mensagem: 'Erro ao registrar movimentação: ' + (err.message || err.mensagem) };
    } finally {
      connection.release();
    }
  }
}

module.exports = new MovimentacaoEstoqueService();
