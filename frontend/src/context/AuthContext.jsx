
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import authService from '../services/authService';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('token')
  );

  const [funcionario, setFuncionario] = useState(() => {
    try {
      const salvo = localStorage.getItem('funcionario');
      return salvo ? JSON.parse(salvo) : null;
    } catch {
      return null;
    }
  });

  const [senhaPrecisaAtualizar, setSenhaPrecisaAtualizar] = useState(
    () => localStorage.getItem('senhaPrecisaAtualizar') === 'true'
  );

  useEffect(() => {
    if (!token || !funcionario) {
      localStorage.removeItem('token');
      localStorage.removeItem('funcionario');
      localStorage.removeItem('senhaPrecisaAtualizar');

      setToken(null);
      setFuncionario(null);
      setSenhaPrecisaAtualizar(false);
    }
  }, []);

  const login = async (email, senha) => {
    const resultado = await authService.login(email, senha);

    if (resultado?.sucesso) {
      const novoToken = resultado.token;
      const novoFuncionario = resultado.funcionario;

      const precisaAtualizar = Boolean(
        resultado.senhaPrecisaAtualizar ??
        novoFuncionario?.senhaPrecisaAtualizar
      );

      localStorage.setItem('token', novoToken);
      localStorage.setItem(
        'funcionario',
        JSON.stringify(novoFuncionario)
      );
      localStorage.setItem(
        'senhaPrecisaAtualizar',
        String(precisaAtualizar)
      );

      setToken(novoToken);
      setFuncionario(novoFuncionario);
      setSenhaPrecisaAtualizar(precisaAtualizar);
    }

    return resultado;
  };

  const alterarSenha = async (novaSenha) => {
    if (!novaSenha || novaSenha.length < 6) {
      throw new Error(
        'A senha deve ter pelo menos 6 caracteres.'
      );
    }

    const resultado = await authService.alterarSenha(novaSenha);

    if (resultado?.sucesso) {
      // O backend precisa fornecer um token atualizado.
      if (!resultado.token) {
        throw new Error(
          'A senha foi alterada, mas o servidor não retornou um novo token. Verifique o backend.'
        );
      }

      const funcionarioAtualizado = {
        ...funcionario,
        senhaPrecisaAtualizar: false
      };

      localStorage.setItem('token', resultado.token);
      localStorage.setItem(
        'funcionario',
        JSON.stringify(funcionarioAtualizado)
      );
      localStorage.setItem('senhaPrecisaAtualizar', 'false');

      setToken(resultado.token);
      setFuncionario(funcionarioAtualizado);
      setSenhaPrecisaAtualizar(false);
    }

    return resultado;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('funcionario');
    localStorage.removeItem('senhaPrecisaAtualizar');

    setToken(null);
    setFuncionario(null);
    setSenhaPrecisaAtualizar(false);

    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        funcionario,
        login,
        logout,
        senhaPrecisaAtualizar,
        alterarSenha
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
