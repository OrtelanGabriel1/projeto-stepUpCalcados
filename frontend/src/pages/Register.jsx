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

    if (senha !== confirmarSenha) {
      setErro('As palavras-passe não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      await authService.register({
        nome,
        email,
        senha,
        tipo_funcionario: tipoFuncionario,
      });
      navigate('/login', { state: { mensagemSucesso: 'Registo efetuado com sucesso! Efetue o seu login.' } });
    } catch (err) {
      setErro(err.response?.data?.mensagem || 'Erro ao efetuar o registo do utilizador.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-light d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="card shadow-sm rounded-3 w-100" style={{ maxWidth: '420px' }}>
        <div className="card-header bg-primary text-white text-center py-3">
          <h4 className="mb-1">👟 StepUp Calçados</h4>
          <small>Criar Nova Conta</small>
        </div>
        <div className="card-body p-4">
          <h5 className="card-title text-center mb-4">Registo de Utilizador</h5>

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

            <div className="mb-3">
              <label htmlFor="confirmarSenha" className="form-label">
                Confirmar Palavra-passe
              </label>
              <input
                type="password"
                className="form-control"
                id="confirmarSenha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
                  A registar...
                </>
              ) : (
                'Cadastrar'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <small>
              Já tem uma conta? <Link to="/login" className="text-decoration-none">Voltar ao Login</Link>
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