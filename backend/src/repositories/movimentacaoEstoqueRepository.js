const pool = require('../config/database');

class MovimentacaoEstoqueRepository {
  async buscarTodos({ id_produto, tipo, limit = 100, offset = 0 } = {}) {
    const filtros = [];
    const params  = [];

    if (id_produto) { filtros.push('m.id_produto = ?'); params.push(id_produto); }
    if (tipo)       { filtros.push('m.tipo = ?');       params.push(tipo); }

    const where = filtros.length ? 'WHERE ' + filtros.join(' AND ') : '';

    const [rows] = await pool.query(
      `SELECT m.*,
              p.nome AS nome_produto,
              f.nome AS nome_funcionario
         FROM movimentacao_estoque m
         INNER JOIN produto     p ON p.id_produto     = m.id_produto
         LEFT  JOIN funcionario f ON f.id_funcionario = m.id_funcionario
         ${where}
         ORDER BY m.data_movimentacao DESC
         LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    return rows;
  }

  async buscarPorId(id) {
    const [rows] = await pool.query(
      `SELECT m.*,
              p.nome AS nome_produto,
              f.nome AS nome_funcionario
         FROM movimentacao_estoque m
         INNER JOIN produto     p ON p.id_produto     = m.id_produto
         LEFT  JOIN funcionario f ON f.id_funcionario = m.id_funcionario
        WHERE m.id_movimentacao = ?`,
      [id]
    );
    return rows[0];
  }

  async buscarPorProduto(id_produto) {
    return this.buscarTodos({ id_produto });
  }

  async registrar(movimentacao, connection) {
    const { id_produto, id_funcionario, tipo, quantidade, motivo } = movimentacao;
    const conn = connection || pool;
    const [result] = await conn.query(
      `INSERT INTO movimentacao_estoque
         (id_produto, id_funcionario, tipo, quantidade, motivo)
       VALUES (?, ?, ?, ?, ?)`,
      [id_produto, id_funcionario ?? null, tipo, quantidade, motivo ?? null]
    );
    return result.insertId;
  }

  async getConnection() {
    return pool.getConnection();
  }
}

module.exports = new MovimentacaoEstoqueRepository();
