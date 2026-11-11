import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../services/api'
import { createResourceService } from '../services/resourceService'
import { useAuth } from '../context/AuthContext'
import { formatarMoeda, formatarData, formatarCpfCnpj, validarCpfCnpj } from '../utils'
import Loading from '../components/Loading'
import Toast from '../components/Toast'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'

const vendaService = createResourceService('venda')
const produtoService = createResourceService('produto')

const CARGOS_PODEM_VENDER = ['vendedor', 'gerente']

const statusPagamentoLabel = (status) =>
  String(status || '').toLowerCase() === 'pago' ? 'Concluído' : 'Pendente'

const statusEntregaLabel = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'entregue') return 'Concluído'
  if (s === 'em_transito' || s === 'em transito') return 'Em trânsito'
  return 'Pendente'
}

export default function Vendas() {
  const { funcionario } = useAuth()
  const tipoFuncionario = String(
    funcionario?.tipo || funcionario?.tipo_funcionario || ''
  ).toLowerCase()

  if (tipoFuncionario === 'estoquista') {
    return <Navigate to="/" replace />
  }

  const podeRegistrarVenda = CARGOS_PODEM_VENDER.includes(tipoFuncionario)

  const [vendas, setVendas] = useState([])
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [toast, setToast] = useState({ mensagem: '', tipo: '' })

  const [modalConfirmarPagamento, setModalConfirmarPagamento] = useState(false)
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState(false)
  const [modalNovaVenda, setModalNovaVenda] = useState(false)
  const [vendaSelecionadaPagamento, setVendaSelecionadaPagamento] = useState('')
  const [vendaSelecionadaEntrega, setVendaSelecionadaEntrega] = useState('')
  const [etapa, setEtapa] = useState(1)
  const [modalDetalhes, setModalDetalhes] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const [form, setForm] = useState({
    id_funcionario: funcionario?.id_funcionario || '',
    forma_pagamento: '',
    itens: [],
    nome_comprador: '',
    cnpj: '',
    endereco: '',
    data_pedido: '',
    data_entrega_prevista: ''
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
      itens: [],
      nome_comprador: '',
      cnpj: '',
      endereco: '',
      data_pedido: new Date().toISOString().slice(0, 10),
      data_entrega_prevista: ''
    })
    setItemAtual({ id_produto: '', quantidade: 1 })
    setEtapa(1)
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

  const validarEtapa1 = () => {
    if (form.itens.length === 0) {
      setToast({ mensagem: 'Adicione pelo menos 1 item à venda.', tipo: 'danger' })
      return false
    }
    return true
  }

  const validarEtapa2 = () => {
    if (!form.nome_comprador.trim()) {
      setToast({ mensagem: 'Informe o nome do comprador.', tipo: 'danger' })
      return false
    }
    if (!validarCpfCnpj(form.cnpj)) {
      setToast({ mensagem: 'Informe um CPF ou CNPJ válido.', tipo: 'danger' })
      return false
    }
    if (!form.endereco.trim()) {
      setToast({ mensagem: 'Informe o endereço.', tipo: 'danger' })
      return false
    }
    if (!form.data_pedido) {
      setToast({ mensagem: 'Informe a data do pedido.', tipo: 'danger' })
      return false
    }
    if (!form.data_entrega_prevista) {
      setToast({ mensagem: 'Informe a data prevista de entrega.', tipo: 'danger' })
      return false
    }
    if (form.data_entrega_prevista < form.data_pedido) {
      setToast({ mensagem: 'A data prevista de entrega não pode ser anterior à data do pedido.', tipo: 'danger' })
      return false
    }
    return true
  }

  const handleAvancar = () => {
    if (etapa === 1 && !validarEtapa1()) return
    if (etapa === 2 && !validarEtapa2()) return
    setEtapa((prev) => Math.min(prev + 1, 3))
  }

  const handleVoltar = () => {
    setEtapa((prev) => Math.max(prev - 1, 1))
  }

  const handleRegistrarVenda = async (e) => {
    if (e) e.preventDefault()

    setSalvando(true)

    try {
      const payload = {
        forma_pagamento: form.forma_pagamento,
        itens: form.itens.map((item) => ({
          id_produto: Number(item.id_produto),
          quantidade: Number(item.quantidade)
        })),
        nome_comprador: form.nome_comprador.trim(),
        cnpj: form.cnpj,
        endereco: form.endereco.trim(),
        data_pedido: form.data_pedido,
        data_entrega_prevista: form.data_entrega_prevista,
        status_pagamento: 'pendente',
        status_entrega: 'pendente'
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

  const marcarComoPago = async (id) => {
    try {
      await api.patch(`/venda/${id}/status`, { status_pagamento: 'pago' })
      setToast({ mensagem: 'Pagamento marcado como concluído.', tipo: 'success' })
      carregarDados()
    } catch (err) {
      setToast({ mensagem: err.response?.data?.mensagem || err.message || 'Erro ao atualizar pagamento.', tipo: 'danger' })
    }
  }

  const marcarComoEntregue = async (id) => {
    try {
      await api.patch(`/venda/${id}/status`, { status_entrega: 'entregue' })
      setToast({ mensagem: 'Entrega marcada como concluída.', tipo: 'success' })
      carregarDados()
    } catch (err) {
      setToast({ mensagem: err.response?.data?.mensagem || err.message || 'Erro ao atualizar entrega.', tipo: 'danger' })
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

  const renderFormaPagamento = (forma) => {
    const formaLower = forma?.toLowerCase() || ''
    switch (formaLower) {
      case 'dinheiro':
        return 'Dinheiro'
      case 'pix':
        return 'Pix'
      case 'credito':
      case 'crédito':
        return 'Crédito'
      case 'debito':
      case 'débito':
        return 'Débito'
      case 'boleto':
        return 'Boleto'
      default:
        return forma || '-'
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
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success shadow-sm" onClick={() => { setVendaSelecionadaPagamento(''); setModalConfirmarPagamento(true) }}>
            Confirmar Pagamento
          </button>
          <button className="btn btn-outline-primary shadow-sm" onClick={() => { setVendaSelecionadaEntrega(''); setModalConfirmarEntrega(true) }}>
            Confirmar Entrega
          </button>
          {podeRegistrarVenda && (
            <button className="btn btn-primary shadow-sm" onClick={abrirModalNovaVenda}>
              <i className="bi bi-plus-lg me-1"></i> Nova Venda
            </button>
          )}
        </div>
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
                <th>Comprador</th>
                <th>Data</th>
                <th>Forma Pagamento</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Entrega</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              ) : (
                vendas.map((venda) => {
                  const id = venda.id_venda || venda.id
                  const status = (venda.status || '').toLowerCase()
                  const cancelada = status === 'cancelada'
                  const paga = String(venda.status_pagamento || '').toLowerCase() === 'pago'

                  return (
                    <tr key={id} className={cancelada ? 'table-secondary text-muted' : ''}>
                      <td>{venda.nome_comprador || venda.nome_funcionario || 'Sistema'}</td>
                      <td>{formatarData(venda.data_venda || venda.data_pedido || venda.created_at || venda.data)}</td>
                      <td>{renderFormaPagamento(venda.forma_pagamento)}</td>
                      <td className="fw-bold">{formatarMoeda(venda.valor_total || venda.total || 0)}</td>
                      <td>
                        {paga ? (
                          <span className={`badge bg-success`}>
                            {statusPagamentoLabel(venda.status_pagamento)}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            disabled={cancelada}
                            onClick={() => marcarComoPago(id)}
                            title="Marcar pagamento como pago"
                          >
                            {statusPagamentoLabel(venda.status_pagamento)}
                          </button>
                        )}
                      </td>
                      <td>
                        {String(venda.status_entrega || '').toLowerCase() === 'entregue' ? (
                          <span className={`badge bg-success`}>
                            {statusEntregaLabel(venda.status_entrega)}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            disabled={cancelada}
                            onClick={() => marcarComoEntregue(id)}
                            title="Marcar entrega como entregue"
                          >
                            {statusEntregaLabel(venda.status_entrega)}
                          </button>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info me-2"
                            onClick={() => handleVerDetalhes(id)}
                            title="Ver detalhes da venda"
                          >
                            Detalhes
                          </button>
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
          titulo="Nova Venda"
          show={modalNovaVenda}
          onClose={fecharModalNovaVenda}
          largura="720px"
        >
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Etapa {etapa} de 3</h6>
              <div>
                {etapa > 1 && (
                  <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={handleVoltar}>
                    Voltar
                  </button>
                )}
                {etapa < 3 && (
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleAvancar}>
                    Avançar
                  </button>
                )}
              </div>
            </div>
            <div className="progress mt-2" style={{ height: '6px' }}>
              <div className="progress-bar" style={{ width: `${(etapa / 3) * 100}%` }}></div>
            </div>
          </div>

          {etapa === 1 && (
            <div>
              <h6 className="fw-bold border-bottom pb-2">1. Inserção de Produtos</h6>
              <div className="row g-2 align-items-end mb-3">
                <div className="col-md-5">
                  <label className="form-label fw-semibold small">Produto</label>
                  <select
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
                  <label className="form-label fw-semibold small">Qtd</label>
                  <input
                    type="number"
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
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRemoverItem(item.id_produto)}
                            >
                              Remover
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
          )}

          {etapa === 2 && (
            <div>
              <h6 className="fw-bold border-bottom pb-2">2. Informações do Comprador e Logística</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nome da Empresa / Nome Completo *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.nome_comprador}
                  onChange={(e) => setForm((prev) => ({ ...prev, nome_comprador: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">CPF ou CNPJ *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.cnpj}
                  onChange={(e) => setForm((prev) => ({ ...prev, cnpj: formatarCpfCnpj(e.target.value) }))}
                  placeholder="CPF ou CNPJ"
                  inputMode="numeric"
                  maxLength={18}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Endereço completo *</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={form.endereco}
                  onChange={(e) => setForm((prev) => ({ ...prev, endereco: e.target.value }))}
                  required
                />
              </div>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Data do Pedido *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.data_pedido}
                    onChange={(e) => setForm((prev) => ({ ...prev, data_pedido: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Data Prevista de Entrega *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={form.data_entrega_prevista}
                    min={form.data_pedido}
                    onChange={(e) => setForm((prev) => ({ ...prev, data_entrega_prevista: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div>
              <h6 className="fw-bold border-bottom pb-2">3. Forma de Pagamento e Finalização</h6>
              <div className="mb-3">
                <label className="form-label fw-semibold">Forma de Pagamento *</label>
                <select
                  className="form-select"
                  value={form.forma_pagamento}
                  onChange={(e) => setForm((prev) => ({ ...prev, forma_pagamento: e.target.value }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="pix">Pix</option>
                  <option value="credito">Cartão de Crédito</option>
                  <option value="debito">Cartão de Débito</option>
                  <option value="boleto">Boleto</option>
                  <option value="dinheiro">Dinheiro</option>
                </select>
              </div>

              <div className="text-end fw-bold fs-5 mb-3">
                Total: {formatarMoeda(calcularTotalForm())}
              </div>

              <div className="d-flex justify-content-end pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleRegistrarVenda}
                  disabled={salvando || !form.forma_pagamento}
                >
                  {salvando ? 'Concluindo...' : 'Concluir Venda'}
                </button>
              </div>
            </div>
          )}
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
                <strong>Comprador:</strong> {modalDetalhes.nome_comprador || '-'}
              </div>
              <div className="col-6">
                <strong>CNPJ:</strong> {modalDetalhes.cnpj || '-'}
              </div>
              <div className="col-12">
                <strong>Endereço:</strong> {modalDetalhes.endereco || '-'}
              </div>
              <div className="col-6">
                <strong>Vendedor:</strong> {modalDetalhes.nome_funcionario || modalDetalhes.funcionario?.nome || '-'}
              </div>
              <div className="col-6">
                <strong>Data do Pedido:</strong> {formatarData(modalDetalhes.data_pedido || modalDetalhes.data_venda || modalDetalhes.created_at)}
              </div>
              <div className="col-6">
                <strong>Entrega Prevista:</strong> {formatarData(modalDetalhes.data_entrega_prevista)}
              </div>
              <div className="col-6">
                <strong>Forma de Pagamento:</strong> {renderFormaPagamento(modalDetalhes.forma_pagamento)}
              </div>
              <div className="col-6">
                <strong>Status Pagamento:</strong> {statusPagamentoLabel(modalDetalhes.status_pagamento)}
              </div>
              <div className="col-6">
                <strong>Status Entrega:</strong> {statusEntregaLabel(modalDetalhes.status_entrega)}
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

          <div className="d-flex justify-content-end pt-2 border-top gap-2">
            {String(modalDetalhes.status_pagamento || '').toLowerCase() !== 'pago' && (
              <button
                type="button"
                className="btn btn-success"
                onClick={async () => {
                  await marcarComoPago(modalDetalhes.id_venda || modalDetalhes.id)
                  const res = await api.get(`/venda/${modalDetalhes.id_venda || modalDetalhes.id}`)
                  setModalDetalhes(res.data?.dados || res.data || modalDetalhes)
                }}
              >
                Marcar como Pago
              </button>
            )}
            {String(modalDetalhes.status_entrega || '').toLowerCase() !== 'entregue' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  await marcarComoEntregue(modalDetalhes.id_venda || modalDetalhes.id)
                  const res = await api.get(`/venda/${modalDetalhes.id_venda || modalDetalhes.id}`)
                  setModalDetalhes(res.data?.dados || res.data || modalDetalhes)
                }}
              >
                Marcar como Entregue
              </button>
            )}
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

      {modalConfirmarPagamento && (
        <Modal
          titulo="Confirmar Pagamento"
          show={modalConfirmarPagamento}
          onClose={() => setModalConfirmarPagamento(false)}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Selecione a venda</label>
            <select
              className="form-select"
              value={vendaSelecionadaPagamento}
              onChange={(e) => setVendaSelecionadaPagamento(e.target.value)}
            >
              <option value="">Selecione...</option>
              {vendas
                .filter((v) => String(v.status_pagamento || '').toLowerCase() !== 'pago')
                .map((v) => (
                  <option key={v.id_venda || v.id} value={v.id_venda || v.id}>
                    #{v.id_venda || v.id} - {v.nome_comprador || v.nome_funcionario || 'Sistema'} - {formatarMoeda(v.valor_total || v.total || 0)}
                  </option>
                ))}
            </select>
          </div>
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalConfirmarPagamento(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-success"
              disabled={!vendaSelecionadaPagamento}
              onClick={async () => {
                await marcarComoPago(vendaSelecionadaPagamento)
                setModalConfirmarPagamento(false)
              }}
            >
              Confirmar Pagamento
            </button>
          </div>
        </Modal>
      )}

      {modalConfirmarEntrega && (
        <Modal
          titulo="Confirmar Entrega"
          show={modalConfirmarEntrega}
          onClose={() => setModalConfirmarEntrega(false)}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Selecione a venda</label>
            <select
              className="form-select"
              value={vendaSelecionadaEntrega}
              onChange={(e) => setVendaSelecionadaEntrega(e.target.value)}
            >
              <option value="">Selecione...</option>
              {vendas
                .filter((v) => String(v.status_entrega || '').toLowerCase() !== 'entregue')
                .map((v) => (
                  <option key={v.id_venda || v.id} value={v.id_venda || v.id}>
                    #{v.id_venda || v.id} - {v.nome_comprador || v.nome_funcionario || 'Sistema'} - {formatarMoeda(v.valor_total || v.total || 0)}
                  </option>
                ))}
            </select>
          </div>
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalConfirmarEntrega(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!vendaSelecionadaEntrega}
              onClick={async () => {
                await marcarComoEntregue(vendaSelecionadaEntrega)
                setModalConfirmarEntrega(false)
              }}
            >
              Confirmar Entrega
            </button>
          </div>
        </Modal>
      )}

    </div>
  )
}
