import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mensagemSucesso = location.state?.mensagemSucesso;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-light d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm rounded-3 w-100" style={{ maxWidth: '400px' }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h4 className="mb-1">👟 StepUp Calçados</h4>
          <small>Sistema de Gestão</small>
        </div>
        <div className="card-body p-4">
          <h5 className="card-title text-center mb-4">Entrar no sistema</h5>

          {mensagemSucesso && (
            <div className="alert alert-success" role="alert">
              {mensagemSucesso}
            </div>
          )}

          {erro && (
            <div className="alert alert-danger" role="alert">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
              <label htmlFor="senha" className="form-label">
                Palavra-passe
              </label>
              <input
                type="password"
                className="form-control"
                id="senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-2"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* NOVO BOTÃO / LINK PARA REGISTO */}
          <div className="text-center mt-3 pt-2 border-top">
            <small className="d-block text-muted mb-2">Ainda não tem conta?</small>
            <Link to="/register" className="btn btn-outline-secondary btn-sm w-100">
              Criar nova conta
            </Link>
          </div>
        </div>
        <div className="card-footer bg-transparent text-muted text-center small py-3">
          StepUp Calçados © 2024
        </div>
      </div>
    </div>
  );
}