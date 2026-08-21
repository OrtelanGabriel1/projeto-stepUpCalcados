const pool = require('../config/database');

class ProdutoRepository {
  async buscarTodos() {
    const [rows] = await pool.query(`
      SELECT p.*, c.nome AS nome_categoria
      FROM produto p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.ativo = 1
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
    const { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria, marca } = produto;
    const [result] = await pool.query(
      `INSERT INTO produto (nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria, marca)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, descricao || null, preco_venda, preco_custo, tamanho, cor, genero || null, id_categoria || null, marca || null]
    );
    return { id_produto: result.insertId, ...produto };
  }

  async atualizar(id, produto) {
    const { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id_categoria, marca } = produto;
    const [result] = await pool.query(
      `UPDATE produto
       SET nome = ?, descricao = ?, preco_venda = ?, preco_custo = ?,
           tamanho = ?, cor = ?, genero = ?, id_categoria = ?, marca = ?
       WHERE id_produto = ?`,
      [nome, descricao || null, preco_venda, preco_custo, tamanho, cor, genero || null, id_categoria || null, marca || null, id]
    );
    return result.affectedRows > 0;
  }

  async deletar(id) {
    // Soft delete - mantém histórico
    const [result] = await pool.query(
      'UPDATE produto SET ativo = 0 WHERE id_produto = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ProdutoRepository();
