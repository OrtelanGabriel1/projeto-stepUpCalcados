const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const funcionarioRepository = require('../repositories/funcionarioRepository');

const SALT_ROUNDS = 10;

class AuthService {
  async login(email, senha) {
    if (!email || !senha) {
      throw { status: 400, mensagem: 'Email e senha são obrigatórios' };
    }

    const funcionario = await funcionarioRepository.buscarPorEmail(email);
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

  async register(dados) {
    const { nome, email, senha, tipo_funcionario } = dados;

    if (!nome || !email || !senha || !tipo_funcionario) {
      throw { status: 400, mensagem: 'Todos os campos são obrigatórios' };
    }

    const jaExiste = await funcionarioRepository.buscarPorEmail(email);
    if (jaExiste) {
      throw { status: 400, mensagem: 'Já existe um funcionário registado com este e-mail' };
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
    const novoFuncionario = await funcionarioRepository.criar({
      nome,
      email,
      senha: senhaHash,
      tipo_funcionario,
    });

    return {
      sucesso: true,
      mensagem: 'Registo efetuado com sucesso',
      dados: novoFuncionario,
    };
  }
}

module.exports = new AuthService();