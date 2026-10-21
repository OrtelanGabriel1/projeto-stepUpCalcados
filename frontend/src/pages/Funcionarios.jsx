
import React, { useState, useEffect, useCallback } from 'react';
import { createResourceService } from '../services/resourceService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import Toast from '../components/Toast';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';

const funcionarioService = createResourceService('funcionario');

export default function Funcionarios() {
  const auth = useAuth();
  const usuarioLogado = auth?.funcionario || auth?.usuario || auth?.user;
  const loggedUserId = usuarioLogado?.id_funcionario || usuarioLogado?.id;

  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [toast, setToast] = useState({ mensagem: '', tipo: '' });

  const [modalAberto, setModalAberto] = useState(false);
  const [funcionarioEditando, setFuncionarioEditando] = useState(null);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo_funcionario: 'vendedor'
  });
  const [salvando, setSalvando] = useState(false);
  const [confirmarDelete, setConfirmarDelete] = useState(null);

  const carregarFuncionarios = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const response = await funcionarioService.listar();

      // O serviço retorna diretamente response.data do Axios.
      // A API pode retornar um array diretamente ou dentro de "dados".
      const dados = Array.isArray(response)
        ? response
        : Array.isArray(response?.dados)
          ? response.dados
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setFuncionarios(dados);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);

      const mensagemErro =
        err.response?.data?.mensagem ||
        err.response?.data?.erro ||
        'Erro ao carregar a lista de funcionários.';

      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarFuncionarios();
  }, [carregarFuncionarios]);

  const handleNovo = () => {
    setFuncionarioEditando(null);
    setForm({
      nome: '',
      email: '',
      senha: '',
      tipo_funcionario: 'vendedor'
    });
    setModalAberto(true);
  };

  const handleEditar = (funcionario) => {
    setFuncionarioEditando(funcionario);
    setForm({
      nome: funcionario.nome || '',
      email: funcionario.email || '',
      senha: '',
      tipo_funcionario: funcionario.tipo_funcionario || 'vendedor'
    });
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setFuncionarioEditando(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      if (funcionarioEditando) {
        const id =
          funcionarioEditando.id_funcionario ||
          funcionarioEditando.id;

        await funcionarioService.atualizar(id, form);

        setToast({
          mensagem: 'Funcionário atualizado com sucesso!',
          tipo: 'success'
        });
      } else {
        await funcionarioService.criar(form);

        setToast({
          mensagem: 'Funcionário cadastrado com sucesso!',
          tipo: 'success'
        });
      }

      handleFecharModal();
      await carregarFuncionarios();
    } catch (err) {
      console.error('Erro ao salvar funcionário:', err);

      const msgErro =
        err.response?.data?.mensagem ||
        err.response?.data?.erro ||
        'Erro ao salvar dados do funcionário.';

      setToast({ mensagem: msgErro, tipo: 'danger' });
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async () => {
    if (!confirmarDelete) return;

    try {
      const id =
        confirmarDelete.id_funcionario ||
        confirmarDelete.id;

      await funcionarioService.deletar(id);

      setToast({
        mensagem: 'Funcionário excluído com sucesso!',
        tipo: 'success'
      });

      setConfirmarDelete(null);
      await carregarFuncionarios();
    } catch (err) {
      console.error('Erro ao excluir funcionário:', err);

      const msgErro =
        err.response?.data?.mensagem ||
        err.response?.data?.erro ||
        'Erro ao excluir funcionário.';

      setToast({ mensagem: msgErro, tipo: 'danger' });
      setConfirmarDelete(null);
    }
  };

  const renderBadgeTipo = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'admin':
        return <span className="badge bg-danger">admin</span>;
      case 'gerente':
        return <span className="badge bg-warning text-dark">gerente</span>;
      case 'vendedor':
        return <span className="badge bg-primary">vendedor</span>;
      default:
        return (
          <span className="badge bg-secondary">
            {tipo || 'vendedor'}
          </span>
        );
    }
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
        titulo="Funcionários"
        botaoTexto="+ Novo Funcionário"
        onBotaoClick={handleNovo}
      />

      {erro && (
        <div className="alert alert-danger" role="alert">
          {erro}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={carregarFuncionarios}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: '60px' }}>#</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Email</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Status</th>
                  <th
                    scope="col"
                    className="text-end"
                    style={{ width: '180px' }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {funcionarios.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4 text-muted"
                    >
                      Nenhum funcionário cadastrado.
                    </td>
                  </tr>
                ) : (
                  funcionarios.map((func, index) => {
                    const idFunc =
                      func.id_funcionario || func.id;

                    const eProprioUsuario =
                      loggedUserId != null &&
                      String(idFunc) === String(loggedUserId);

                    return (
                      <tr key={idFunc || index}>
                        <td>{idFunc || index + 1}</td>
                        <td className="fw-semibold">{func.nome}</td>
                        <td>{func.email}</td>
                        <td>{renderBadgeTipo(func.tipo_funcionario)}</td>
                        <td>
                          <span
                            className={`badge ${
                              String(func.status).toLowerCase() === 'inativo'
                                ? 'bg-secondary'
                                : 'bg-success'
                            }`}
                          >
                            {func.status || 'Ativo'}
                          </span>
                        </td>
                        <td className="text-end">
                          {eProprioUsuario ? (
                            <span className="text-muted fw-normal">
                              (você)
                            </span>
                          ) : (
                            <div className="d-inline-flex align-items-center">
                              <button
                                type="button"
                                className="btn btn-outline-info me-2"
                                onClick={() => handleEditar(func)}
                                title="Editar funcionário"
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => setConfirmarDelete(func)}
                                title="Excluir funcionário"
                              >
                                Excluir
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        id="modalFuncionario"
        titulo={
          funcionarioEditando
            ? 'Editar Funcionário'
            : 'Novo Funcionário'
        }
        aberto={modalAberto}
        onClose={handleFecharModal}
      >
        <form onSubmit={handleSalvar}>
          <div className="mb-3">
            <label htmlFor="nome" className="form-label">
              Nome
            </label>
            <input
              type="text"
              className="form-control"
              id="nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="tipo_funcionario" className="form-label">
              Tipo
            </label>
            <select
              className="form-select"
              id="tipo_funcionario"
              name="tipo_funcionario"
              value={form.tipo_funcionario}
              onChange={handleChange}
              required
            >
              <option value="vendedor">vendedor</option>
              <option value="gerente">gerente</option>
              <option value="admin">admin</option>
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="senha" className="form-label">
              Senha
            </label>
            <input
              type="password"
              className="form-control"
              id="senha"
              name="senha"
              value={form.senha}
              onChange={handleChange}
              minLength={6}
              required={!funcionarioEditando}
              placeholder={
                funcionarioEditando
                  ? 'Preencha somente se desejar alterar a senha'
                  : 'Mínimo 6 caracteres'
              }
            />
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleFecharModal}
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

      {confirmarDelete && (
        <Modal
          id="modalConfirmarDelete"
          titulo="Confirmar Exclusão"
          aberto={Boolean(confirmarDelete)}
          onClose={() => setConfirmarDelete(null)}
        >
          <p className="mb-0">
            Tem certeza de que deseja excluir o funcionário{' '}
            <strong>{confirmarDelete.nome}</strong>?
          </p>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setConfirmarDelete(null)}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeletar}
            >
              Excluir
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
