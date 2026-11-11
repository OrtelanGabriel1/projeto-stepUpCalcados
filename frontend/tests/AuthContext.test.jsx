import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import authService from '../src/services/authService';
import AuthProvider, { useAuth } from '../src/context/AuthContext';

jest.mock('../src/services/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    alterarSenha: jest.fn()
  }
}));

function AuthProbe() {
  const { token, funcionario, login } = useAuth();

  const entrar = async () => {
    await login('ana@example.com', 'senha-segura');
  };

  return (
    <div>
      <output aria-label="token">{token || 'sem token'}</output>
      <output aria-label="funcionário">{funcionario?.nome || 'sem funcionário'}</output>
      <button type="button" onClick={entrar}>Entrar</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('persiste os dados quando o login é bem-sucedido', async () => {
    authService.login.mockResolvedValue({
      sucesso: true,
      token: 'token-teste',
      funcionario: { id: 7, nome: 'Ana' },
      senhaPrecisaAtualizar: true
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    });

    await waitFor(() => {
      expect(screen.getByLabelText('token')).toHaveTextContent('token-teste');
    });

    expect(screen.getByLabelText('funcionário')).toHaveTextContent('Ana');
    expect(localStorage.getItem('token')).toBe('token-teste');
    expect(JSON.parse(localStorage.getItem('funcionario'))).toEqual({
      id: 7,
      nome: 'Ana'
    });
    expect(localStorage.getItem('senhaPrecisaAtualizar')).toBe('true');
  });

  it('mantém a sessão encerrada quando o login falha', async () => {
    authService.login.mockResolvedValue({ sucesso: false });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    });

    expect(screen.getByLabelText('token')).toHaveTextContent('sem token');
    expect(localStorage.getItem('token')).toBeNull();
  });
});
