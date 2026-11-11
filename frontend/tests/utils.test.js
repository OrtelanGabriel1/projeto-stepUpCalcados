import {
  calcularVariacaoPercentual,
  formatarData,
  formatarMoeda,
  formatarCpfCnpj,
  validarCpfCnpj
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

describe('CPF e CNPJ', () => {
  it('formata CPF ou CNPJ conforme o número de dígitos', () => {
    expect(formatarCpfCnpj('52998224725')).toBe('529.982.247-25');
    expect(formatarCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('valida os dígitos verificadores de CPF e CNPJ', () => {
    expect(validarCpfCnpj('529.982.247-25')).toBe(true);
    expect(validarCpfCnpj('11.222.333/0001-81')).toBe(true);
    expect(validarCpfCnpj('529.982.247-24')).toBe(false);
    expect(validarCpfCnpj('11.222.333/0001-80')).toBe(false);
    expect(validarCpfCnpj('111.111.111-11')).toBe(false);
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
