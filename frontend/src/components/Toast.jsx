// frontend/src/components/Toast.jsx
import React, { useEffect, useState } from 'react';

export default function Toast({ mensagem, tipo = "success", show, variante, onClose }) {
  const visivel = show !== undefined ? !!show && !!mensagem : !!mensagem;
  const varianteFinal = variante || tipo || "success";
  const [fadeOut, setFadeOut] = useState(false);
  const [apareceu, setApareceu] = useState(false);

  useEffect(() => {
    if (!visivel) {
      setFadeOut(false);
      setApareceu(false);
      return;
    }
    setFadeOut(false);
    setApareceu(false);
    const showTimer = setTimeout(() => setApareceu(true), 10);
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const closeTimer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [visivel, mensagem]);

  if (!visivel) return null;

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

  const currentBgClass = bgClasses[varianteFinal] || bgClasses.success;
  const currentBtnCloseClass = btnCloseClasses[varianteFinal] || btnCloseClasses.success;

  return (
    <div
      className={`toast show ${currentBgClass} d-flex align-items-center p-3 rounded shadow`}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        opacity: fadeOut ? 0 : apareceu ? 1 : 0,
        transform: fadeOut ? 'translateY(-10px)' : apareceu ? 'translateY(0)' : 'translateY(-10px)'
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