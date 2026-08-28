const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const { autenticar }             = require('./middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Rota pública — não exige token
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// Todas as rotas abaixo exigem token JWT válido
app.use(autenticar);

const produtoRoutes              = require('./routes/produtoRoutes');
const funcionarioRoutes          = require('./routes/funcionarioRoutes');
const categoriaRoutes            = require('./routes/categoriaRoutes');
const estoqueRoutes              = require('./routes/estoqueRoutes');
const historicoPrecoRoutes       = require('./routes/historicoPrecoRoutes');
const vendaRoutes                = require('./routes/vendaRoutes');
const movimentacaoEstoqueRoutes  = require('./routes/movimentacaoEstoqueRoutes');

app.use('/produto',               produtoRoutes);
app.use('/funcionario',           funcionarioRoutes);
app.use('/categoria',             categoriaRoutes);
app.use('/estoque',               estoqueRoutes);
app.use('/historico-preco',       historicoPrecoRoutes);
app.use('/venda',                 vendaRoutes);
app.use('/movimentacao-estoque',  movimentacaoEstoqueRoutes);

// Handlers globais — devem vir APÓS todas as rotas
app.use(notFound);
app.use(errorHandler);

module.exports = app;
