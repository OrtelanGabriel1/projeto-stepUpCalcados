import {
  calcularVariacaoPercentual,
  formatarData,
  formatarMoeda
} from '../src/utils';

describe('formatarMoeda', () => {
  it('formata valores numéricos em Real brasileiro', () => {
    expect(formatarMoeda(1234.5)).toContain('1.234,50');
  });

  it('usa zero quando o valor não é numérico', () => {
    expect(formatarMoeda('inválido')).toContain('0,00');
  });
});

describe('formatarData', () => {
  it('formata data e hora no padrão brasileiro', () => {
    const data = new Date(2024, 0, 15, 12, 34).toISOString();

    expect(formatarData(data)).toBe('15/01/2024 às 12:34');
  });

  it('retorna um traço para datas ausentes ou inválidas', () => {
    expect(formatarData('')).toBe('—');
    expect(formatarData('data inválida')).toBe('—');
  });
});

describe('calcularVariacaoPercentual', () => {
  it('calcula aumentos e reduções com sinal', () => {
    expect(calcularVariacaoPercentual(100, 120)).toBe('+20,00%');
    expect(calcularVariacaoPercentual(100, 80)).toBe('-20,00%');
  });

  it('retorna N/A quando o valor anterior é zero ou inválido', () => {
    expect(calcularVariacaoPercentual(0, 10)).toBe('N/A');
    expect(calcularVariacaoPercentual('inválido', 10)).toBe('N/A');
  });
});
