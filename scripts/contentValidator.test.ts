import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ExampleListSchema,
  EXAMPLE_IMAGE_PATH,
  makeExampleItem,
  makeExampleItems,
} from '../src/content/__fixtures__/example.fixture';
import { problemLine } from '../src/content/schema/errors';
import type { RegistryEntry } from '../src/content/registry';
import { reportLines, validateAll } from './contentValidator';

const FILE = 'src/content/exemplo.content.ts';

// Projeto de mentira numa pasta temporária: `public/assets/exemplo.png` existe de verdade.
function project() {
  const root = mkdtempSync(join(tmpdir(), 'content-'));
  const publicDir = join(root, 'public');

  mkdirSync(join(publicDir, 'assets'), { recursive: true });
  writeFileSync(join(publicDir, 'assets', 'exemplo.png'), 'png');
  mkdirSync(join(root, 'src', 'content'), { recursive: true });

  return { root, publicDir, contentDir: join(root, 'src', 'content') };
}

const entry = (itens: unknown[], file = FILE): RegistryEntry => ({
  file,
  schema: ExampleListSchema,
  data: { itens },
});

function lines(itens: unknown[]) {
  const { publicDir } = project();

  return validateAll([entry(itens)], { publicDir }).map(problemLine);
}

const at = (field: string, reason: string) => `conteúdo inválido: ${FILE} › ${field} — ${reason}`;

describe('validateAll: conteúdo válido e registro vazio', () => {
  it('conteúdo válido passa (US-001)', () => {
    expect(lines(makeExampleItems(3))).toEqual([]);
  });

  it('EC-11: registro vazio e lista de itens vazia são válidos', () => {
    const { publicDir } = project();

    expect(validateAll([], { publicDir })).toEqual([]);
    expect(lines([])).toEqual([]);
  });
});

describe('validateAll: a linha inteira do §6.2 para cada regra', () => {
  it('data: mês 13', () => {
    const itens: Record<string, unknown>[] = makeExampleItems(4);

    itens[3] = { ...itens[3], data: { year: 2025, month: 13 } };

    expect(lines(itens)).toEqual([at('itens[3].data.month', 'mês fora de 1 a 12 (recebido 13)')]);
  });

  it('imagem inexistente: arquivo não encontrado', () => {
    const itens = [
      { ...makeExampleItem(0), capa: { ...makeExampleItem(0).capa, path: '/assets/x.png' } },
    ];

    expect(lines(itens)).toEqual([
      at(
        'itens[0].capa.path',
        'arquivo não encontrado: /assets/x.png (procurado em public/assets/x.png)',
      ),
    ]);
  });

  it('imagem com alt sem EN e caminho externo falham pelo schema', () => {
    const base = makeExampleItem(0);
    const noAlt = { ...base, capa: { ...base.capa, alt: { pt: 'x', en: '' } } };
    const external = { ...base, capa: { ...base.capa, path: 'https://exemplo.com/x.png' } };

    expect(lines([noAlt])).toEqual([at('itens[0].capa.alt.en', 'texto vazio (só espaços)')]);
    // Caminho externo: só o problema do schema, sem "arquivo não encontrado" duplicado.
    expect(lines([external])).toEqual([
      at('itens[0].capa.path', 'imagem externa não é aceita (sem hotlink)'),
    ]);
  });

  it('link sem protocolo (//)', () => {
    expect(lines([{ ...makeExampleItem(0), link: '//exemplo.com' }])).toEqual([
      at('itens[0].link', 'endereço sem protocolo não é aceito ("//exemplo.com")'),
    ]);
  });

  it('título EN ausente', () => {
    const itens: Record<string, unknown>[] = makeExampleItems(3);

    itens[2] = { ...itens[2], titulo: { pt: 'Só PT' } };

    expect(lines(itens)).toEqual([at('itens[2].titulo.en', 'texto ausente')]);
  });

  it('etiqueta repetida', () => {
    const label = { pt: 'React', en: 'React' };
    const itens = [
      {
        ...makeExampleItem(0),
        tags: [
          { id: 'react', label },
          { id: 'react', label },
        ],
      },
    ];

    expect(lines(itens)).toEqual([
      at('itens[0].tags[1].id', 'identificador repetido "react" (já usado em [0])'),
    ]);
  });

  it('nota 4,3 fora do passo', () => {
    expect(lines([{ ...makeExampleItem(0), rating: 4.3 }])).toEqual([
      at('itens[0].rating', 'nota 4,3 fora do passo de 0,5 (valores válidos: 0,5 a 5)'),
    ]);
  });

  it('vários problemas de uma vez e o fecho N problema(s) em M arquivo(s)', () => {
    const { publicDir } = project();
    const bad = { ...makeExampleItem(0), link: 'http://x.com', rating: 0 };
    const problems = validateAll([entry([bad]), entry([bad], 'src/content/outro.content.ts')], {
      publicDir,
    });
    const out = reportLines(problems);

    expect(out.at(-1)).toBe('4 problema(s) em 2 arquivo(s)');
    expect(out).toHaveLength(5);
  });
});

describe('validateAll: arquivo da imagem no disco (EC-04)', () => {
  it('maiúscula diferente do nome real falha, mesmo onde o disco ignora maiúscula', () => {
    const base = makeExampleItem(0);
    const wrongCase = [
      { ...base, capa: { ...base.capa, path: '/Assets/Exemplo.PNG' } },
      { ...base, capa: { ...base.capa, path: '/assets/EXEMPLO.png' } },
    ];

    expect(lines(wrongCase)).toEqual([
      at(
        'itens[0].capa.path',
        'arquivo não encontrado: /Assets/Exemplo.PNG (procurado em public/Assets/Exemplo.PNG)',
      ),
      at(
        'itens[1].capa.path',
        'arquivo não encontrado: /assets/EXEMPLO.png (procurado em public/assets/EXEMPLO.png)',
      ),
    ]);
  });

  it('o nome exato existente passa', () => {
    expect(lines([makeExampleItem(0)])).toEqual([]);
    expect(makeExampleItem(0).capa.path).toBe(EXAMPLE_IMAGE_PATH);
  });

  it('uma pasta com nome de imagem não conta como arquivo', () => {
    const { publicDir } = project();

    mkdirSync(join(publicDir, 'assets', 'pasta.png'));

    const base = makeExampleItem(0);
    const itens = [{ ...base, capa: { ...base.capa, path: '/assets/pasta.png' } }];

    expect(validateAll([entry(itens)], { publicDir })).toHaveLength(1);
  });

  it('imagem aninhada em qualquer lugar do dado também é conferida', () => {
    const { publicDir } = project();
    const data = {
      qualquer: [{ nivel: { path: '/assets/falta.png', alt: { pt: 'a', en: 'b' } } }],
    };
    const result = validateAll([{ file: FILE, schema: ExampleListSchema, data }], { publicDir });

    expect(result.map((p) => p.field)).toContain('qualquer[0].nivel.path');
  });
});

describe('validateAll: *.content.ts e o registro (EC-10)', () => {
  it('arquivo *.content.ts esquecido no registro é problema', () => {
    const { root, publicDir, contentDir } = project();

    writeFileSync(join(contentDir, 'esquecido.content.ts'), 'export {}');
    mkdirSync(join(contentDir, 'sub'));
    writeFileSync(join(contentDir, 'sub', 'fundo.content.ts'), 'export {}');
    writeFileSync(join(contentDir, 'comum.ts'), 'export {}');

    const out = validateAll([], { publicDir, contentDir, rootDir: root }).map(problemLine);

    expect(out).toEqual([
      'conteúdo inválido: src/content/esquecido.content.ts › (arquivo) — não está registrado em src/content/registry.ts',
      'conteúdo inválido: src/content/sub/fundo.content.ts › (arquivo) — não está registrado em src/content/registry.ts',
    ]);
  });

  it('registrado e presente passa; registrado e ausente do disco é problema', () => {
    const { root, publicDir, contentDir } = project();

    writeFileSync(join(contentDir, 'exemplo.content.ts'), 'export {}');

    const options = { publicDir, contentDir, rootDir: root };

    expect(validateAll([entry([])], options)).toEqual([]);
    expect(
      validateAll([entry([], 'src/content/some.content.ts')], options).map(problemLine),
    ).toEqual([
      'conteúdo inválido: src/content/exemplo.content.ts › (arquivo) — não está registrado em src/content/registry.ts',
      'conteúdo inválido: src/content/some.content.ts › (arquivo) — está em src/content/registry.ts, mas o arquivo não existe',
    ]);
  });
});

describe('validateAll: carga', () => {
  it('carga: 200 itens de cada tipo (texto, data, imagem, link, etiqueta, nota) em até 5 s', () => {
    const { publicDir } = project();
    const items = makeExampleItems(200);
    const started = performance.now();
    const result = validateAll([entry(items)], { publicDir });
    const seconds = (performance.now() - started) / 1000;

    expect(result).toEqual([]);
    expect(seconds).toBeLessThanOrEqual(5);
  });
});
