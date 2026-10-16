import React, { useState, useEffect } from 'react';
import { createResourceService } from '../services/resourceService';
import { formatarData } from '../utils';
import PageHeader from '../components/PageHeader';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

// Inicialização dos serviços da API
const estoqueService = createResourceService('estoque');
const produtoService = createResourceService('produto');

// Estados iniciais dos formulários
const formCadastroInicial = { id_produto: '', quantidade: '' };
const formEdicaoInicial = { quantidade: '' };

export default function Estoque() {
  // Estados de Dados
  const [estoques, setEstoques] = useState([]);
  const [produtos, setProdutos] = useState([]);

  // Estados de Controle de Interface
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [filtroAlertas, setFiltroAlertas] = useState(false);

  // Estados de Modais
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(null); // guarda o objeto de estoque em edição
  const [confirmarDelete, setConfirmarDelete] = useState(null);

  // Estados dos Formulários
  const [formCadastro, setFormCadastro] = useState(formCadastroInicial);
  const [formEdicao, setFormEdicao] = useState(formEdicaoInicial);

  // Estado do Toast de Notificação
  const [toast, setToast] = useState({
    show: false,
    mensagem: '',
    variante: 'success'
  });

  const exibirToast = (mensagem, variante = 'success') => {
    setToast({ show: true, mensagem, variante });
  };

  // Carregar estoques e produtos em paralelo ao montar o componente
  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      const [resEstoques, resProdutos] = await Promise.all([
        estoqueService.listar(),
        produtoService.listar()
      ]);

      if (resEstoques && resEstoques.dados) {
        setEstoques(resEstoques.dados);
      } else if (Array.isArray(resEstoques)) {
        setEstoques(resEstoques);
      }

      if (resProdutos && resProdutos.dados) {
        setProdutos(resProdutos.dados);
      } else if (Array.isArray(resProdutos)) {
        setProdutos(resProdutos);
      }
    } catch (err) {
      const msgErro = err.response?.data?.mensagem || err.message || 'Erro ao carregar os dados de estoque.';
      setErro(msgErro);
      exibirToast(msgErro, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Produtos que ainda NÃO possuem registro na tabela de estoque
  const produtosDisponiveis = produtos.filter(
    (prod) => !estoques.some((est) => Number(est.id_produto) === Number(prod.id_produto))
  );

  // Abertura de Modais
  const handleAbrirModalCadastro = () => {
    setFormCadastro({
      id_produto: produtosDisponiveis.length > 0 ? produtosDisponiveis[0].id_produto : '',
      quantidade: ''
    });
    setModalCadastro(true);
  };

  const handleAbrirModalEdicao = (itemEstoque) => {
    setModalEdicao(itemEstoque);
    setFormEdicao({ quantidade: itemEstoque.quantidade });
  };

  // Salvar Novo Registro de Estoque
  const handleSalvarCadastro = async (e) => {
    e.preventDefault();

    if (!formCadastro.id_produto) {
      exibirToast('Selecione um produto para registrar o estoque.', 'danger');
      return;
    }

    const qtd = parseInt(formCadastro.quantidade, 10);
    if (isNaN(qtd) || qtd < 0) {
      exibirToast('A quantidade deve ser um número maior ou igual a zero.', 'danger');
      return;
    }

    setSalvando(true);
    try {
      await estoqueService.criar({
        id_produto: parseInt(formCadastro.id_produto, 10),
        quantidade: qtd
      });
      exibirToast('Estoque registrado com sucesso!', 'success');
      setModalCadastro(false);
      setFormCadastro(formCadastroInicial);
      await carregarDados();
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao cadastrar estoque.';
      exibirToast(msg, 'danger');
    } finally {
      setSalvando(false);
    }
  };

  // Salvar Atualização de Quantidade
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();

    const qtd = parseInt(formEdicao.quantidade, 10);
    if (isNaN(qtd) || qtd < 0) {
      exibirToast('A quantidade deve ser um número maior ou igual a zero.', 'danger');
      return;
    }

    setSalvando(true);
    try {
      const idEstoque = modalEdicao.id_estoque || modalEdicao.id;
      await estoqueService.atualizar(idEstoque, { quantidade: qtd });
      exibirToast('Quantidade em estoque atualizada com sucesso!', 'success');
      setModalEdicao(null);
      setFormEdicao(formEdicaoInicial);
      await carregarDados();
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao atualizar quantidade em estoque.';
      exibirToast(msg, 'danger');
    } finally {
      setSalvando(false);
    }
  };

  // Deletar Registro de Estoque
  const handleDeletar = async () => {
    if (!confirmarDelete) return;

    setSalvando(true);
    try {
      const idEstoque = confirmarDelete.id_estoque || confirmarDelete.id;
      await estoqueService.deletar(idEstoque);
      exibirToast('Registro de estoque removido com sucesso!', 'success');
      setConfirmarDelete(null);
      await carregarDados();
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao excluir registro de estoque.';
      exibirToast(msg, 'danger');
    } finally {
      setSalvando(false);
    }
  };

  // Helper para formatar a badge de Quantidade
  const renderBadgeQuantidade = (qtd) => {
    const valor = Number(qtd);
    if (valor <= 5) {
      return (
        <span className="badge bg-danger fs-6 px-2 py-1">
          <i className="bi bi-exclamation-circle me-1"></i>
          {valor}
        </span>
      );
    }
    if (valor <= 10) {
      return <span className="badge bg-warning text-dark fs-6 px-2 py-1">{valor}</span>;
    }
    return <span className="badge bg-success fs-6 px-2 py-1">{valor}</span>;
  };

  // Helper para determinar a classe da linha da tabela
  const obterClasseLinha = (qtd) => {
    const valor = Number(qtd);
    if (valor <= 5) return 'table-danger';
    if (valor <= 10) return 'table-warning';
    return '';
  };

  // Lista de estoques filtrada caso o botão "Ver Alertas" esteja ativo
  const estoquesExibidos = filtroAlertas
    ? estoques.filter((item) => Number(item.quantidade) <= 5)
    : estoques;

  return (
    <div className="container-fluid py-3">
      {/* Toast de Notificação */}
      <Toast
        show={toast.show}
        mensagem={toast.mensagem}
        variante={toast.variante}
        onClose={() => setToast((prev) => ({ ...prev, show: false }))}
      />

      {/* Cabeçalho da Página */}
      <PageHeader
        title="Controle de Estoque"
        subtitle="Gerencie as quantidades em estoque de cada produto"
      >
        <div className="d-flex gap-2">
          <button
            className={`btn ${filtroAlertas ? 'btn-warning' : 'btn-outline-warning'} shadow-sm`}
            onClick={() => setFiltroAlertas(!filtroAlertas)}
            title="Filtrar produtos com quantidade ≤ 5"
          >
            <i className="bi bi-exclamation-triangle-fill me-1"></i>
            {filtroAlertas ? 'Exibindo Alertas (≤ 5)' : 'Ver Alertas'}
          </button>
          <button className="btn btn-primary shadow-sm" onClick={handleAbrirModalCadastro}>
            <i className="bi bi-plus-lg me-1"></i> + Registrar Estoque
          </button>
        </div>
      </PageHeader>

      {/* Alerta de Erro de Conexão/API */}
      {erro && (
        <div className="alert alert-danger alert-dismissible fade show my-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {erro}
          <button type="button" className="btn-close" onClick={() => setErro(null)}></button>
        </div>
      )}

      {/* Conteúdo Principal */}
      {loading ? (
        <Loading texto="Carregando informações de estoque..." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            {estoquesExibidos.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-box-seam display-4 d-block mb-3 text-secondary"></i>
                <p className="mb-0">
                  {filtroAlertas
                    ? 'Nenhum produto com alerta de estoque baixo (≤ 5).'
                    : 'Nenhum registro de estoque encontrado.'}
                </p>
                {filtroAlertas && (
                  <button
                    className="btn btn-sm btn-link text-decoration-none mt-2"
                    onClick={() => setFiltroAlertas(false)}
                  >
                    Limpar filtro de alertas
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Produto</th>
                      <th className="text-center">Tam.</th>
                      <th>Cor</th>
                      <th>Gênero</th>
                      <th className="text-center">Qtd.</th>
                      <th>Atualizado em</th>
                      <th className="text-center" style={{ width: '120px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estoquesExibidos.map((item, index) => {
                      const idChave = item.id_estoque || item.id || index;
                      const nomeProd = item.nome_produto || item.nome || 'Produto sem nome';
                      const tamProd = item.tamanho_produto || item.tamanho || '—';
                      const corProd = item.cor_produto || item.cor || '—';
                      const generoProd = item.genero_produto || item.genero || '—';
                      const dataAtualizacao = item.data_atualizacao || item.updated_at || item.createdAt;

                      return (
                        <tr key={idChave} className={obterClasseLinha(item.quantidade)}>
                          <td className="fw-bold">{nomeProd}</td>
                          <td className="text-center fw-semibold">{tamProd}</td>
                          <td>{corProd}</td>
                          <td>
                            <span className="badge bg-secondary">{generoProd}</span>
                          </td>
                          <td className="text-center">{renderBadgeQuantidade(item.quantidade)}</td>
                          <td className="text-muted small">{formatarData(dataAtualizacao)}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              title="Editar Quantidade"
                              onClick={() => handleAbrirModalEdicao(item)}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir Registro"
                              onClick={() => setConfirmarDelete(item)}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de CADASTRO ("Registrar Estoque") */}
      <Modal
        show={modalCadastro}
        title="Registrar Estoque"
        onClose={() => !salvando && setModalCadastro(false)}
      >
        <form onSubmit={handleSalvarCadastro}>
          {produtosDisponiveis.length === 0 ? (
            <div className="alert alert-info mb-3">
              <i className="bi bi-info-circle me-2"></i>
              Todos os produtos cadastrados já possuem registro de estoque.
            </div>
          ) : (
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Produto <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={formCadastro.id_produto}
                onChange={(e) => setFormCadastro({ ...formCadastro, id_produto: e.target.value })}
                required
              >
                {produtosDisponiveis.map((prod) => (
                  <option key={prod.id_produto} value={prod.id_produto}>
                    {prod.nome} — Tam: {prod.tamanho} | Cor: {prod.cor}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Quantidade Inicial <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              min="0"
              placeholder="Ex: 15"
              value={formCadastro.quantidade}
              onChange={(e) => setFormCadastro({ ...formCadastro, quantidade: e.target.value })}
              required
              disabled={produtosDisponiveis.length === 0}
            />
          </div>

          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalCadastro(false)}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={salvando || produtosDisponiveis.length === 0}
            >
              {salvando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Salvando...
                </>
              ) : (
                'Salvar Estoque'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de EDIÇÃO ("Atualizar Quantidade") */}
      <Modal
        show={!!modalEdicao}
        title="Atualizar Quantidade"
        onClose={() => !salvando && setModalEdicao(null)}
      >
        <form onSubmit={handleSalvarEdicao}>
          <div className="mb-3">
            <label className="form-label text-muted fw-semibold mb-1">Produto</label>
            <div className="form-control bg-light fw-bold">
              {modalEdicao?.nome_produto || modalEdicao?.nome || 'Produto Selecionado'}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              Nova Quantidade em Estoque <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              min="0"
              placeholder="Ex: 20"
              value={formEdicao.quantidade}
              onChange={(e) => setFormEdicao({ quantidade: e.target.value })}
              required
            />
          </div>

          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalEdicao(null)}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Atualizando...
                </>
              ) : (
                'Atualizar Quantidade'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        show={!!confirmarDelete}
        title="Confirmar Exclusão"
        onClose={() => !salvando && setConfirmarDelete(null)}
      >
        <div className="text-center py-2">
          <i className="bi bi-exclamation-triangle text-warning display-4 mb-3 d-block"></i>
          <p className="fs-5 mb-2">
            Deseja remover o registro de estoque do produto{' '}
            <strong>"{confirmarDelete?.nome_produto || confirmarDelete?.nome}"</strong>?
          </p>
          <p className="text-muted small">Esta ação desvinculará o controle de estoque deste item.</p>
        </div>
        <div className="d-flex justify-content-end gap-2 border-top pt-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setConfirmarDelete(null)}
            disabled={salvando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeletar}
            disabled={salvando}
          >
            {salvando ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Excluindo...
              </>
            ) : (
              'Sim, Excluir'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}