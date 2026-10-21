const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ sucesso: false, mensagem: 'Token não fornecido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.funcionario = payload;
    next();
  } catch (err) {
    const mensagem = err.name === 'TokenExpiredError'
      ? 'Token expirado'
      : 'Token inválido';
    return res.status(401).json({ sucesso: false, mensagem });
  }
};


const autorizar = (...tiposPermitidos) => {
  const permitidos = tiposPermitidos.map((t) => t.toLowerCase());

  return (req, res, next) => {
    const tipo = String(req.funcionario?.tipo || '').toLowerCase();

    if (!permitidos.includes(tipo)) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Acesso negado. Apenas vendedores e gerentes podem realizar esta ação',
      });
    }
    next();
  };
};

module.exports = { autenticar, autorizar };