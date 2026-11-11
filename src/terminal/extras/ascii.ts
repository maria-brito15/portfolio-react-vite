// Arte ASCII dos comandos de personalidade: funções puras, sem React.
// Fonte de 5 linhas por 5 colunas (só maiúsculas): o monograma do `neofetch`
// vem das iniciais do nome nos dados, não de um texto fixo.

const FONT: Record<string, string[]> = {
  A: [' ### ', '#   #', '#####', '#   #', '#   #'],
  B: ['#### ', '#   #', '#### ', '#   #', '#### '],
  C: [' ####', '#    ', '#    ', '#    ', ' ####'],
  D: ['#### ', '#   #', '#   #', '#   #', '#### '],
  E: ['#####', '#    ', '#### ', '#    ', '#####'],
  F: ['#####', '#    ', '#### ', '#    ', '#    '],
  G: [' ####', '#    ', '#  ##', '#   #', ' ####'],
  H: ['#   #', '#   #', '#####', '#   #', '#   #'],
  I: ['#####', '  #  ', '  #  ', '  #  ', '#####'],
  J: ['  ###', '   # ', '   # ', '#  # ', ' ##  '],
  K: ['#   #', '#  # ', '###  ', '#  # ', '#   #'],
  L: ['#    ', '#    ', '#    ', '#    ', '#####'],
  M: ['#   #', '## ##', '# # #', '#   #', '#   #'],
  N: ['#   #', '##  #', '# # #', '#  ##', '#   #'],
  O: [' ### ', '#   #', '#   #', '#   #', ' ### '],
  P: ['#### ', '#   #', '#### ', '#    ', '#    '],
  Q: [' ### ', '#   #', '# # #', '#  # ', ' ## #'],
  R: ['#### ', '#   #', '#### ', '#  # ', '#   #'],
  S: [' ####', '#    ', ' ### ', '    #', '#### '],
  T: ['#####', '  #  ', '  #  ', '  #  ', '  #  '],
  U: ['#   #', '#   #', '#   #', '#   #', ' ### '],
  V: ['#   #', '#   #', '#   #', ' # # ', '  #  '],
  W: ['#   #', '#   #', '# # #', '## ##', '#   #'],
  X: ['#   #', ' # # ', '  #  ', ' # # ', '#   #'],
  Y: ['#   #', ' # # ', '  #  ', '  #  ', '  #  '],
  Z: ['#####', '   # ', '  #  ', ' #   ', '#####'],
};

export const GLYPH_HEIGHT = 5;

// Linha final do `matrix` (também usada no replay, sem animar).
export const matrixEnd = (lang: 'pt' | 'en') =>
  lang === 'pt'
    ? 'matrix encerrado. Siga o coelho branco: digite ajuda.'
    : 'matrix ended. Follow the white rabbit: type help.';

// Iniciais do primeiro e do último nome ("Duda Brito" → "DB"), sem acento.
// Letra que a fonte não tem é descartada.
export function initialsOf(name: string): string {
  const words = name.normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean);
  const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words.slice(0, 1);

  return picked
    .map((word) => word[0].toUpperCase())
    .filter((letter) => letter in FONT)
    .join('');
}

// Uma string por linha; as letras ficam separadas por duas colunas.
export function monogram(initials: string): string[] {
  const glyphs = [...initials.toUpperCase()].map((c) => FONT[c]).filter(Boolean);

  return Array.from({ length: GLYPH_HEIGHT }, (_, row) =>
    glyphs
      .map((glyph) => glyph[row])
      .join('  ')
      .trimEnd(),
  );
}

// Quebra o texto em linhas de até `width` colunas; palavra maior que a linha é partida.
export function wrapText(text: string, width = 40): string[] {
  const lines: string[] = [];
  let line = '';

  for (const raw of text.split(/\s+/).filter(Boolean)) {
    let word = raw;

    while (word.length > width) {
      if (line) {
        lines.push(line);
        line = '';
      }
      lines.push(word.slice(0, width));
      word = word.slice(width);
    }
    if (!line) line = word;
    else if (line.length + 1 + word.length <= width) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  return lines.length ? lines : [''];
}

const COW = [
  '        \\   ^__^',
  '         \\  (oo)\\_______',
  '            (__)\\       )\\/\\',
  '                ||----w |',
  '                ||     ||',
];

// Balão com o texto e a vaca, no formato clássico do `cowsay`.
export function cowsay(text: string): string {
  const lines = wrapText(text);
  const width = Math.max(...lines.map((l) => l.length));
  const body =
    lines.length === 1
      ? [`< ${lines[0].padEnd(width)} >`]
      : lines.map((l, i) => {
          const [left, right] =
            i === 0 ? ['/', '\\'] : i === lines.length - 1 ? ['\\', '/'] : ['|', '|'];

          return `${left} ${l.padEnd(width)} ${right}`;
        });

  return [` ${'_'.repeat(width + 2)} `, ...body, ` ${'-'.repeat(width + 2)} `, ...COW].join('\n');
}
