// frontend/src/components/Loading.jsx
import React from 'react';

export default function Loading({ texto = "Carregando..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center flex-column gap-2 py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
      <p className="text-muted mb-0">{texto}</p>
    </div>
  );
}