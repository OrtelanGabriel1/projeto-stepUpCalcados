import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { createResourceService } from '../services/resourceService'
import { useAuth } from '../context/AuthContext'
import { formatarMoeda, formatarData } from '../utils'
import Loading from '../components/Loading'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'

const vendaService = createResourceService('venda')
const produtoService = createResourceService('produto')

// Cargos que podem registrar vendas (todos os demais apenas visualizam)
const CARGOS_PODEM_VENDER = ['vendedor', 'gerente']

export default function Vendas() {
  const { funcionario } = useAuth()
  const podeRegistrarVenda = CARGOS_PODEM_VENDER.includes(
    String(funcionario?.tipo_funcionario || '').toLowerCase()
  )

  const [vendas, setVendas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [toast, setToast] = useState({ mensagem: '', tipo: '' })

  const [modalNovaVenda, setModalNovaVenda] = useState(false)
  const [modalDetalhes, setModalDetalhes] = useState(null)
  const [confirmarCancelar, setConfirmarCancelar] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    id_funcionario: funcionario?.id_funcionario || '',
    forma_pagamento: '',
    itens: []
  })

  const [itemAtual, setItemAtual] = useState({
    id_produto: '',
    quantidade: 1
  })

  useEffect(() => {
    if (funcionario?.id_funcionario) {
      setForm((prev) => ({ ...prev, id_funcionario: funcionario.id_funcionario }))
    }
  }, [funcionario])

  const carregarDados = async () => {
    setLoading(true)
    setErro(null)
    try {
      const [resVendas, resProdutos] = await Promise.all([
        vendaService.listar(),
        produtoService.listar()
      ])

      const listaVendas = resVendas.dados || resVendas.data || resVendas || []
      const listaProdutos = resProdutos.dados || resProdutos.data || resProdutos || []

      setVendas(Array.isArray(listaVendas) ? listaVendas : [])
      setProdutos(Array.isArray(listaProdutos) ? listaProdutos : [])
    } catch (err) {
      setErro(err.response?.data?.mensagem || err.message || 'Erro ao carregar dados de vendas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  const abrirModalNovaVenda = () => {
    if (!podeRegistrarVenda) {
      setToast({ mensagem: 'Apenas vendedores e gerentes podem registrar vendas.', tipo: 'danger' })
      return
    }
    setForm({
      id_funcionario: funcionario?.id_funcionario || '',
      forma_pagamento: '',
      itens: []
    })
    setItemAtual({ id_produto: '', quantidade: 1 })
    setModalNovaVenda(true)
  }

  const fecharModalNovaVenda = () => {
    setModalNovaVenda(false)
  }

  const handleAdicionarItem = () => {
    if (!itemAtual.id_produto || Number(itemAtual.quantidade) <= 0) {
      setToast({ mensagem: 'Selecione um produto e uma quantidade válida.', tipo: 'danger' })
      return
    }

    const produtoEncontrado = produtos.find(
      (p) => String(p.id_produto) === String(itemAtual.id_produto)
    )

    if (!produtoEncontrado) {
      setToast({ mensagem: 'Produto não encontrado.', tipo: 'danger' })
      return
    }

    const qtd = Number(itemAtual.quantidade)
    const preco = Number(produtoEncontrado.preco_venda || produtoEncontrado.preco || 0)

    setForm((prev) => {
      const itemExistenteIndex = prev.itens.findIndex(
        (i) => String(i.id_produto) === String(itemAtual.id_produto)
      )

      if (itemExistenteIndex >= 0) {
        const novosItens = [...prev.itens]
        novosItens[itemExistenteIndex] = {
          ...novosItens[itemExistenteIndex],
          quantidade: novosItens[itemExistenteIndex].quantidade + qtd
        }
        return { ...prev, itens: novosItens }
      } else {
        return {
          ...prev,
          itens: [
            ...prev.itens,
            {
              id_produto: produtoEncontrado.id_produto,
              nome_produto: produtoEncontrado.nome,
              preco_venda: preco,
              quantidade: qtd
            }
          ]
        }
      }
    })

    setItemAtual({ id_produto: '', quantidade: 1 })
  }

  const handleRemoverItem = (id_produto) => {
    setForm((prev) => ({
      ...prev,
      itens: prev.itens.filter((i) => String(i.id_produto) !== String(id_produto))
    }))
  }

  const calcularTotalForm = () => {
    return form.itens.reduce((acc, item) => acc + item.quantidade * item.preco_venda, 0)
  }

  const handleRegistrarVenda = async (e) => {
    e.preventDefault()

    if (!form.forma_pagamento) {
      setToast({ mensagem: 'Selecione a forma de pagamento.', tipo: 'danger' })
      return
    }

    if (form.itens.length === 0) {
      setToast({ mensagem: 'Adicione pelo menos 1 item à venda.', tipo: 'danger' })
      return
    }

    setSalvando(true)

    try {
      const payload = {
        forma_pagamento: form.forma_pagamento,
        itens: form.itens.map((item) => ({
          id_produto: Number(item.id_produto),
          quantidade: Number(item.quantidade)
        }))
      }

      const res = await vendaService.criar(payload)
      const msgSucesso = res.data?.mensagem || res.mensagem || 'Venda registrada com sucesso!'

      setToast({ mensagem: msgSucesso, tipo: 'success' })
      fecharModalNovaVenda()
      carregarDados()
    } catch (err) {
      const msgErro = err.response?.data?.mensagem || err.message || 'Erro ao registrar venda.'
      setToast({ mensagem: msgErro, tipo: 'danger' })
    } finally {
      setSalvando(false)
    }
  }

  const handleVerDetalhes = async (id) => {
    try {
      setLoading(true)
      const res = await api.get(`/venda/${id}`)
      const dados = res.data?.dados || res.dados || res.data || null
      setModalDetalhes(dados)
    } catch (err) {
      const msgErro = err.response?.data?.mensagem || err.message || 'Erro ao carregar detalhes da venda.'
      setToast({ mensagem: msgErro, tipo: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmarCancelar = async () => {
    if (!confirmarCancelar) return
    const id = confirmarCancelar.id_venda || confirmarCancelar.id
    setSalvando(true)

    try {
      const res = await api.patch(`/venda/${id}/cancelar`)
      const msgSucesso = res.data?.mensagem || res.mensagem || 'Venda cancelada com sucesso!'

      setToast({ mensagem: msgSucesso, tipo: 'success' })
      setConfirmarCancelar(null)
      carregarDados()
    } catch (err) {
      const msgErro = err.response?.data?.mensagem || err.message || 'Erro ao cancelar venda.'
      setToast({ mensagem: msgErro, tipo: 'danger' })
    } finally {
      setSalvando(false)
    }
  }

  const renderBadgeFormaPagamento = (forma) => {
    const formaLower = forma?.toLowerCase() || ''
    switch (formaLower) {
      case 'dinheiro':
        return <span className="badge bg-success">Dinheiro</span>
      case 'pix':
        return <span className="badge bg-info text-dark">Pix</span>
      case 'credito':
      case 'crédito':
        return <span className="badge bg-primary">Crédito</span>
      case 'debito':
      case 'débito':
        return <span className="badge bg-secondary">Débito</span>
      default:
        return <span className="badge bg-dark">{forma}</span>
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
        titulo="Vendas"
        subtitulo="Registre e gerencie as vendas da loja"
      >
        {podeRegistrarVenda && (
          <button className="btn btn-primary shadow-sm" onClick={abrirModalNovaVenda}>
            <i className="bi bi-plus-lg me-1"></i> Nova Venda
          </button>
        )}
      </PageHeader>

      {erro && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {erro}
          <button type="button" className="btn-close" onClick={() => setErro(null)} aria-label="Fechar"></button>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div className="table-responsive bg-white rounded shadow-sm border">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Funcionário</th>
                <th>Data</th>
                <th>Forma Pagamento</th>
                <th>Total</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              ) : (
                vendas.map((venda) => {
                  const id = venda.id_venda || venda.id
                  const status = (venda.status || '').toLowerCase()
                  const cancelada = status === 'cancelada'

                  return (
                    <tr key={id} className={cancelada ? 'table-secondary text-muted' : ''}>
                      <td>#{id}</td>
                      <td>{venda.nome_funcionario || venda.funcionario?.nome || 'Sistema'}</td>
                      <td>{formatarData(venda.data_venda || venda.created_at || venda.data)}</td>
                      <td>{renderBadgeFormaPagamento(venda.forma_pagamento)}</td>
                      <td className="fw-bold">{formatarMoeda(venda.valor_total || venda.total || 0)}</td>
                      <td className="text-end">
                        <div className="btn-group gap-1">
                          <button
                            className="btn btn-sm btn-outline-info d-inline-flex align-items-center gap-1"
                            onClick={() => handleVerDetalhes(id)}
                            title="Ver Detalhes"
                          >
                            <i className="bi bi-eye"></i> Detalhes
                          </button>
                          {!cancelada && (
                            <button
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                              onClick={() => setConfirmarCancelar(venda)}
                              title="Cancelar Venda"
                            >
                              <i className="bi bi-x-circle"></i> Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalNovaVenda && (
        <Modal
          titulo="Registrar Nova Venda"
          show={modalNovaVenda}
          onClose={fecharModalNovaVenda}
          largura="720px"
        >
          <form onSubmit={handleRegistrarVenda}>
            <div className="mb-4">
              <h6 className="fw-bold border-bottom pb-2">1. Forma de Pagamento</h6>
              <div className="mb-3">
                <label htmlFor="forma_pagamento" className="form-label fw-semibold">
                  Forma de Pagamento *
                </label>
                <select
                  id="forma_pagamento"
                  name="forma_pagamento"
                  className="form-select"
                  value={form.forma_pagamento}
                  onChange={(e) => setForm((prev) => ({ ...prev, forma_pagamento: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="pix">Pix</option>
                  <option value="credito">Cartão de Crédito</option>
                  <option value="debito">Cartão de Débito</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold border-bottom pb-2">2. Adicionar Itens</h6>
              <div className="row g-2 align-items-end mb-3">
                <div className="col-md-5">
                  <label htmlFor="select-produto" className="form-label fw-semibold small">
                    Produto
                  </label>
                  <select
                    id="select-produto"
                    className="form-select"
                    value={itemAtual.id_produto}
                    onChange={(e) => setItemAtual((prev) => ({ ...prev, id_produto: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {produtos.map((p) => (
                      <option key={p.id_produto} value={p.id_produto}>
                        {p.nome} - {formatarMoeda(p.preco_venda || p.preco || 0)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="input-qtd" className="form-label fw-semibold small">
                    Qtd
                  </label>
                  <input
                    type="number"
                    id="input-qtd"
                    className="form-control"
                    min="1"
                    value={itemAtual.quantidade}
                    onChange={(e) => setItemAtual((prev) => ({ ...prev, quantidade: e.target.value }))}
                  />
                </div>
                <div className="col-md-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={handleAdicionarItem}
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="table-responsive border rounded mb-2">
                <table className="table table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Produto</th>
                      <th className="text-center">Qtd</th>
                      <th className="text-end">Preço Unit.</th>
                      <th className="text-end">Subtotal</th>
                      <th className="text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.itens.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-3 text-muted small">
                          Nenhum item adicionado ainda.
                        </td>
                      </tr>
                    ) : (
                      form.itens.map((item) => (
                        <tr key={item.id_produto}>
                          <td>{item.nome_produto}</td>
                          <td className="text-center">{item.quantidade}</td>
                          <td className="text-end">{formatarMoeda(item.preco_venda)}</td>
                          <td className="text-end">{formatarMoeda(item.quantidade * item.preco_venda)}</td>
                          <td className="text-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => handleRemoverItem(item.id_produto)}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-end fw-bold fs-5 mt-2">
                Total: {formatarMoeda(calcularTotalForm())}
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={fecharModalNovaVenda}
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={salvando || form.itens.length === 0}
              >
                {salvando ? 'Registrando...' : 'Finalizar Venda'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalDetalhes && (
        <Modal
          titulo={`Detalhes da Venda #${modalDetalhes.id_venda || modalDetalhes.id}`}
          show={!!modalDetalhes}
          onClose={() => setModalDetalhes(null)}
        >
          <div className="mb-3">
            <div className="row g-2 mb-2">
              <div className="col-6">
                <strong>Funcionário:</strong> {modalDetalhes.nome_funcionario || modalDetalhes.funcionario?.nome || '-'}
              </div>
              <div className="col-6">
                <strong>Data:</strong> {formatarData(modalDetalhes.data_venda || modalDetalhes.created_at || modalDetalhes.data)}
              </div>
              <div className="col-6">
                <strong>Forma de Pagamento:</strong> {renderBadgeFormaPagamento(modalDetalhes.forma_pagamento)}
              </div>
              <div className="col-6">
                <strong>Status:</strong> {modalDetalhes.status || 'Concluída'}
              </div>
            </div>
          </div>

          <h6 className="fw-bold border-bottom pb-2">Itens da Venda</h6>
          <div className="table-responsive border rounded mb-3">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Produto</th>
                  <th>Tamanho</th>
                  <th>Cor</th>
                  <th className="text-center">Qtd</th>
                  <th className="text-end">Preço Unit</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(modalDetalhes.itens || []).map((item, idx) => {
                  const qtd = item.quantidade || 0
                  const preco = item.preco_unitario || item.preco_venda || item.preco || 0
                  return (
                    <tr key={item.id_item || idx}>
                      <td>{item.nome_produto || item.produto?.nome || item.nome || '-'}</td>
                      <td>{item.tamanho || item.produto?.tamanho || '-'}</td>
                      <td>{item.cor || item.produto?.cor || '-'}</td>
                      <td className="text-center">{qtd}</td>
                      <td className="text-end">{formatarMoeda(preco)}</td>
                      <td className="text-end">{formatarMoeda(qtd * preco)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="text-end fw-bold fs-5 mb-3">
            Total: {formatarMoeda(modalDetalhes.valor_total || modalDetalhes.total || 0)}
          </div>

          <div className="d-flex justify-content-end pt-2 border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalDetalhes(null)}
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}

      {confirmarCancelar && (
        <Modal
          titulo="Confirmar Cancelamento"
          show={!!confirmarCancelar}
          onClose={() => setConfirmarCancelar(null)}
        >
          <p className="mb-3">
            Cancelar a venda #{confirmarCancelar.id_venda || confirmarCancelar.id}? O estoque será revertido automaticamente.
          </p>
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmarCancelar(null)}
              disabled={salvando}
            >
              Voltar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmarCancelar}
              disabled={salvando}
            >
              {salvando ? 'Cancelando...' : 'Cancelar Venda'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}