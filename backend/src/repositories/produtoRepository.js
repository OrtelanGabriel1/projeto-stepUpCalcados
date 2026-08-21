const pool = require('../config/database');

class ProdutoRepository {
  async buscarTodos() {
    const [rows] = await pool.query(`
      SELECT p.*, c.nome AS nome_categoria
      FROM produto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      ORDER BY p.nome
    `);
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT p.*, c.nome AS nome_categoria
       FROM produto p
       LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
       WHERE p.id_produto = ?`,
      [id]
    );
    return rows[0];
  }

  async criar(produto) {
    const { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria } = produto;
    const [result] = await pool.query(
      `INSERT INTO produto (nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao || null, preco_venda, preco_custo, tamanho, cor, genero || null, id_categoria || null]
    );
    return { id_produto: result.insertId, ...produto };
  }

  async atualizar(id, produto) {
    const { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria } = produto;
    const [result] = await pool.query(
      `UPDATE produto
       SET nome = ?, descricao = ?, preco_venda = ?, preco_custo = ?,
           tamanho = ?, cor = ?, genero = ?, id_categoria = ?
       WHERE id_produto = ?`,
      [nome, descricao || null, preco_venda, preco_custo, tamanho, cor, genero || null, id_categoria || null, id]
    );
    return result.affectedRows > 0;
  }

  async deletar(id) {
    const [result] = await pool.query(
      'DELETE FROM produto WHERE id_produto = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ProdutoRepository();
