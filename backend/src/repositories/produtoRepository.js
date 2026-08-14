const pool = require('../config/database');

class ProdutoRepository {
  // Busca todos os produtos cadastrados
  async buscarTodos() {
    const [rows] = await pool.query('SELECT * FROM produto');
    return rows;
  }

  // Busca um produto específico pelo id
  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT * FROM produto WHERE id_produto = ?',
      [id]
    );
    return rows[0];
  }

  // Cria um novo produto
  async criar(produto) {
    const { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero } = produto;
    const [result] = await pool.query(
      'INSERT INTO produto (nome, descricao, preco_venda, preco_custo, tamanho, cor, genero) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nome, descricao, preco_venda, preco_custo, tamanho, cor, genero]
    );
    return { id_produto: result.insertId, ...produto };
  }

  // Atualiza um produto existente
  async atualizar(id, produto) {
    const { nome, descricao, preco_venda, preco_custo, tamanho, cor, genero } = produto;
    const [result] = await pool.query(
      'UPDATE produto SET nome = ?, descricao = ?, preco_venda = ?, preco_custo = ?, tamanho = ?, cor = ?, genero = ? WHERE id_produto = ?',
      [nome, descricao, preco_venda, preco_custo, tamanho, cor, genero, id]
    );
    return result.affectedRows > 0;
  }

  // Remove um produto pelo id
  async deletar(id) {
    const [result] = await pool.query(
      'DELETE FROM produto WHERE id_produto = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new ProdutoRepository();