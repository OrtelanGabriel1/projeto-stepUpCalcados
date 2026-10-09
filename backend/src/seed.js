// backend/src/seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function runSeed() {
  try {
    // Verificar se já existe o administrador
    const [rows] = await pool.query(
      'SELECT id FROM funcionarios WHERE email = ?',
      ['admin@stepup.com']
    );

    if (rows.length > 0) {
      console.log('Seed já executado anteriormente.');
      return;
    }

    // Hashear a senha "admin123" com 10 salt rounds
    const senhaHash = await bcrypt.hash('admin123', 10);

    // Inserir o funcionário administrador
    await pool.query(
      `INSERT INTO funcionarios (nome, email, senha, tipo_funcionario, ativo)
       VALUES (?, ?, ?, ?, ?)`,
      ['Administrador', 'admin@stepup.com', senhaHash, 'admin', true]
    );

    console.log('Funcionário administrador cadastrado com sucesso!');
  } catch (error) {
    console.error('Erro ao executar o seed:', error.message || error);
  } finally {
    await pool.end();
  }
}

runSeed();