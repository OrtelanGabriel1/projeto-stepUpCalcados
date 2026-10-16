import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { createResourceService } from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import { formatarMoeda, formatarData, calcularVariacaoPercentual } from '../utils';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';

const historicoService = createResourceService('historico-preco');
const produtoService = createResourceService('produto');

export default function HistoricoPrecos() {
  const [historicos, setHistoricos] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [toast, setToast] = useState({ mensagem: '', tipo: '' });

  // Carrega produtos e historicos iniciais ao montar o componente
  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setLoading(true);
      setErro(null);
      try {
        const [resHistoricos, resProdutos] = await Promise.all([
          historicoService.getAll ? historicoService.getAll() : historicoService.listar(),
          produtoService.getAll ? produtoService.getAll() : produtoService.listar()
        ]);

        const dadosHistorico = Array.isArray(resHistoricos) ? resHistoricos : resHistoricos.data || [];
        const dadosProdutos = Array.isArray(resProdutos) ? resProdutos : resProdutos.data || [];

        setHistoricos(dadosHistorico);
        setProdutos(dadosProdutos);
      } catch (err) {
        const mensagemErro =
          err.response?.data?.mensagem ||
          err.response?.data?.erro ||
          'Erro ao carregar dados do histórico de preços.';
        setErro(mensagemErro);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosIniciais();
  }, []);

  // Efeito disparado quando o filtro de produto selecionado altera
  useEffect(() => {
    // Evita refetch redundante no primeiro carregamento
    let isMounted = true;

    const carregarHistoricoFiltrado = async () => {
      setLoading(true);
      setErro(null);
      try {
        let dados = [];
        if (!produtoSelecionado) {
          const res = await (historicoService.getAll ? historicoService.getAll() : historicoService.listar());
          dados = Array.isArray(res) ? res : res.data || [];
        } else {
          const res = await api.get(`/historico-preco/produto/${produtoSelecionado}`);
          dados = Array.isArray(res.data) ? res.data : res.data?.dados || [];
        }

        if (isMounted) {
          setHistoricos(dados);
        }
      } catch (err) {
        if (isMounted) {
          const mensagemErro =
            err.response?.data?.mensagem ||
            err.response?.data?.erro ||
            'Erro ao filtrar histórico de preços por produto.';
          setErro(mensagemErro);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarHistoricoFiltrado();

    return () => {
      isMounted = false;
    };
  }, [produtoSelecionado]);

  // Função utilitária para renderizar o badge da variação percentual
  const renderBadgeVariacao = (precoAnterior, precoNovo) => {
    const pAnt = Number(precoAnterior) || 0;
    const pNov = Number(precoNovo) || 0;
    const variacao = calcularVariacaoPercentual(pAnt, pNov);

    let numVariacao = 0;
    if (typeof variacao === 'number') {
      numVariacao = variacao;
    } else if (typeof variacao === 'string') {
      numVariacao = parseFloat(variacao.replace('%', '').replace('+', '')) || 0;
    }

    if (numVariacao > 0) {
      return (
        <span className="badge bg-danger">
          +{typeof variacao === 'number' ? variacao.toFixed(2) + '%' : variacao}
        </span>
      );
    }

    if (numVariacao < 0) {
      return (
        <span className="badge bg-success">
          {typeof variacao === 'number' ? variacao.toFixed(2) + '%' : variacao}
        </span>
      );
    }

    return <span className="badge bg-secondary">Sem variação</span>;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-fluid py-4">
      {toast.mensagem && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onClose={() => setToast({ mensagem: '', tipo: '' })}
        />
      )}

      <PageHeader
        titulo="Histórico de Preços"
        subtitulo="Variações de preço de venda registradas automaticamente"
      />

      {erro && (
        <div className="alert alert-danger" role="alert">
          {erro}
        </div>
      )}

      {/* Filtro por Produto */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label htmlFor="selectProduto" className="form-label fw-semibold">
            Filtrar por Produto:
          </label>
          <select
            id="selectProduto"
            className="form-select"
            value={produtoSelecionado}
            onChange={(e) => setProdutoSelecionado(e.target.value)}
          >
            <option value="">Todos os produtos</option>
            {produtos.map((prod) => {
              const idProd = prod.id_produto || prod.id;
              const nomeProd = prod.nome || prod.nome_produto || `Produto #${idProd}`;
              return (
                <option key={idProd} value={idProd}>
                  {nomeProd}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Tabela de Histórico */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Produto</th>
                  <th scope="col">Preço Anterior</th>
                  <th scope="col">Preço Novo</th>
                  <th scope="col">Variação</th>
                  <th scope="col">Data</th>
                </tr>
              </thead>
              <tbody>
                {historicos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Nenhum registro de histórico de preço encontrado.
                    </td>
                  </tr>
                ) : (
                  historicos.map((item, index) => {
                    const idItem = item.id_historico || item.id || index;
                    const nomeProduto =
                      item.produto?.nome ||
                      item.nome_produto ||
                      item.nome ||
                      `Produto #${item.id_produto || ''}`;
                    const precoAnterior = item.preco_anterior ?? item.preco_antigo ?? 0;
                    const precoNovo = item.preco_novo ?? item.preco_atual ?? 0;
                    const dataRegistro = item.data_alteracao || item.criado_em || item.created_at || item.data;

                    return (
                      <tr key={idItem}>
                        <td className="fw-semibold">{nomeProduto}</td>
                        <td>{formatarMoeda(precoAnterior)}</td>
                        <td>{formatarMoeda(precoNovo)}</td>
                        <td>{renderBadgeVariacao(precoAnterior, precoNovo)}</td>
                        <td>{formatarData(dataRegistro)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}