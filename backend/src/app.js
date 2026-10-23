
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const {
  notFound,
  errorHandler
} = require('./middlewares/errorMiddleware');

const {
  autenticar,
  exigirSenhaAtualizada
} = require('./middlewares/authMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas e de autenticação.
const authRoutes = require('./routes/authRoutes');

app.use('/auth', authRoutes);

// Todas as rotas seguintes exigem token válido.
app.use(autenticar);

// Bloqueia as rotas protegidas até a troca de uma senha curta.
// A rota /auth/alterar-senha continua acessível.
app.use(exigirSenhaAtualizada);

const produtoRoutes = require('./routes/produtoRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');
const categoriaRoutes = require('./routes/categoriaRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const historicoPrecoRoutes = require('./routes/historicoPrecoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const movimentacaoEstoqueRoutes = require('./routes/movimentacaoEstoqueRoutes');

app.use('/produto', produtoRoutes);
app.use('/funcionario', funcionarioRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/estoque', estoqueRoutes);
app.use('/historico-preco', historicoPrecoRoutes);
app.use('/venda', vendaRoutes);
app.use('/movimentacao-estoque', movimentacaoEstoqueRoutes);

// Tratamento de erros após as rotas.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
