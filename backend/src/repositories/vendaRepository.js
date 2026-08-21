const pool = require('../config/database');

class VendaRepository {
  async buscarTodos() {
    const [rows] = await pool.query(`
      SELECT v.*, f.nome AS nome_funcionario
      FROM venda v
      LEFT JOIN funcionario f ON v.id_funcionario = f.id_funcionario
      ORDER BY v.data_venda DESC
    `);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT v.*, f.nome AS nome_funcionario
       FROM venda v
       LEFT JOIN funcionario f ON v.id_funcionario = f.id_funcionario
       WHERE v.id_venda = ?`,
      [id]
    );
    return rows[0];
  }

  async buscarItensDaVenda(id_venda) {
    const [rows] = await pool.query(
      `SELECT iv.*, p.nome AS nome_produto, p.tamanho, p.cor
       FROM item_venda iv
       INNER JOIN produto p ON iv.id_produto = p.id_produto
       WHERE iv.id_venda = ?`,
      [id_venda]
    );
    return rows;
  }

  async criar(venda, connection) {
    const { id_funcionario, forma_pagamento, valor_total } = venda;
    const conn = connection || pool;
    const [result] = await conn.query(
      `INSERT INTO venda (id_funcionario, forma_pagamento, valor_total)
       VALUES (?, ?, ?)`,
      [id_funcionario, forma_pagamento, valor_total]
    );
    return result.insertId;
  }

  async inserirItem(id_venda, item, connection) {
    const { id_produto, quantidade, preco_unitario } = item;
    const subtotal = quantidade * preco_unitario;
    const conn = connection || pool;
    const [result] = await conn.query(
      `INSERT INTO item_venda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [id_venda, id_produto, quantidade, preco_unitario, subtotal]
    );
    return result.insertId;
  }

  async deletar(id, connection) {
    const conn = connection || pool;
    const [result] = await conn.query(
      'DELETE FROM venda WHERE id_venda = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async getConnection() {
    return pool.getConnection();
  }
}

module.exports = new VendaRepository();
