const pool = require('../config/database');

class FuncionarioRepository {
  async buscarTodos() {
    const [rows] = await pool.query(
      'SELECT id_funcionario, nome, email, tipo_funcionario, ativo FROM funcionario WHERE ativo = true'
    );
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      'SELECT id_funcionario, nome, email, tipo_funcionario, ativo FROM funcionario WHERE id_funcionario = ? AND ativo = true',
      [id]
    );
    return rows[0];
  }

  async buscarPorEmail(email) {
    const [rows] = await pool.query(
      'SELECT id_funcionario, nome, email, senha, tipo_funcionario, ativo FROM funcionario WHERE email = ? AND ativo = true',
      [email]
    );
    return rows[0];
  }

  async criar(funcionario) {
    const { nome, email, senha, tipo_funcionario } = funcionario;
    const [result] = await pool.query(
      'INSERT INTO funcionario (nome, email, senha, tipo_funcionario) VALUES (?, ?, ?, ?)',
      [nome, email, senha, tipo_funcionario]
    );
    return { id_funcionario: result.insertId, nome, email, tipo_funcionario };
  }

  async atualizar(id, funcionario) {
    const { nome, email, senha, tipo_funcionario } = funcionario;
    const [result] = await pool.query(
      'UPDATE funcionario SET nome = ?, email = ?, senha = ?, tipo_funcionario = ? WHERE id_funcionario = ? AND ativo = true',
      [nome, email, senha, tipo_funcionario, id]
    );
    return result.affectedRows > 0;
  }

  async desativar(id) {
    const [result] = await pool.query(
      'UPDATE funcionario SET ativo = false WHERE id_funcionario = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async temVendas(id) {
    const [rows] = await pool.query(
      'SELECT 1 FROM venda WHERE id_funcionario = ? LIMIT 1',
      [id]
    );
    return rows.length > 0;
  }
}

module.exports = new FuncionarioRepository();
