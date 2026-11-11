import { GLYPH_HEIGHT, cowsay, initialsOf, monogram, wrapText } from './ascii';

describe('monograma', () => {
  it('pega a inicial do primeiro e do último nome, sem acento', () => {
    expect(initialsOf('Duda Brito')).toBe('DB');
    expect(initialsOf('Maria Eduarda de Paula Brito')).toBe('MB');
    expect(initialsOf('Álvaro Ônix')).toBe('AO');
    expect(initialsOf('Duda')).toBe('D');
    expect(initialsOf('')).toBe('');
  });

  it('cobre todas as letras do alfabeto, com 5 linhas de largura igual', () => {
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const lines = monogram(letter);

      expect(lines, letter).toHaveLength(GLYPH_HEIGHT);
      expect(
        lines.some((l) => l.includes('#')),
        letter,
      ).toBe(true);
      for (const l of lines) expect(l.length, `${letter}: "${l}"`).toBeLessThanOrEqual(5);
    }
  });

  it('une as letras e muda quando o nome muda', () => {
    expect(monogram('DB')).not.toEqual(monogram('MB'));
    expect(monogram('DB')[0]).toBe('####   ####');
    expect(monogram('')).toEqual(['', '', '', '', '']);
  });
});

describe('cowsay', () => {
  it('quebra o texto em até 40 colunas', () => {
    const lines = wrapText('a'.repeat(95));

    expect(lines.map((l) => l.length)).toEqual([40, 40, 15]);
    expect(wrapText('um dois três', 7)).toEqual(['um dois', 'três']);
    expect(wrapText('   ')).toEqual(['']);
  });

  it('desenha o balão de uma linha e o de várias', () => {
    const one = cowsay('muuu').split('\n');

    expect(one[0]).toBe(' ______ ');
    expect(one[1]).toBe('< muuu >');
    expect(one[2]).toBe(' ------ ');
    expect(one.join('\n')).toContain('(oo)');

    const many = cowsay('a'.repeat(50)).split('\n');

    expect(many[1].startsWith('/ ')).toBe(true);
    expect(many[2].startsWith('\\ ')).toBe(true);
  });
});
