const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Registro de todas as rotas da API centralizadas
const produtoRoutes = require('./routes/produtoRoutes');
app.use('/produto', produtoRoutes);

const funcionarioRoutes = require('./routes/funcionarioRoutes');
app.use('/funcionario', funcionarioRoutes);

const categoriaRoutes = require('./routes/categoriaRoutes');
app.use('/categoria', categoriaRoutes);

const estoqueRoutes = require('./routes/estoqueRoutes');
app.use('/estoque', estoqueRoutes);

const historicoPrecoRoutes = require('./routes/historicoPrecoRoutes');
app.use('/historico-preco', historicoPrecoRoutes);

const vendaRoutes = require('./routes/vendaRoutes');
app.use('/venda', vendaRoutes);

// Handlers globais — devem vir APÓS todas as rotas
app.use(notFound);
app.use(errorHandler);

module.exports = app;