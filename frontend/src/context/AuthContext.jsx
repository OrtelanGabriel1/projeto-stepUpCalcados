// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [token, setToken] = useState(null);
  const [funcionario, setFuncionario] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedFuncionario = localStorage.getItem('funcionario');

    if (storedToken && storedFuncionario) {
      try {
        setToken(storedToken);
        setFuncionario(JSON.parse(storedFuncionario));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('funcionario');
      }
    }
  }, []);

  const login = async (email, senha) => {
    const resultado = await authService.login(email, senha);

    if (resultado && resultado.sucesso) {
      const { token: novoToken, funcionario: novoFuncionario } = resultado.dados;

      localStorage.setItem('token', novoToken);
      localStorage.setItem('funcionario', JSON.stringify(novoFuncionario));

      setToken(novoToken);
      setFuncionario(novoFuncionario);
    }

    return resultado;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('funcionario');
    setToken(null);
    setFuncionario(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, funcionario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}