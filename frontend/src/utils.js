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

export function formatarCpfCnpj(valor) {
  const digitos = String(valor || '').replace(/\D/g, '').slice(0, 14);

  if (digitos.length <= 11) {
    if (digitos.length <= 3) return digitos;
    if (digitos.length <= 6) return `${digitos.slice(0, 3)}.${digitos.slice(3)}`;
    if (digitos.length <= 9) return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6)}`;
    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 5) return `${digitos.slice(0, 2)}.${digitos.slice(2)}`;
  if (digitos.length <= 8) return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
  if (digitos.length <= 12) return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`;
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
}

export function validarCpfCnpj(valor) {
  const digitos = String(valor || '').replace(/\D/g, '');

  if (/^(\d)\1+$/.test(digitos)) return false;

  if (digitos.length === 11) {
    const calcularDigito = (base, pesoInicial) => {
      const soma = base
        .split('')
        .reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const primeiro = calcularDigito(digitos.slice(0, 9), 10);
    const segundo = calcularDigito(digitos.slice(0, 9) + primeiro, 11);
    return digitos.endsWith(`${primeiro}${segundo}`);
  }

  if (digitos.length === 14) {
    const calcularDigito = (base, pesos) => {
      const soma = base
        .split('')
        .reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const primeiro = calcularDigito(digitos.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    const segundo = calcularDigito(digitos.slice(0, 12) + primeiro, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
    return digitos.endsWith(`${primeiro}${segundo}`);
  }

  return false;
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