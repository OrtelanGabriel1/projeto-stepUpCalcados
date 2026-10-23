
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';

export default function Register() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoFuncionario, setTipoFuncionario] = useState('Vendedor');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      await authService.register({
        nome,
        email,
        senha,
        tipo_funcionario: tipoFuncionario
      });

      navigate('/login', {
        state: {
          mensagemSucesso: 'Cadastro efetuado com sucesso! Faça seu login.'
        }
      });
    } catch (err) {
      setErro(
        err.response?.data?.mensagem ||
        'Erro ao cadastrar o usuário.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-light d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div
        className="card shadow-sm rounded-3 w-100"
        style={{ maxWidth: '420px' }}
      >
        <div className="card-header bg-primary text-white text-center py-3">
          <h4 className="mb-1">👟 StepUp Calçados</h4>
          <small>Criar Nova Conta</small>
        </div>

        <div className="card-body p-4">
          <h5 className="card-title text-center mb-4">
            Cadastro de Usuário
          </h5>

          {erro && (
            <div className="alert alert-danger" role="alert">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nome" className="form-label">
                Nome Completo
              </label>

              <input
                type="text"
                className="form-control"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                E-mail
              </label>

              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="tipoFuncionario" className="form-label">
                Cargo / Função
              </label>

              <select
                className="form-select"
                id="tipoFuncionario"
                value={tipoFuncionario}
                onChange={(e) => setTipoFuncionario(e.target.value)}
                required
              >
                <option value="Vendedor">Vendedor</option>
                <option value="Gerente">Gerente</option>
                <option value="Estoquista">Estoquista</option>
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
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />

              <small className="text-muted">
                A senha deve ter pelo menos 6 caracteres.
              </small>
            </div>

            <div className="mb-3">
              <label htmlFor="confirmarSenha" className="form-label">
                Confirmar Senha
              </label>

              <input
                type="password"
                className="form-control"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-2"
              disabled={carregando}
            >
              {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <div className="text-center mt-3">
            <small>
              Já tem uma conta?{' '}
              <Link to="/login" className="text-decoration-none">
                Voltar ao Login
              </Link>
            </small>
          </div>
        </div>

        <div className="card-footer bg-transparent text-muted text-center small py-3">
          StepUp Calçados © 2024
        </div>
      </div>
    </div>
  );
}
