const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;
      const resultado = await authService.login(email, senha);
      res.status(200).json(resultado);
    } catch (erro) {
      res.status(erro.status || 500).json({ sucesso: false, mensagem: erro.mensagem || 'Erro interno' });
    }
  }
}

module.exports = new AuthController();
