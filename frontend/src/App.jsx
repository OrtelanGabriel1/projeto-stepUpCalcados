
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register"; // Novo import
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Movimentacoes from "./pages/Movimentacoes";
import Categorias from "./pages/Categorias";
import Funcionarios from "./pages/Funcionarios";
import HistoricoPrecos from "./pages/HistoricoPrecos";
import { useAuth } from "./context/AuthContext";

export default function App() {
  // Verifica o tipo do funcionário conectado
  const { funcionario } = useAuth();

  const tipoFuncionario = String(
    funcionario?.tipo || funcionario?.tipo_funcionario || ""
  ).toLowerCase();

  const ehGerente = tipoFuncionario === "gerente";

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} /> {/* Nova rota */}

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/movimentacoes" element={<Movimentacoes />} />
          <Route path="/categorias" element={<Categorias />} />

          {/* Apenas gerentes podem acessar a página de funcionários */}
          <Route
            path="/funcionarios"
            element={
              ehGerente ? (
                <Funcionarios />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="/historico-precos" element={<HistoricoPrecos />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
