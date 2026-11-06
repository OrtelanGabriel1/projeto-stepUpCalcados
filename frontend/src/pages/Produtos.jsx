import React, { useState, useEffect } from 'react';
import { createResourceService } from '../services/resourceService';
import { formatarMoeda } from '../utils';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

// Inicialização dos serviços da API
const produtoService = createResourceService('produto');
const categoriaService = createResourceService('categoria');

// Estado inicial padronizado do formulário
const formInicial = {
  nome: '',
  descricao: '',
  preco_venda: '',
  preco_custo: '',
  tamanho: '',
  cor: '',
  genero: 'Unissex',
  id_categoria: ''
};

export default function Produtos() {
  const { funcionario } = useAuth();
  const podeCadastrarProduto = String(funcionario?.tipo_funcionario || '').toLowerCase() !== 'vendedor';
  // Estados de Dados
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados de Controle de Interface
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Filtros de pesquisa
  const [filtros, setFiltros] = useState({
    busca: '',
    categoria: '',
    tamanho: '',
    cor: '',
    genero: ''
  });

  // Estados de Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [confirmarDelete, setConfirmarDelete] = useState(null);

  // Estado do Formulário
  const [form, setForm] = useState(formInicial);

  // Estado do Toast de Notificação
  const [toast, setToast] = useState({
    show: false,
    mensagem: '',
    variante: 'success'
  });

  // Função utilitária para exibir toasts
  const exibirToast = (mensagem, variante = 'success') => {
    setToast({ show: true, mensagem, variante });
  };

  // Carregar produtos e categorias em paralelo ao montar a página
  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      const [resProdutos, resCategorias] = await Promise.all([
        produtoService.listar(),
        categoriaService.listar()
      ]);

      // Trata resposta de produtos
      if (resProdutos && resProdutos.dados) {
        setProdutos(resProdutos.dados);
      } else if (Array.isArray(resProdutos)) {
        setProdutos(resProdutos);
      }

      // Trata resposta de categorias
      if (resCategorias && resCategorias.dados) {
        setCategorias(resCategorias.dados);
      } else if (Array.isArray(resCategorias)) {
        setCategorias(resCategorias);
      }
    } catch (err) {
      const msgErro = err.response?.data?.mensagem || err.message || 'Erro ao carregar dados do catálogo.';
      setErro(msgErro);
      exibirToast(msgErro, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Manipulação das alterações nos inputs do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Abertura do Modal para Criação
  const handleAbrirModalCriar = () => {
    setProdutoEditando(null);
    setForm(formInicial);
    setModalAberto(true);
  };

  // Abertura do Modal para Edição
  const handleAbrirModalEditar = (produto) => {
    setProdutoEditando(produto);
    setForm({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco_venda: produto.preco_venda || '',
      preco_custo: produto.preco_custo || '',
      tamanho: produto.tamanho || '',
      cor: produto.cor || '',
      genero: produto.genero || 'Unissex',
      id_categoria: produto.id_categoria || ''
    });
    setModalAberto(true);
  };

  // Validação Frontend antes de enviar
  const validarFormulario = () => {
    if (!form.nome.trim()) {
      exibirToast('O nome do produto é obrigatório.', 'danger');
      return false;
    }

    if (!form.cor.trim()) {
      exibirToast('A cor do produto é obrigatória.', 'danger');
      return false;
    }

    const tam = Number(form.tamanho);
    if (!form.tamanho || isNaN(tam) || tam <= 0) {
      exibirToast('O tamanho deve ser um número maior que zero.', 'danger');
      return false;
    }

    const pCusto = parseFloat(form.preco_custo);
    if (!form.preco_custo || isNaN(pCusto) || pCusto <= 0) {
      exibirToast('O preço de custo deve ser maior que zero.', 'danger');
      return false;
    }

    const pVenda = parseFloat(form.preco_venda);
    if (!form.preco_venda || isNaN(pVenda) || pVenda <= 0) {
      exibirToast('O preço de venda deve ser maior que zero.', 'danger');
      return false;
    }

    return true;
  };

  // Salvar (Criar ou Atualizar)
  const handleSalvar = async (e) => {
    if (e) e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setSalvando(true);

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      preco_venda: parseFloat(form.preco_venda),
      preco_custo: parseFloat(form.preco_custo),
      tamanho: parseInt(form.tamanho, 10),
      cor: form.cor.trim(),
      genero: form.genero,
      id_categoria: form.id_categoria ? parseInt(form.id_categoria, 10) : null
    };

    try {
      if (produtoEditando) {
        await produtoService.atualizar(produtoEditando.id_produto, payload);
        exibirToast('Produto atualizado com sucesso!', 'success');
      } else {
        await produtoService.criar(payload);
        exibirToast('Produto cadastrado com sucesso!', 'success');
      }

      setModalAberto(false);
      setForm(formInicial);
      await carregarDados();
    } catch (err) {
      const msg = err.response?.data?.mensagem || 'Erro ao salvar o produto. Verifique os dados fornecidos.';
      exibirToast(msg, 'danger');
    } finally {
      setSalvando(false);
    }
  };

  // Confirmação e Exclusão de Produto (Tratando erro 409)
  const handleDeletar = async () => {
    if (!confirmarDelete) return;

    setSalvando(true);
    try {
      await produtoService.deletar(confirmarDelete.id_produto);
      exibirToast('Produto excluído com sucesso!', 'success');
      setConfirmarDelete(null);
      await carregarDados();
    } catch (err) {
      if (err.response?.status === 409) {
        const msg409 = err.response?.data?.mensagem || 'Não é possível excluir o produto pois ele possui histórico de estoque ou vendas vinculados.';
        exibirToast(msg409, 'danger');
      } else {
        const msgGeral = err.response?.data?.mensagem || 'Erro ao tentar excluir o produto.';
        exibirToast(msgGeral, 'danger');
      }
    } finally {
      setSalvando(false);
    }
  };

  // Helper para formatar a badge de gênero
  const renderBadgeGenero = (genero) => {
    switch (genero) {
      case 'Masculino':
        return <span className="badge bg-primary">Masculino</span>;
      case 'Feminino':
        return (
          <span className="badge text-white" style={{ background: '#e91e8c' }}>
            Feminino
          </span>
        );
      default:
        return <span className="badge bg-secondary">Unissex</span>;
    }
  };

  // Helper para buscar o nome da categoria do produto
  const obterNomeCategoria = (produto) => {
    if (produto.nome_categoria) return produto.nome_categoria;
    if (!produto.id_categoria) return null;
    const cat = categorias.find((c) => c.id_categoria === Number(produto.id_categoria));
    return cat ? cat.nome || cat.nome_categoria : null;
  };

  // Opções únicas para filtros
  const tamanhosDisponiveis = [...new Set(produtos.map((p) => p.tamanho).filter((v) => v !== undefined && v !== null && v !== ''))].sort((a, b) => Number(a) - Number(b));
  const coresDisponiveis = [...new Set(produtos.map((p) => p.cor).filter(Boolean))].sort();
  const generosDisponiveis = [...new Set(produtos.map((p) => p.genero).filter(Boolean))].sort();

  // Lista de produtos filtrada
  const produtosFiltrados = produtos.filter((produto) => {
    if (filtros.busca && !(produto.nome || '').toLowerCase().includes(filtros.busca.toLowerCase())) return false;
    if (filtros.categoria && String(produto.id_categoria) !== String(filtros.categoria)) return false;
    if (filtros.tamanho && String(produto.tamanho) !== String(filtros.tamanho)) return false;
    if (filtros.cor && (produto.cor || '').toLowerCase() !== filtros.cor.toLowerCase()) return false;
    if (filtros.genero && produto.genero !== filtros.genero) return false;
    return true;
  });

  const limparFiltros = () => setFiltros({ busca: '', categoria: '', tamanho: '', cor: '', genero: '' });

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
      <PageHeader title="Produtos" subtitle="Gestão do catálogo de calçados" linha={false} />

      {/* Filtros e ações */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <input
            type="text"
            className="form-control"
            style={{ width: '200px' }}
            placeholder="Buscar..."
            value={filtros.busca}
            onChange={(e) => setFiltros((prev) => ({ ...prev, busca: e.target.value }))}
          />
          <select
            className="form-select"
            style={{ width: '180px' }}
            value={filtros.categoria}
            onChange={(e) => setFiltros((prev) => ({ ...prev, categoria: e.target.value }))}
          >
            <option value="">Categoria</option>
            {categorias.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nome || cat.nome_categoria}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: '130px' }}
            value={filtros.tamanho}
            onChange={(e) => setFiltros((prev) => ({ ...prev, tamanho: e.target.value }))}
          >
            <option value="">Tamanho</option>
            {tamanhosDisponiveis.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: '130px' }}
            value={filtros.cor}
            onChange={(e) => setFiltros((prev) => ({ ...prev, cor: e.target.value }))}
          >
            <option value="">Cor</option>
            {coresDisponiveis.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: '130px' }}
            value={filtros.genero}
            onChange={(e) => setFiltros((prev) => ({ ...prev, genero: e.target.value }))}
          >
            <option value="">Gênero</option>
            {generosDisponiveis.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button type="button" className="btn btn-outline-secondary" onClick={limparFiltros}>
            Limpar
          </button>
        </div>
        {podeCadastrarProduto && (
          <button className="btn btn-primary shadow-sm" onClick={handleAbrirModalCriar}>
            <i className="bi bi-plus-lg me-1"></i> + Novo Produto
          </button>
        )}
      </div>

      <hr className="mt-0" />

      {/* Exibição de Erro Global de Carregamento */}
      {erro && (
        <div className="alert alert-danger alert-dismissible fade show my-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {erro}
          <button type="button" className="btn-close" onClick={() => setErro(null)}></button>
        </div>
      )}

      {/* Conteúdo Principal */}
      {loading ? (
        <Loading texto="Carregando produtos do catálogo..." />
      ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {produtos.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-box-seam display-4 d-block mb-3 text-secondary"></i>
                  <p className="mb-0">Nenhum produto cadastrado até o momento.</p>
                </div>
              ) : produtosFiltrados.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-search display-4 d-block mb-3 text-secondary"></i>
                  <p className="mb-0">Nenhum produto encontrado para os filtros selecionados.</p>
                </div>
              ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th className="text-center">Tamanho</th>
                      <th>Cor</th>
                      <th>Gênero</th>
                      <th className="text-end">Preço Custo</th>
                      <th className="text-end">Preço Venda</th>
                      <th className="text-center" style={{ width: '130px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtosFiltrados.map((produto, index) => {
                      const nomeCat = obterNomeCategoria(produto);
                      return (
                        <tr key={produto.id_produto || index}>
                          <td className="fw-bold">{produto.nome}</td>
                          <td>
                            {nomeCat ? (
                              <span className="badge bg-light text-dark border">
                                {nomeCat}
                              </span>
                            ) : (
                              <span className="badge bg-light text-muted border">
                                Sem categoria
                              </span>
                            )}
                          </td>
                          <td className="text-center fw-semibold">{produto.tamanho}</td>
                          <td>{produto.cor}</td>
                          <td>{renderBadgeGenero(produto.genero)}</td>
                          <td className="text-end text-muted">
                            {formatarMoeda(produto.preco_custo)}
                          </td>
                          <td className="text-end fw-bold text-success">
                            {formatarMoeda(produto.preco_venda)}
                          </td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info me-2"
                              title="Editar produto"
                              onClick={() => handleAbrirModalEditar(produto)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              title="Excluir produto"
                              onClick={() => setConfirmarDelete(produto)}
                            >
                              Excluir
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

      {/* Modal de Formulário (Criação / Edição) */}
      <Modal
        show={modalAberto}
        title={produtoEditando ? 'Editar Produto' : 'Novo Produto'}
        onClose={() => !salvando && setModalAberto(false)}
      >
        <form onSubmit={handleSalvar}>
          {/* Linha 1: Nome (8 col) e Tamanho (4 col) */}
          <div className="row g-3 mb-3">
            <div className="col-md-8">
              <label className="form-label fw-semibold">
                Nome do Produto <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="nome"
                value={form.nome}
                onChange={handleInputChange}
                placeholder="Ex: Tênis Runner Pro"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Tamanho <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="tamanho"
                value={form.tamanho}
                onChange={handleInputChange}
                min="1"
                max="60"
                placeholder="Ex: 40"
                required
              />
            </div>
          </div>

          {/* Descrição (Opcional, 2 linhas) */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Descrição (Opcional)</label>
            <textarea
              className="form-control"
              name="descricao"
              rows="2"
              value={form.descricao}
              onChange={handleInputChange}
              placeholder="Detalhes sobre o produto, material, etc."
            ></textarea>
          </div>

          {/* Linha 2: Preço Custo e Preço Venda */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Preço de Custo (R$) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                name="preco_custo"
                value={form.preco_custo}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Preço de Venda (R$) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                name="preco_venda"
                value={form.preco_venda}
                onChange={handleInputChange}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Linha 3: Cor e Gênero */}
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Cor <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="cor"
                value={form.cor}
                onChange={handleInputChange}
                placeholder="Ex: Preto, Branco..."
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">
                Gênero <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="genero"
                value={form.genero}
                onChange={handleInputChange}
                required
              >
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Unissex">Unissex</option>
              </select>
            </div>
          </div>

          {/* Categoria */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Categoria</label>
            <select
              className="form-select"
              name="id_categoria"
              value={form.id_categoria}
              onChange={handleInputChange}
            >
              <option value="">Sem categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nome || cat.nome_categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Ações do Modal */}
          <div className="d-flex justify-content-end gap-2 border-top pt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalAberto(false)}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Salvando...
                </>
              ) : produtoEditando ? (
                'Salvar Alterações'
              ) : (
                'Cadastrar Produto'
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
            Tem certeza que deseja excluir o produto{' '}
            <strong>"{confirmarDelete?.nome}"</strong>?
          </p>
          <p className="text-muted small">Esta ação não poderá ser desfeita.</p>
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