
import api from './api';

const authService = {
  login: async (email, senha) => {
    const response = await api.post('/auth/login', {
      email,
      senha
    });

    return response.data;
  },

  register: async (dados) => {
    const response = await api.post('/auth/register', dados);

    return response.data;
  },

  alterarSenha: async (novaSenha) => {
    const response = await api.put('/auth/alterar-senha', {
      senha: novaSenha
    });

    return response.data;
  }
};

export default authService;
