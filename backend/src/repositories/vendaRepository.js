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
    const {
      id_funcionario,
      forma_pagamento,
      valor_total,
      nome_comprador,
      cnpj,
      endereco,
      data_pedido,
      data_entrega_prevista,
      status_pagamento,
      status_entrega,
    } = venda;
    const conn = connection || pool;
    const [result] = await conn.query(
      `INSERT INTO venda (id_funcionario, forma_pagamento, valor_total, nome_comprador, cnpj, endereco, data_pedido, data_entrega_prevista, status_pagamento, status_entrega)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id_funcionario,
        forma_pagamento,
        valor_total,
        nome_comprador || null,
        cnpj || null,
        endereco || null,
        data_pedido || null,
        data_entrega_prevista || null,
        status_pagamento || 'pendente',
        status_entrega || 'pendente',
      ]
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

  async atualizarStatus(id, dados, connection) {
    const conn = connection || pool;
    const campos = [];
    const valores = [];
    if (dados.status_pagamento !== undefined) {
      campos.push('status_pagamento = ?');
      valores.push(dados.status_pagamento);
    }
    if (dados.status_entrega !== undefined) {
      campos.push('status_entrega = ?');
      valores.push(dados.status_entrega);
    }
    if (campos.length === 0) return false;
    valores.push(id);
    const [result] = await conn.query(
      `UPDATE venda SET ${campos.join(', ')} WHERE id_venda = ?`,
      valores
    );
    return result.affectedRows > 0;
  }
  async getConnection() {
    return pool.getConnection();
  }
}

module.exports = new VendaRepository();
