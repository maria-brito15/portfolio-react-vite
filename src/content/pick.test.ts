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

// T7.4: fora de `src/content` e `src/i18n`, o que se procura é o `id` cru como reserva de texto
// (`?? id`, `?? route.id`, `|| r.id`). Testes ficam de fora: eles montam amostras de propósito.
// O lookahead exclui comparações (`route.id === 'home'`), que não são reserva de texto.
const ID_FALLBACK = /(\?\?|\|\|)\s*([A-Za-z_]\w*\.)*id\b(?!\s*[=!]==?)/;

// Exceções conferidas à mão, com o motivo. O `id` aqui é o nome do comando num parâmetro de URL,
// não texto de interface.
const ID_FALLBACK_ALLOWED = ['encodeURIComponent(command ?? route.id)'];

function findIdFallbacks(dir: string): string[] {
  return sourceFiles(dir)
    .filter((file) => !/\.test\.tsx?$/.test(file))
    .flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, i) =>
          ID_FALLBACK.test(line) && !ID_FALLBACK_ALLOWED.some((ok) => line.includes(ok))
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

describe('guarda contra o `id` cru como texto de reserva (T7.4, FR-015)', () => {
  it('acha amostras com `id` como reserva e ignora testes e reservas vazias', () => {
    const dir = mkdtempSync(join(tmpdir(), 'reserva-id-'));
    const samples = [
      `const a = r.segment?.[lang] ${OP} r.id;`,
      `const b = name ${OP} id;`,
      `const c = x || route.id;`,
      `const ok1 = t[lang] ${OP} '';`,
      `const ok2 = x ${OP} identity;`,
    ];

    writeFileSync(join(dir, 'amostra.ts'), samples.join('\n'));
    writeFileSync(join(dir, 'amostra.test.ts'), samples[0]);

    expect(findIdFallbacks(dir)).toHaveLength(3);
  });

  it.each(['src/data', 'src/components', 'src/terminal', 'src/pages'])(
    'não há `id` cru como texto de reserva em %s',
    (dir) => {
      expect(findIdFallbacks(resolve(process.cwd(), dir))).toEqual([]);
    },
  );
});
