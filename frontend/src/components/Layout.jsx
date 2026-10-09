// frontend/src/components/Layout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { funcionario, logout } = useAuth();

  const getNavLinkClass = ({ isActive }) =>
    `nav-link${isActive ? " active" : ""}`;

  return (
    <div className="d-flex">
      {/* SIDEBAR */}
      <div className="sidebar">
        {/* Seção Superior */}
        <div style={{ padding: "1.5rem 1rem 1rem" }}>
          <h5 className="fw-bold text-white mb-0">👟 StepUp</h5>
          <small className="text-muted">Calçados</small>
        </div>

        {/* Nav */}
        <nav className="flex-grow-1" style={{ padding: "0.5rem 0" }}>
          <NavLink to="/" end className={getNavLinkClass}>
            <i className="bi bi-house-door"></i> Dashboard
          </NavLink>
          <NavLink to="/produtos" className={getNavLinkClass}>
            <i className="bi bi-box-seam"></i> Produtos
          </NavLink>
          <NavLink to="/estoque" className={getNavLinkClass}>
            <i className="bi bi-archive"></i> Estoque
          </NavLink>
          <NavLink to="/vendas" className={getNavLinkClass}>
            <i className="bi bi-cart3"></i> Vendas
          </NavLink>
          <NavLink to="/movimentacoes" className={getNavLinkClass}>
            <i className="bi bi-arrow-left-right"></i> Movimentações
          </NavLink>
          <NavLink to="/categorias" className={getNavLinkClass}>
            <i className="bi bi-tag"></i> Categorias
          </NavLink>
          <NavLink to="/funcionarios" className={getNavLinkClass}>
            <i className="bi bi-people"></i> Funcionários
          </NavLink>
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
