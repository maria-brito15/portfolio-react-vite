import { CalendarDateSchema } from './index';

const ok = (value: unknown) => CalendarDateSchema.safeParse(value).success;
const message = (value: unknown) => {
  const result = CalendarDateSchema.safeParse(value);

  return result.success ? null : result.error.issues[0]?.message;
};

describe('CalendarDate', () => {
  it.each(['2026-11-19', '2026-01-01', '2026-12-31', '2028-02-29', '2000-02-29'])(
    '%s é válida',
    (value) => {
      expect(ok(value)).toBe(true);
    },
  );

  it('2026-02-30 não existe', () => {
    expect(message('2026-02-30')).toBe('dia inexistente em 2026-02 (recebido 30)');
  });

  it('ano bissexto: 2028-02-29 vale e 2027-02-29 não; 1900 não é bissexto', () => {
    expect(ok('2028-02-29')).toBe(true);
    expect(ok('2027-02-29')).toBe(false);
    expect(ok('1900-02-29')).toBe(false);
  });

  it('mês 13 e mês 00 falham', () => {
    expect(message('2026-13-01')).toBe('mês fora de 1 a 12 (recebido 13)');
    expect(ok('2026-00-10')).toBe(false);
  });

  it('dia 00 e dia 31 em mês de 30 falham', () => {
    expect(ok('2026-04-00')).toBe(false);
    expect(ok('2026-04-31')).toBe(false);
  });

  it.each(['2026-11-1', '2026-1-01', '26-11-19', '19/11/2026', '', ' 2026-11-19', 'ontem'])(
    'formato errado %j falha',
    (value) => {
      expect(message(value)).toContain('formato inválido');
    },
  );

  it('ausente, nulo e não texto falham', () => {
    expect(message(undefined)).toBe('data ausente');
    expect(message(null)).toBe('esperado texto AAAA-MM-DD, recebido nulo');
    expect(message(20261119)).toBe('esperado texto AAAA-MM-DD, recebido número');
  });
});
