// frontend/src/utils.js

/**
 * Formata um número para a moeda Real (BRL).
 * Exemplo: 1234.5 -> "R$ 1.234,50"
 */
export function formatarMoeda(valor) {
  const numero = Number(valor) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numero);
}

/**
 * Formata uma string de data/ISO para o formato "dd/mm/aaaa às hh:mm".
 * Se a data for inválida ou falsy, retorna "—".
 */
export function formatarData(dataString) {
  if (!dataString) return '—';
  
  const data = new Date(dataString);
  if (isNaN(data.getTime())) return '—';

  const partes = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(data);

  const obj = {};
  partes.forEach(({ type, value }) => {
    obj[type] = value;
  });

  return `${obj.day}/${obj.month}/${obj.year} às ${obj.hour}:${obj.minute}`;
}

/**
 * Calcula a variação percentual entre dois valores.
 * Exemplo: (100, 120) -> "+20,00%", (100, 80) -> "-20,00%"
 * Se anterior for 0, retorna "N/A".
 */
export function calcularVariacaoPercentual(anterior, novo) {
  const valAnterior = Number(anterior);
  const valNovo = Number(novo);

  if (isNaN(valAnterior) || valAnterior === 0) {
    return 'N/A';
  }

  const variacao = (valNovo - valAnterior) / valAnterior;

  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  }).format(variacao);
}