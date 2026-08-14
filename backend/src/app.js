const express = require('express');
const app = express();

app.use(express.json());

// Registro de todas as rotas da API centralizadas
const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produto', produtoRoutes);

module.exports = app;