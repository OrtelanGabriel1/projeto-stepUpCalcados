import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatarMoeda } from '../utils';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

export default function Dashboard() {
  const [dados, setDados] = useState({
    totalEstoque: 0,
    vendasRealizadas: 0,
    faturamentoTotal: 0,
    alertasEstoque: 0,
    produtosEstoqueBaixo: []
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [toast, setToast] = useState({ mensagem: '', tipo: '' });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);

    try {
      const [resEstoque, resVenda, resBaixo] = await Promise.all([
        api.get('/estoque'),
        api.get('/venda'),
        api.get('/estoque/alerta/baixo')
      ]);

      const estoque = resEstoque.data || [];
      const vendas = resVenda.data || [];
      const produtosBaixo = resBaixo.data || [];

    
      const totalEstoque = estoque.reduce(
        (acc, item) => acc + (Number(item.quantidade) || 0),
        0
      );
      const vendasRealizadas = vendas.length;
      const faturamentoTotal = vendas.reduce(
        (acc, item) => acc + (Number(item.valor_total) || 0),
        0
      );
      const alertasEstoque = produtosBaixo.length;

      setDados({
        totalEstoque,
        vendasRealizadas,
        faturamentoTotal,
        alertasEstoque,
        produtosEstoqueBaixo: produtosBaixo
      });
    } catch (err) {
      setErro(
        err.response?.data?.mensagem || 'Erro ao carregar dados do dashboard'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container-fluid py-3">
      {toast.mensagem && (
        <Toast
          mensagem={toast.mensagem}
          tipo={toast.tipo}
          onClose={() => setToast({ mensagem: '', tipo: '' })}
        />
      )}

      <PageHeader titulo="Dashboard" subtitulo="Visão geral do sistema" />

      {erro && (
        <div className="alert alert-danger" role="alert">
          {erro}
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="row g-3 mb-4">
        {/* Total em Estoque */}
        <div className="col-md-3 col-sm-6">
          <div className="card card-stat h-100 shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-archive fs-1 text-primary me-3"></i>
              <div>
                <h3 className="mb-0 fw-bold">{dados.totalEstoque}</h3>
                <span className="text-muted small">Total em Estoque</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vendas Realizadas */}
        <div className="col-md-3 col-sm-6">
          <div className="card card-stat h-100 shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-cart3 fs-1 text-success me-3"></i>
              <div>
                <h3 className="mb-0 fw-bold">{dados.vendasRealizadas}</h3>
                <span className="text-muted small">Vendas Realizadas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Faturamento Total */}
        <div className="col-md-3 col-sm-6">
          <div className="card card-stat h-100 shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-currency-dollar fs-1 text-warning me-3"></i>
              <div>
                <h3 className="mb-0 fw-bold">
                  {formatarMoeda(dados.faturamentoTotal)}
                </h3>
                <span className="text-muted small">Faturamento Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de Estoque */}
        <div className="col-md-3 col-sm-6">
          <div className="card card-stat h-100 shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <i className="bi bi-exclamation-triangle fs-1 text-danger me-3"></i>
              <div>
                <h3 className="mb-0 fw-bold">{dados.alertasEstoque}</h3>
                <span className="text-muted small">Alertas de Estoque</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Produtos com Estoque Baixo */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h5 className="card-title mb-0">⚠️ Produtos com Estoque Baixo</h5>
        </div>
        <div className="card-body p-0">
          {dados.produtosEstoqueBaixo.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Produto</th>
                    <th>Tamanho</th>
                    <th>Cor</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.produtosEstoqueBaixo.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.produto || item.nome}</td>
                      <td>{item.tamanho}</td>
                      <td>{item.cor}</td>
                      <td>
                        <span className="badge bg-danger">
                          {item.quantidade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3">
              <EmptyState mensagem="Nenhum produto com estoque baixo 🎉" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}