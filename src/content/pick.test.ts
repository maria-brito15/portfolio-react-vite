import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import type { Lang, Localized } from '../types';
import { pick } from './pick';

// Padrões de texto de reserva (design TD-005): o idioma lido seguido de operador de reserva.
const FALLBACK_PATTERNS = [/\.(pt|en)\b\s*(\?\?|\|\|)/, /\[lang\]\s*(\?\?|\|\|)\s*[^'"\s]/];

const OP = '?' + '?';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) return sourceFiles(full);

    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

function findFallbacks(dir: string): string[] {
  return sourceFiles(dir).flatMap((file) =>
    readFileSync(file, 'utf8')
      .split('\n')
      .flatMap((line, i) =>
        FALLBACK_PATTERNS.some((pattern) => pattern.test(line))
          ? [`${file}:${i + 1}: ${line.trim()}`]
          : [],
      ),
  );
}

describe('pick', () => {
  const text: Localized = { pt: 'Olá', en: 'Hello' };

  it('devolve só o idioma pedido', () => {
    expect(pick(text, 'pt')).toBe('Olá');
    expect(pick(text, 'en')).toBe('Hello');
  });

  it.each([
    ['sem o idioma', { pt: 'Olá' }, 'en'],
    ['idioma vazio', { pt: 'Olá', en: '' }, 'en'],
    ['só espaços', { pt: '  ', en: 'Hello' }, 'pt'],
    ['idioma nulo', { pt: null, en: 'Hello' }, 'pt'],
    ['não texto', { pt: 7, en: 'Hello' }, 'pt'],
  ])('lança %s, sem devolver a chave nem o outro idioma', (_nome, value, lang) => {
    const attempt = () => pick(value as unknown as Localized, lang as Lang);

    expect(attempt).toThrow(`texto ausente em "${lang}"`);
    expect(attempt).toThrow(Error);
  });

  it('lança com o texto inteiro ausente (undefined ou nulo)', () => {
    expect(() => pick(undefined as unknown as Localized, 'pt')).toThrow('texto ausente');
    expect(() => pick(null as unknown as Localized, 'en')).toThrow('texto ausente');
  });
});

describe('guarda contra texto de reserva (FR-015)', () => {
  it('acha uma amostra com reserva em arquivo temporário', () => {
    const dir = mkdtempSync(join(tmpdir(), 'reserva-'));
    // O operador é montado em tempo de execução: o literal aqui faria o guarda acusar este arquivo.
    const samples = [`const a = item.title.en ${OP} id;`, `const b = t[lang] ${OP} key;`];

    writeFileSync(join(dir, 'amostra.ts'), samples.join('\n'));

    expect(findFallbacks(dir)).toHaveLength(2);
  });

  it('não acha reserva legítima: `?? ""` e `?? null` fora do padrão', () => {
    const dir = mkdtempSync(join(tmpdir(), 'reserva-'));

    writeFileSync(join(dir, 'ok.ts'), "const a = t[lang] ?? '';\nconst b = x ?? y;\n");

    expect(findFallbacks(dir)).toEqual([]);
  });

  it.each(['src/content', 'src/i18n'])('não há texto de reserva em %s', (dir) => {
    expect(findFallbacks(resolve(process.cwd(), dir))).toEqual([]);
  });
});
