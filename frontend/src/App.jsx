import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Movimentacoes from "./pages/Movimentacoes";
import Categorias from "./pages/Categorias";
import Funcionarios from "./pages/Funcionarios";
import HistoricoPrecos from "./pages/HistoricoPrecos";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/movimentacoes" element={<Movimentacoes />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/historico-precos" element={<HistoricoPrecos />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}