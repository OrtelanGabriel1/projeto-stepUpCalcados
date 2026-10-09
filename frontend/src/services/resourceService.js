import api from './api';

/**
 * Cria um serviço genérico para rotas CRUD de um recurso da API.
 * 
 * @param {string} endpoint - Nome do endpoint do recurso (ex: 'produtos', 'vendas', 'clientes')
 * @returns {Object} Objeto com os métodos CRUD e ações customizadas
 */
export const createResourceService = (endpoint) => {
  return {
    /**
     * Lista todos os registros do recurso.
     * GET /{endpoint}
     */
    listar: async () => {
      const response = await api.get(`/${endpoint}`);
      return response.data;
    },

    /**
     * Busca um recurso específico pelo ID.
     * GET /{endpoint}/{id}
     */
    buscarPorId: async (id) => {
      const response = await api.get(`/${endpoint}/${id}`);
      return response.data;
    },

    /**
     * Cria um novo registro do recurso.
     * POST /{endpoint}
     */
    criar: async (dados) => {
      const response = await api.post(`/${endpoint}`, dados);
      return response.data;
    },

    /**
     * Atualiza um registro existente pelo ID.
     * PUT /{endpoint}/{id}
     */
    atualizar: async (id, dados) => {
      const response = await api.put(`/${endpoint}/${id}`, dados);
      return response.data;
    },

    /**
     * Remove um registro pelo ID.
     * DELETE /{endpoint}/{id}
     */
    deletar: async (id) => {
      const response = await api.delete(`/${endpoint}/${id}`);
      return response.data;
    },

    /**
     * Executa uma ação em uma sub-rota do recurso (ex: cancelar venda).
     * {metodo} /{endpoint}/{id}/{subrota}
     * 
     * @param {string|number} id - ID do recurso
     * @param {string} subrota - Sub-rota da ação (ex: 'cancelar')
     * @param {string} metodo - Método HTTP (padrão: 'patch')
     * @param {Object} dados - Corpo da requisição (se houver)
     */
    acao: async (id, subrota, metodo = 'patch', dados = {}) => {
      const response = await api({
        method: metodo.toLowerCase(),
        url: `/${endpoint}/${id}/${subrota}`,
        data: dados
      });
      return response.data;
    }
  };
};

export default createResourceService;