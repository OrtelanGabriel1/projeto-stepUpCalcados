import { fireEvent, render, screen } from '@testing-library/react';
import EmptyState from '../src/components/EmptyState';
import Loading from '../src/components/Loading';
import PageHeader from '../src/components/PageHeader';
import Toast from '../src/components/Toast';

describe('EmptyState', () => {
  it('exibe o texto padrão e permite personalização', () => {
    const { rerender } = render(<EmptyState />);
    expect(screen.getByText('Nenhum registro encontrado.')).toBeInTheDocument();

    rerender(<EmptyState text="Nenhum produto encontrado." />);
    expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
  });
});

describe('Loading', () => {
  it('exibe indicador acessível e texto informado', () => {
    render(<Loading texto="Carregando produtos..." />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('exibe título, subtítulo, conteúdo e linha por padrão', () => {
    const { container } = render(
      <PageHeader titulo="Produtos" subtitulo="Gerencie o catálogo">
        <button type="button">Novo produto</button>
      </PageHeader>
    );

    expect(screen.getByRole('heading', { name: 'Produtos' })).toBeInTheDocument();
    expect(screen.getByText('Gerencie o catálogo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Novo produto' })).toBeInTheDocument();
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('permite ocultar a linha divisória', () => {
    const { container } = render(<PageHeader titulo="Produtos" linha={false} />);

    expect(container.querySelector('hr')).not.toBeInTheDocument();
  });
});

describe('Toast', () => {
  it('não aparece sem mensagem', () => {
    render(<Toast mensagem="" />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('exibe mensagem, variante e permite fechar', () => {
    const onClose = jest.fn();
    render(
      <Toast
        mensagem="Produto salvo."
        show
        variante="danger"
        onClose={onClose}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Produto salvo.');
    expect(screen.getByRole('alert')).toHaveClass('text-bg-danger');

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
