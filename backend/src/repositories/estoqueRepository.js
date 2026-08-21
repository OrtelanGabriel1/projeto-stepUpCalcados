const pool = require('../config/database');

class EstoqueRepository {
  async buscarTodos() {
    const [rows] = await pool.query(`
      SELECT e.*, p.nome AS nome_produto, p.tamanho, p.cor, p.genero
      FROM estoque e
      INNER JOIN produto p ON e.id_produto = p.id_produto
      ORDER BY p.nome
    `);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT e.*, p.nome AS nome_produto, p.tamanho, p.cor, p.genero
       FROM estoque e
       INNER JOIN produto p ON e.id_produto = p.id_produto
       WHERE e.id_estoque = ?`,
      [id]
    );
    return rows[0];
  }

  async buscarPorProduto(id_produto) {
    const [rows] = await pool.query(
      'SELECT * FROM estoque WHERE id_produto = ?',
      [id_produto]
    );
    return rows[0];
  }

  async buscarEstoqueBaixo() {
    const [rows] = await pool.query(`
      SELECT e.*, p.nome AS nome_produto, p.tamanho, p.cor
      FROM estoque e
      INNER JOIN produto p ON e.id_produto = p.id_produto
      WHERE e.quantidade <= e.quantidade_minima
      ORDER BY e.quantidade ASC
    `);
    return rows;
  }

  async criar(estoque) {
    const { id_produto, quantidade, quantidade_minima } = estoque;
    const [result] = await pool.query(
      'INSERT INTO estoque (id_produto, quantidade, quantidade_minima) VALUES (?, ?, ?)',
      [id_produto, quantidade, quantidade_minima ?? 5]
    );
    return { id_estoque: result.insertId, ...estoque };
  }

  async atualizar(id, estoque) {
    const { quantidade, quantidade_minima } = estoque;
    const [result] = await pool.query(
      'UPDATE estoque SET quantidade = ?, quantidade_minima = ? WHERE id_estoque = ?',
      [quantidade, quantidade_minima, id]
    );
    return result.affectedRows > 0;
  }

  async ajustarQuantidade(id_produto, delta) {
    const [result] = await pool.query(
      'UPDATE estoque SET quantidade = quantidade + ? WHERE id_produto = ?',
      [delta, id_produto]
    );
    return result.affectedRows > 0;
  }

  async deletar(id) {
    const [result] = await pool.query(
      'DELETE FROM estoque WHERE id_estoque = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new EstoqueRepository();
