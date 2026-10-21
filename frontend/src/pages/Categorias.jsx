import React, { useState, useEffect } from "react";
import { createResourceService } from "../services/resourceService";
import Loading from "../components/Loading";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

const categoriaService = createResourceService("categoria");

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [toast, setToast] = useState({ mensagem: "", tipo: "" });

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [salvando, setSalvando] = useState(false);

  const [confirmarDelete, setConfirmarDelete] = useState(null);

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await categoriaService.listar();
      setCategorias(res.dados || []);
    } catch (err) {
      setErro(
        err.response?.data?.mensagem || "Erro ao carregar lista de categorias",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirNovoModal = () => {
    setCategoriaEditando(null);
    setForm({ nome: "", descricao: "" });
    setModalAberto(true);
  };

  const handleAbrirEditarModal = (categoria) => {
    setCategoriaEditando(categoria);
    setForm({
      nome: categoria.nome || "",
      descricao: categoria.descricao || "",
    });
    setModalAberto(true);
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      if (categoriaEditando) {
        await categoriaService.atualizar(categoriaEditando.id, form);
        setToast({
          mensagem: "Categoria atualizada com sucesso!",
          tipo: "success",
        });
      } else {
        await categoriaService.criar(form);
        setToast({
          mensagem: "Categoria criada com sucesso!",
          tipo: "success",
        });
      }
      setModalAberto(false);
      carregarCategorias();
    } catch (err) {
      setToast({
        mensagem: err.response?.data?.mensagem || "Erro ao salvar categoria",
        tipo: "danger",
      });
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async () => {
    if (!confirmarDelete) return;

    try {
      await categoriaService.deletar(confirmarDelete.id);
      setToast({
        mensagem: "Categoria excluída com sucesso!",
        tipo: "success",
      });
      setConfirmarDelete(null);
      carregarCategorias();
    } catch (err) {
      setToast({
        mensagem:
          err.response?.data?.mensagem ||
          "Erro ao excluir categoria (pode estar vinculada a outros registros)",
        tipo: "danger",
      });
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
          onClose={() => setToast({ mensagem: "", tipo: "" })}
        />
      )}

      <PageHeader titulo="Categorias" subtitulo="Gerenciamento de categorias">
        <button className="btn btn-primary" onClick={handleAbrirNovoModal}>
          + Nova Categoria
        </button>
      </PageHeader>

      {erro && (
        <div className="alert alert-danger" role="alert">
          {erro}
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {categorias.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover table-striped align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{item.id || index + 1}</td>
                      <td>{item.nome}</td>
                      <td>{item.descricao || "-"}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-info me-2"
                          onClick={() => handleAbrirEditarModal(item)}
                          title="Editar categoria"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => setConfirmarDelete(item)}
                          title="Excluir categoria"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3">
              <EmptyState mensagem="Nenhuma categoria cadastrada" />
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <Modal
          show={modalAberto}
          titulo={categoriaEditando ? "Editar Categoria" : "Nova Categoria"}
          onClose={() => setModalAberto(false)}
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
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="descricao" className="form-label">
                Descrição
              </label>
              <textarea
                className="form-control"
                id="descricao"
                rows="3"
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              ></textarea>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmarDelete && (
        <Modal
          titulo="Confirmar Exclusão"
          textoBotao="Excluir"
          tipoBotao="danger"
          onConfirm={handleDeletar}
          onClose={() => setConfirmarDelete(null)}
        >
          <p className="mb-0">
            Tem certeza que deseja excluir a categoria '{confirmarDelete.nome}'?
          </p>
        </Modal>
      )}
    </div>
  );
}
