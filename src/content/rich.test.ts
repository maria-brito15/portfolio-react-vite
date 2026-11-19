import { parseRich, plainText } from './rich';

describe('parseRich', () => {
  it('texto puro: um trecho sem negrito', () => {
    expect(parseRich('Olá mundo')).toEqual([{ text: 'Olá mundo', strong: false }]);
  });

  it('um negrito no meio', () => {
    expect(parseRich('a **b** c')).toEqual([
      { text: 'a ', strong: false },
      { text: 'b', strong: true },
      { text: ' c', strong: false },
    ]);
  });

  it('vários negritos', () => {
    expect(parseRich('**a** e **b**')).toEqual([
      { text: 'a', strong: true },
      { text: ' e ', strong: false },
      { text: 'b', strong: true },
    ]);
  });

  it('negrito no início e no fim, sem trechos vazios', () => {
    expect(parseRich('**x** y **z**').map((s) => s.text)).toEqual(['x', ' y ', 'z']);
  });

  it('`**` sozinho (número ímpar) fica como texto, sem perder caractere', () => {
    expect(parseRich('a ** b')).toEqual([{ text: 'a ** b', strong: false }]);
  });

  it('texto vazio não tem trecho', () => {
    expect(parseRich('')).toEqual([]);
  });

  it('plainText remove só as marcas e é consistente com os trechos', () => {
    const text = 'Usa **WhatsApp** e **Evolution API** juntos';

    expect(plainText(text)).toBe('Usa WhatsApp e Evolution API juntos');
    expect(plainText(text)).toBe(
      parseRich(text)
        .map((s) => s.text)
        .join(''),
    );
  });

  it('plainText de texto sem marcação é o próprio texto', () => {
    expect(plainText('a < b')).toBe('a < b');
  });
});
