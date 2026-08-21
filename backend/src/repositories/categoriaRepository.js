const pool = require('../config/database');

class CategoriaRepository {
  async buscarTodos() {
    const [rows] = await pool.query('SELECT * FROM categoria ORDER BY nome');
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT * FROM categoria WHERE id_categoria = ?',
      [id]
    );
    return rows[0];
  }

  async buscarPorNome(nome) {
    const [rows] = await pool.query(
      'SELECT * FROM categoria WHERE nome = ?',
      [nome]
    );
    return rows[0];
  }

  async criar(categoria) {
    const { nome, descricao } = categoria;
    const [result] = await pool.query(
      'INSERT INTO categoria (nome, descricao) VALUES (?, ?)',
      [nome, descricao || null]
    );
    return { id_categoria: result.insertId, ...categoria };
  }

  async atualizar(id, categoria) {
    const { nome, descricao } = categoria;
    const [result] = await pool.query(
      'UPDATE categoria SET nome = ?, descricao = ? WHERE id_categoria = ?',
      [nome, descricao || null, id]
    );
    return result.affectedRows > 0;
  }

  async deletar(id) {
    const [result] = await pool.query(
      'DELETE FROM categoria WHERE id_categoria = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new CategoriaRepository();
