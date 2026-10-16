import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { createResourceService } from '../services/resourceService'
import { useAuth } from '../context/AuthContext'
import { formatarData } from '../utils'
import Loading from '../components/Loading'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'

const produtoService = createResourceService('produto')

export default function Movimentacoes() {
  const { funcionario } = useAuth()

  const [movimentacoes, setMovimentacoes] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [toast, setToast] = useState({ mensagem: '', tipo: '' })

  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)

  const [filtros, setFiltros] = useState({
    tipo: '',
    id_produto: ''
  })

  const [form, setForm] = useState({
    id_produto: '',
    id_funcionario: funcionario?.id_funcionario || '',
    tipo: 'entrada',
    quantidade: '',
    motivo: ''
  })

  useEffect(() => {
    if (funcionario?.id_funcionario) {
      setForm((prev) => ({ ...prev, id_funcionario: funcionario.id_funcionario }))
    }
  }, [funcionario])

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const res = await produtoService.listar()
        const lista = res.dados || res.data || res || []
        setProdutos(Array.isArray(lista) ? lista : [])
      } catch (err) {}
    }
    carregarProdutos()
  }, [])

  const carregarMovimentacoes = async () => {
    setLoading(true)
    setErro(null)
    try {
      const params = {}
      if (filtros.tipo) params.tipo = filtros.tipo
      if (filtros.id_produto) params.id_produto = filtros.id_produto

      const response = await api.get('/movimentacao-estoque', { params })
      const dados = response.data?.dados || response.dados || response.data || []
      setMovimentacoes(Array.isArray(dados) ? dados : [])
    } catch (err) {
      setErro(err.response?.data?.mensagem || err.message || 'Erro ao carregar movimentações de estoque.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarMovimentacoes()
  }, [filtros])

  const handleFiltroChange = (e) => {
    const { name, value } = e.target
    setFiltros((prev) => ({ ...prev, [name]: value }))
  }

  const limparFiltros = () => {
    setFiltros({ tipo: '', id_produto: '' })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const abrirModalRegistro = () => {
    setForm({
      id_produto: '',
      id_funcionario: funcionario?.id_funcionario || '',
      tipo: 'entrada',
      quantidade: '',
      motivo: ''
    })
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSalvando(true)

    try {
      const payload = {
        id_produto: Number(form.id_produto),
        id_funcionario: form.id_funcionario ? Number(form.id_funcionario) : null,
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        motivo: form.motivo || ''
      }

      const response = await api.post('/movimentacao-estoque', payload)
      const msgSucesso = response.data?.mensagem || response.mensagem || 'Movimentação registrada com sucesso!'

      setToast({ mensagem: msgSucesso, tipo: 'sucesso' })
      fecharModal()
      carregarMovimentacoes()
    } catch (err) {
      const msgErro = err.response?.data?.mensagem || err.message || 'Erro ao registrar movimentação.'
      setToast({ mensagem: msgErro, tipo: 'erro' })
    } finally {
      setSalvando(false)
    }
  }

  const renderBadgeTipo = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'entrada':
        return (
          <span className="badge bg-success d-inline-flex align-items-center gap-1">
            <i className="bi bi-arrow-down-circle"></i> Entrada
          </span>
        )
      case 'saida':
      case 'saída':
        return (
          <span className="badge bg-danger d-inline-flex align-items-center gap-1">
            <i className="bi bi-arrow-up-circle"></i> Saída
          </span>
        )
      case 'ajuste':
        return (
          <span className="badge bg-info text-dark d-inline-flex align-items-center gap-1">
            <i className="bi bi-arrows-collapse"></i> Ajuste
          </span>
        )
      default:
        return <span className="badge bg-secondary">{tipo}</span>
    }
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

      <PageHeader
        titulo="Movimentações de Estoque"
        subtitulo="Entradas, saídas e ajustes manuais de estoque"
        acao={
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={abrirModalRegistro}>
            <i className="bi bi-plus-lg"></i> Registrar Movimentação
          </button>
        }
      />

      {erro && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {erro}
          <button type="button" className="btn-close" onClick={() => setErro(null)} aria-label="Fechar"></button>
        </div>
      )}

      <div className="row mb-3 g-3 align-items-end">
        <div className="col-md-4">
          <label htmlFor="filtro-tipo" className="form-label fw-semibold">Tipo</label>
          <select
            id="filtro-tipo"
            name="tipo"
            className="form-select"
            value={filtros.tipo}
            onChange={handleFiltroChange}
          >
            <option value="">Todos os tipos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
            <option value="ajuste">Ajuste</option>
          </select>
        </div>

        <div className="col-md-4">
          <label htmlFor="filtro-produto" className="form-label fw-semibold">Produto</label>
          <select
            id="filtro-produto"
            name="id_produto"
            className="form-select"
            value={filtros.id_produto}
            onChange={handleFiltroChange}
          >
            <option value="">Todos os produtos</option>
            {produtos.map((prod) => (
              <option key={prod.id_produto} value={prod.id_produto}>
                {prod.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <button className="btn btn-outline-secondary w-100" onClick={limparFiltros}>
            Limpar Filtros
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th>Funcionário</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Nenhuma movimentação encontrada.
                  </td>
                </tr>
              ) : (
                movimentacoes.map((mov) => (
                  <tr key={mov.id_movimentacao || mov.id}>
                    <td>{formatarData(mov.data_movimentacao || mov.created_at || mov.data)}</td>
                    <td className="fw-semibold">{mov.nome_produto || mov.produto?.nome || mov.produto || '-'}</td>
                    <td>{mov.nome_funcionario || mov.funcionario?.nome || 'Sistema (automático)'}</td>
                    <td>{renderBadgeTipo(mov.tipo)}</td>
                    <td className="fw-bold">{mov.quantidade}</td>
                    <td>{mov.motivo || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalAberto && (
        <Modal
          titulo="Registrar Movimentação"
          aberto={modalAberto}
          aoFechar={fecharModal}
          onClose={fecharModal}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="id_produto" className="form-label fw-semibold">Produto *</label>
              <select
                id="id_produto"
                name="id_produto"
                className="form-select"
                value={form.id_produto}
                onChange={handleFormChange}
                required
              >
                <option value="">Selecione um produto...</option>
                {produtos.map((prod) => (
                  <option key={prod.id_produto} value={prod.id_produto}>
                    {prod.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="tipo" className="form-label fw-semibold">Tipo *</label>
              <select
                id="tipo"
                name="tipo"
                className="form-select"
                value={form.tipo}
                onChange={handleFormChange}
                required
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
                <option value="ajuste">Ajuste</option>
              </select>
              {form.tipo === 'ajuste' && (
                <small className="text-info d-block mt-1">
                  Para ajuste, informe a quantidade FINAL desejada em estoque.
                </small>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="quantidade" className="form-label fw-semibold">Quantidade *</label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                className="form-control"
                min="1"
                value={form.quantidade}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="motivo" className="form-label fw-semibold">Motivo</label>
              <textarea
                id="motivo"
                name="motivo"
                className="form-control"
                rows="3"
                placeholder="Ex: Compra de fornecedor..."
                value={form.motivo}
                onChange={handleFormChange}
              ></textarea>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fecharModal}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}