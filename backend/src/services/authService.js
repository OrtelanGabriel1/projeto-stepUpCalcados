
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const funcionarioRepository = require('../repositories/funcionarioRepository');

const SALT_ROUNDS = 10;

class AuthService {
  async login(email, senha) {
    if (!email || !senha) {
      throw {
        status: 400,
        mensagem: 'Email e senha são obrigatórios'
      };
    }

    const funcionario = await funcionarioRepository.buscarPorEmail(email);

    if (!funcionario) {
      throw {
        status: 401,
        mensagem: 'Credenciais inválidas'
      };
    }

    const senhaCorreta = await bcrypt.compare(
      senha,
      funcionario.senha
    );

    if (!senhaCorreta) {
      throw {
        status: 401,
        mensagem: 'Credenciais inválidas'
      };
    }

    // Senhas antigas com menos de 6 caracteres exigem atualização.
    const senhaPrecisaAtualizar = senha.length < 6;

    const payload = {
      id: funcionario.id_funcionario,
      email: funcionario.email,
      tipo: funcionario.tipo_funcionario,
      senhaPrecisaAtualizar
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    );

    return {
      sucesso: true,
      token,
      senhaPrecisaAtualizar,
      funcionario: {
        id_funcionario: funcionario.id_funcionario,
        nome: funcionario.nome,
        email: funcionario.email,
        tipo_funcionario: funcionario.tipo_funcionario,
        senhaPrecisaAtualizar
      }
    };
  }

  async register(dados) {
    const { nome, email, senha, tipo_funcionario } = dados;

    if (!nome || !email || !senha || !tipo_funcionario) {
      throw {
        status: 400,
        mensagem: 'Todos os campos são obrigatórios'
      };
    }

    if (senha.length < 6) {
      throw {
        status: 400,
        mensagem: 'A senha deve ter pelo menos 6 caracteres'
      };
    }

    const jaExiste = await funcionarioRepository.buscarPorEmail(email);

    if (jaExiste) {
      throw {
        status: 400,
        mensagem: 'Já existe um funcionário registrado com este e-mail'
      };
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const novoFuncionario = await funcionarioRepository.criar({
      nome,
      email,
      senha: senhaHash,
      tipo_funcionario
    });

    return {
      sucesso: true,
      mensagem: 'Cadastro realizado com sucesso',
      dados: novoFuncionario
    };
  }

  async alterarSenha(id, senha) {
    if (!senha || senha.length < 6) {
      throw {
        status: 400,
        mensagem: 'A nova senha deve ter pelo menos 6 caracteres'
      };
    }

    const funcionarioExistente =
      await funcionarioRepository.buscarPorId(id);

    if (!funcionarioExistente) {
      throw {
        status: 404,
        mensagem: 'Funcionário não encontrado'
      };
    }

    const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

    const atualizado = await funcionarioRepository.atualizarSenha(
      id,
      senhaHash
    );

    if (!atualizado) {
      throw {
        status: 500,
        mensagem: 'Não foi possível atualizar a senha no banco de dados'
      };
    }

    // Gera um novo token sem o bloqueio de atualização de senha.
    const token = jwt.sign(
      {
        id: funcionarioExistente.id_funcionario,
        email: funcionarioExistente.email,
        tipo: funcionarioExistente.tipo_funcionario,
        senhaPrecisaAtualizar: false
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    );

    return {
      sucesso: true,
      mensagem: 'Senha alterada com sucesso',
      token
    };
  }
}

module.exports = new AuthService();
