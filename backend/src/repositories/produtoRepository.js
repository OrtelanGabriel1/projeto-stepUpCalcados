const pool = require('../config/database');

// Busca todos os produtos cadastrados
async function buscarTodos() {
    const [rows] = await pool.query('SELECT * FROM produto');
    return rows;
}

// Busca um produto específico pelo id
async function buscarPorId(id) {
    const [rows] = await pool.query('SELECT * FROM produto WHERE id_produto = ?', [id]);
    return rows[0]; // retorna só o objeto, não o array, já que é um único produto
}

// Cria um novo produto
async function criar(produto) {
    const [result] = await pool.query(
        'INSERT INTO produto (nome, descricao, preco_venda, preco_custo, tamanho, cor, genero) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
            produto.nome,
            produto.descricao,
            produto.preco_venda,
            produto.preco_custo,
            produto.tamanho,
            produto.cor,
            produto.genero
        ]
    );

    return result.insertId;
}

async function atualizar(id, produto) {
    const [result] = await pool.query(
        'UPDATE produto SET nome = ?, descricao = ?, preco_venda = ?, preco_custo = ?, tamanho = ?, cor = ?, genero = ? WHERE id_produto = ?',
        [
            produto.nome,
            produto.descricao,
            produto.preco_venda,
            produto.preco_custo,
            produto.tamanho,
            produto.cor,
            produto.genero,
            id
        ]
    );

    return result.affectedRows;
}

async function deletar(id) {
    const [result] = await pool.query(
        'DELETE FROM produto WHERE id_produto = ?',
        [id]
    );

    return result.affectedRows;
}

module.exports = {
    buscarTodos,
    buscarPorId,
    criar,
    atualizar,
    deletar
    
};