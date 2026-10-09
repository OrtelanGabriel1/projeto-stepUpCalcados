// frontend/src/components/Modal.jsx
import React from 'react';

const Modal = ({
  show = false,
  titulo = '',
  onClose = () => {},
  onConfirmar = () => {},
  children = null,
  textoBotao = 'Salvar',
  tipoBotao = 'primary',
  carregando = false,
}) => {
  if (!show) {
    return null;
  }

  return (
    <>
      {/* Backdrop de fundo */}
      <div
        className="modal-backdrop fade show"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1040,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Container do Modal */}
      <div
        className="modal fade show"
        tabIndex="-1"
        aria-modal="true"
        role="dialog"
        style={{
          display: 'flex',
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1050,
          overflowY: 'auto',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '3rem',
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '520px',
            margin: '0 1rem',
          }}
        >
          <div className="modal-content">
            {/* Cabeçalho */}
            <div className="modal-header">
              <h5 className="modal-title">{titulo}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={carregando}
                aria-label="Fechar"
              />
            </div>

            {/* Corpo */}
            <div className="modal-body">{children}</div>

            {/* Rodapé */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={carregando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`btn btn-${tipoBotao}`}
                onClick={onConfirmar}
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Salvando...
                  </>
                ) : (
                  textoBotao
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;