
// frontend/src/components/Layout.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { funcionario, logout } = useAuth();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [temaEscuro, setTemaEscuro] = useState(
    () => localStorage.getItem("stepup-tema") === "escuro"
  );

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuAberto) return undefined;

    const fecharComEscape = (event) => {
      if (event.key === "Escape") setMenuAberto(false);
    };

    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [menuAberto]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-bs-theme",
      temaEscuro ? "dark" : "light"
    );
    localStorage.setItem("stepup-tema", temaEscuro ? "escuro" : "claro");
  }, [temaEscuro]);

  // Verifica se o funcionário conectado é gerente
  const tipoFuncionario = String(
    funcionario?.tipo || funcionario?.tipo_funcionario || ""
  ).toLowerCase();

  const ehGerente = tipoFuncionario === "gerente";
  const ehEstoquista = tipoFuncionario === "estoquista";

  const getNavLinkClass = ({ isActive }) =>
    `nav-link${isActive ? " active" : ""}`;

return (
    <div className="d-flex">
      <header className="mobile-header">
        <button
          type="button"
          className={`mobile-menu-toggle${menuAberto ? " menu-open" : ""}`}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="primary-navigation"
          onClick={() => setMenuAberto((aberto) => !aberto)}
        >
          <span className="mobile-menu-icon" aria-hidden="true" />
        </button>
        <div className="d-flex align-items-center gap-2">
          <img src="/logo_StepUp.png" alt="" />
          <span className="fw-bold">StepUp</span>
        </div>
      </header>

      {menuAberto && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`sidebar${menuAberto ? " sidebar-open" : ""}`}>
        {/* Seção Superior */}
        <div style={{ padding: "1.5rem 1rem 1rem" }} className="d-flex align-items-center gap-2">
          <img src="/logo_StepUp.png" alt="Logo StepUp" style={{ width: 64, height: 64, objectFit: "contain", marginLeft: "-0.75rem" }} />
          <div>
            <h5 className="fw-bold text-white mb-0">StepUp</h5>
            <small className="text-white">Calçados</small>
          </div>
        </div>

        {/* Nav */}
        <nav
          id="primary-navigation"
          aria-label="Navegação principal"
          className="flex-grow-1"
          style={{ padding: "0.5rem 0" }}
          onClick={() => setMenuAberto(false)}
        >
          <NavLink to="/" end className={getNavLinkClass}>
            <i className="bi bi-house-door"></i> Dashboard
          </NavLink>

          <NavLink to="/produtos" className={getNavLinkClass}>
            <i className="bi bi-box-seam"></i> Produtos
          </NavLink>

          <NavLink to="/estoque" className={getNavLinkClass}>
            <i className="bi bi-archive"></i> Estoque
          </NavLink>

          {!ehEstoquista && (
            <NavLink to="/vendas" className={getNavLinkClass}>
              <i className="bi bi-cart3"></i> Vendas
            </NavLink>
          )}

          <NavLink to="/movimentacoes" className={getNavLinkClass}>
            <i className="bi bi-arrow-left-right"></i> Movimentações
          </NavLink>

          <NavLink to="/categorias" className={getNavLinkClass}>
            <i className="bi bi-tag"></i> Categorias
          </NavLink>

          {/* Funcionários: somente gerentes podem visualizar */}
          {ehGerente && (
            <NavLink to="/funcionarios" className={getNavLinkClass}>
              <i className="bi bi-people"></i> Funcionários
            </NavLink>
          )}

          <NavLink to="/historico-precos" className={getNavLinkClass}>
            <i className="bi bi-graph-up"></i> Histórico de Preços
          </NavLink>
        </nav>

        {/* Rodapé da Sidebar */}
        <div
          style={{
            padding: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="d-flex flex-column">
            <button
              type="button"
              className="btn btn-sm btn-outline-light mb-3"
              onClick={() => setTemaEscuro((temaAtual) => !temaAtual)}
              aria-label={temaEscuro ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              <i
                className={`bi ${temaEscuro ? "bi-sun" : "bi-moon-stars"} me-2`}
                aria-hidden="true"
              />
              {temaEscuro ? "Modo claro" : "Modo escuro"}
            </button>
            <small className="text-muted">
              {funcionario?.nome || "Funcionário"}
            </small>
            <small className="fw-semibold text-white">
              {funcionario?.email || ""}
            </small>
          </div>

          <button
            onClick={logout}
            className="btn btn-sm btn-outline-danger mt-2 w-100"
          >
            Sair
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="main-content flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
}
