import api from './api';

const authService = {
  /**
   * Realiza o login do funcionário enviando as credenciais para a API.
   * 
   * @param {string} email - E-mail do funcionário.
   * @param {string} senha - Senha do funcionário.
   * @returns {Promise<Object>} Retorna response.data com a estrutura { sucesso, token, funcionario, mensagem }
   */
  login: async (email, senha) => {
    const response = await api.post('/auth/login', { email, senha });
    return response.data;
  }
};

export default authService;