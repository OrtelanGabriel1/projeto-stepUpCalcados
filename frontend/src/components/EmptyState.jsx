export default function EmptyState({ text = "Nenhum registro encontrado." }) {
  return <div className="empty-state">{text}</div>;
}
