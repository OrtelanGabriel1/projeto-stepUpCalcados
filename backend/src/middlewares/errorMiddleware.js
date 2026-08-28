// Middleware de tratamento de erros global
// Deve ser registrado no app.js APÓS todas as rotas

/**
 * Handler de rota não encontrada (404)
 * Intercepta qualquer requisição que não casou com nenhuma rota registrada.
 */
const notFound = (req, res, next) => {
  const erro = new Error(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  erro.status = 404;
  next(erro); // repassa pro errorHandler abaixo
};

/**
 * Handler global de erros (4 parâmetros = middleware de erro no Express)
 * Centraliza a resposta de erro e evita repetir try/catch em cada controller.
 *
 * Para usá-lo nos controllers, basta lançar um objeto com `status` e `mensagem`:
 *   const erro = new Error('Produto não encontrado');
 *   erro.status = 404;
 *   erro.mensagem = 'Produto não encontrado';
 *   throw erro;   // ou next(erro) se estiver num callback assíncrono
 */
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const mensagem = err.mensagem || err.message || 'Erro interno do servidor';

  // Log no servidor (visível nos logs do processo, não exposto ao cliente)
  if (status >= 500) {
    console.error(`[ERRO ${status}] ${req.method} ${req.originalUrl} —`, err);
  }

  res.status(status).json({
    sucesso: false,
    mensagem,
  });
};

module.exports = { notFound, errorHandler };
