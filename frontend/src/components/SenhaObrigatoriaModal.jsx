
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SenhaObrigatoriaModal() {
  const {
    senhaPrecisaAtualizar,
    alterarSenha,
    logout
  } = useAuth();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!senhaPrecisaAtualizar) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (novaSenha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      await alterarSenha(novaSenha);

      setNovaSenha('');
      setConfirmarSenha('');
    } catch (err) {
      setErro(
        err.response?.data?.mensagem ||
        'Não foi possível alterar a senha.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9999
      }}
    >
      <div
        className="card shadow-lg w-100"
        style={{ maxWidth: '440px' }}
      >
        <div className="card-header bg-warning">
          <h5 className="mb-0">
            Atualização obrigatória de senha
          </h5>
        </div>

        <div className="card-body">
          <p>
            Sua senha atual possui menos de 6 caracteres.
            Para continuar usando o StepUp Calçados, você
            precisa cadastrar uma nova senha.
          </p>

          {erro && (
            <div className="alert alert-danger" role="alert">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="novaSenhaObrigatoria"
                className="form-label"
              >
                Nova senha
              </label>

              <input
                id="novaSenhaObrigatoria"
                type="password"
                className="form-control"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />

              <small className="text-muted">
                Mínimo de 6 caracteres.
              </small>
            </div>

            <div className="mb-3">
              <label
                htmlFor="confirmarSenhaObrigatoria"
                className="form-label"
              >
                Confirmar nova senha
              </label>

              <input
                id="confirmarSenhaObrigatoria"
                type="password"
                className="form-control"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={carregando}
            >
              {carregando
                ? 'Salvando...'
                : 'Alterar senha e continuar'}
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary w-100 mt-2"
              onClick={logout}
              disabled={carregando}
            >
              Sair da conta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
