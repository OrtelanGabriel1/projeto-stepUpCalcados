const pool = require('../config/database');

class FuncionarioRepository {
  async buscarTodos() {
    const [rows] = await pool.query('SELECT * FROM funcionario');
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT * FROM funcionario WHERE id_funcionario = ?',
      [id]
    );
    return rows[0];
  }

  async criar(funcionario) {
    const { nome, email, senha, tipo_funcionario } = funcionario;
    const [result] = await pool.query(
      'INSERT INTO funcionario (nome, email, senha, tipo_funcionario) VALUES (?, ?, ?, ?)',
      [nome, email, senha, tipo_funcionario]
    );
    return { id_funcionario: result.insertId, ...funcionario };
  }

  async atualizar(id, funcionario) {
    const { nome, email, senha, tipo_funcionario } = funcionario;
    const [result] = await pool.query(
      'UPDATE funcionario SET nome = ?, email = ?, senha = ?, tipo_funcionario = ? WHERE id_funcionario = ?',
      [nome, email, senha, tipo_funcionario, id]
    );
    return result.affectedRows > 0;
  }

  async deletar(id) {
    const [result] = await pool.query(
      'DELETE FROM funcionario WHERE id_funcionario = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new FuncionarioRepository();