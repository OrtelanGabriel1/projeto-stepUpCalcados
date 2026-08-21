const pool = require('../config/database');

class HistoricoPrecoRepository {
  async buscarTodos() {
    const [rows] = await pool.query(`
      SELECT hp.*, p.nome AS nome_produto
      FROM historico_preco hp
      INNER JOIN produto p ON hp.id_produto = p.id_produto
      ORDER BY hp.data_alteracao DESC
    `);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT hp.*, p.nome AS nome_produto
       FROM historico_preco hp
       INNER JOIN produto p ON hp.id_produto = p.id_produto
       WHERE hp.id_historico = ?`,
      [id]
    );
    return rows[0];
  }

  async buscarPorProduto(id_produto) {
    const [rows] = await pool.query(
      `SELECT hp.*
       FROM historico_preco hp
       WHERE hp.id_produto = ?
       ORDER BY hp.data_alteracao DESC`,
      [id_produto]
    );
    return rows;
  }

  async criar(historico) {
    const { id_produto, preco_anterior, preco_novo } = historico;
    const [result] = await pool.query(
      `INSERT INTO historico_preco (id_produto, preco_anterior, preco_novo)
       VALUES (?, ?, ?)`,
      [id_produto, preco_anterior, preco_novo]
    );
    return { id_historico: result.insertId, ...historico };
  }
}

module.exports = new HistoricoPrecoRepository();
