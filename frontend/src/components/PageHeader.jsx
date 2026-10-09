// frontend/src/components/PageHeader.jsx
import React from 'react';

const PageHeader = ({
  titulo = '',
  subtitulo = '',
  children = null,
}) => {
  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="mb-0 fw-bold">{titulo}</h2>
          {subtitulo && <p className="text-muted mb-0 mt-1">{subtitulo}</p>}
        </div>
        <div>{children}</div>
      </div>
      <hr className="mt-0" />
    </>
  );
};

export default PageHeader;