const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const funcionarioRepository = require('../repositories/funcionarioRepository');

class AuthService {
  async login(email, senha) {
    if (!email || !senha) {
      throw { status: 400, mensagem: 'Email e senha são obrigatórios' };
    }

    const funcionario = await funcionarioRepository.buscarPorEmail(email);

    // Mensagem genérica para não revelar se o email existe
    const errCredenciais = { status: 401, mensagem: 'Credenciais inválidas' };

    if (!funcionario) {
      throw errCredenciais;
    }

    const senhaCorreta = await bcrypt.compare(senha, funcionario.senha);
    if (!senhaCorreta) {
      throw errCredenciais;
    }

    const payload = {
      id: funcionario.id_funcionario,
      email: funcionario.email,
      tipo: funcionario.tipo_funcionario,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    return {
      sucesso: true,
      token,
      funcionario: {
        id_funcionario: funcionario.id_funcionario,
        nome: funcionario.nome,
        email: funcionario.email,
        tipo_funcionario: funcionario.tipo_funcionario,
      },
    };
  }
}

module.exports = new AuthService();
