// frontend/src/components/Toast.jsx
import React, { useEffect } from 'react';

export default function Toast({ mensagem, tipo = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!mensagem) return null;

  const bgClasses = {
    success: "text-bg-success",
    danger: "text-bg-danger",
    warning: "text-bg-warning text-dark"
  };

  const btnCloseClasses = {
    success: "btn-close btn-close-white",
    danger: "btn-close btn-close-white",
    warning: "btn-close"
  };

  const currentBgClass = bgClasses[tipo] || bgClasses.success;
  const currentBtnCloseClass = btnCloseClasses[tipo] || btnCloseClasses.success;

  return (
    <div
      className={`toast show ${currentBgClass} d-flex align-items-center p-3 rounded shadow`}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <span className="flex-grow-1 me-2">{mensagem}</span>
      <button
        type="button"
        className={currentBtnCloseClass}
        aria-label="Fechar"
        onClick={onClose}
      ></button>
    </div>
  );
}