const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors())
app.use(express.json());

// Registro de todas as rotas da API centralizadas
const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produto', produtoRoutes);

const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionario', funcionarioRoutes);

module.exports = app;