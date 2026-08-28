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

module.exports = { autenticar };
