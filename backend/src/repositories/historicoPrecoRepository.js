const pool = require('../config/database');

class HistoricoPrecoRepository {
  async buscarTodos() {
    const [rows] = await pool.query(`
      SELECT hp.*, p.nome AS nome_produto,
             f.nome AS nome_funcionario
      FROM historico_preco hp
      INNER JOIN produto p ON hp.id_produto = p.id_produto
      LEFT JOIN funcionario f ON hp.id_funcionario = f.id_funcionario
      ORDER BY hp.data_alteracao DESC
    `);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT hp.*, p.nome AS nome_produto,
              f.nome AS nome_funcionario
       FROM historico_preco hp
       INNER JOIN produto p ON hp.id_produto = p.id_produto
       LEFT JOIN funcionario f ON hp.id_funcionario = f.id_funcionario
       WHERE hp.id_historico = ?`,
      [id]
    );
    return rows[0];
  }

  async buscarPorProduto(id_produto) {
    const [rows] = await pool.query(
      `SELECT hp.*, f.nome AS nome_funcionario
       FROM historico_preco hp
       LEFT JOIN funcionario f ON hp.id_funcionario = f.id_funcionario
       WHERE hp.id_produto = ?
       ORDER BY hp.data_alteracao DESC`,
      [id_produto]
    );
    return rows;
  }

  async criar(historico) {
    const {
      id_produto, preco_venda_ant, preco_custo_ant,
      preco_venda_novo, preco_custo_novo, id_funcionario, motivo
    } = historico;
    const [result] = await pool.query(
      `INSERT INTO historico_preco
        (id_produto, preco_venda_ant, preco_custo_ant, preco_venda_novo, preco_custo_novo, id_funcionario, motivo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_produto, preco_venda_ant, preco_custo_ant, preco_venda_novo, preco_custo_novo, id_funcionario || null, motivo || null]
    );
    return { id_historico: result.insertId, ...historico };
  }
}

module.exports = new HistoricoPrecoRepository();
