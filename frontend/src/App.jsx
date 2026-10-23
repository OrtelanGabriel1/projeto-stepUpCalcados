
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import SenhaObrigatoriaModal from './components/SenhaObrigatoriaModal';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Produtos from './pages/Produtos';
import Estoque from './pages/Estoque';
import Vendas from './pages/Vendas';
import Movimentacoes from './pages/Movimentacoes';
import Categorias from './pages/Categorias';
import Funcionarios from './pages/Funcionarios';
import HistoricoPrecos from './pages/HistoricoPrecos';

import { useAuth } from './context/AuthContext';

export default function App() {
  const { funcionario } = useAuth();

  const tipoFuncionario = String(
    funcionario?.tipo ||
    funcionario?.tipo_funcionario ||
    ''
  ).toLowerCase();

  const ehGerente = tipoFuncionario === 'gerente';

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/movimentacoes" element={<Movimentacoes />} />
            <Route path="/categorias" element={<Categorias />} />

            <Route
              path="/funcionarios"
              element={
                ehGerente
                  ? <Funcionarios />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/historico-precos"
              element={<HistoricoPrecos />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <SenhaObrigatoriaModal />
    </>
  );
}
