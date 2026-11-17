import { diffKeys, parityLine } from './parity';

const lines = (a: unknown, b: unknown, file = 'src/i18n/ui.ts') =>
  diffKeys(a, b).map((p) => parityLine(file, p));

describe('diffKeys: paridade de duas árvores', () => {
  it('árvores iguais em estrutura passam, e EN igual ao PT não é erro (EC-13)', () => {
    expect(
      lines(
        { nav: { home: 'GitHub', about: 'Sobre' } },
        { nav: { home: 'GitHub', about: 'About' } },
      ),
    ).toEqual([]);
  });

  it('falta de uma chave em EN: nomeia a chave e "en" (US-003)', () => {
    expect(
      lines(
        { nav: { projects: 'Projetos', skills: 'Habilidades' } },
        { nav: { skills: 'Skills' } },
      ),
    ).toEqual(['paridade: src/i18n/ui.ts › nav.projects — falta a tradução em "en"']);
  });

  it('chave que só existe em EN aponta "pt"', () => {
    expect(lines({ a: 'x' }, { a: 'x', b: 'y' })).toEqual([
      'paridade: src/i18n/ui.ts › b — falta a tradução em "pt"',
    ]);
  });

  it('um ramo inteiro que só existe de um lado diz "existe só em"', () => {
    expect(lines({ nav: { a: 'x' }, extra: { b: 'y' } }, { nav: { a: 'x' } })).toEqual([
      'paridade: src/i18n/ui.ts › extra — existe só em "pt"',
    ]);
    expect(lines({ nav: { a: 'x' } }, { nav: { a: 'x' }, extra: ['y'] })).toEqual([
      'paridade: src/i18n/ui.ts › extra — existe só em "en"',
    ]);
  });

  it('texto vazio (ou só espaço) em um idioma', () => {
    expect(lines({ github: { title: 'GitHub' } }, { github: { title: '' } })).toEqual([
      'paridade: src/i18n/ui.ts › github.title — texto vazio em "en"',
    ]);
    expect(lines({ a: '  ' }, { a: 'x' })).toEqual([
      'paridade: src/i18n/ui.ts › a — texto vazio em "pt"',
    ]);
  });

  it('tipo diferente: função × texto (EC-12)', () => {
    expect(lines({ theme: { toLight: 'Claro' } }, { theme: { toLight: () => 'Light' } })).toEqual([
      'paridade: src/i18n/ui.ts › theme.toLight — tipo diferente (texto em "pt", função em "en")',
    ]);
  });

  it('função dos dois lados passa; o corpo da função não é comparado', () => {
    expect(lines({ f: (n: number) => `${n} itens` }, { f: (n: number) => `${n} items` })).toEqual(
      [],
    );
  });

  it('arrays: tamanho e depois cada posição', () => {
    expect(lines({ l: ['a', 'b'] }, { l: ['a'] })).toEqual([
      'paridade: src/i18n/ui.ts › l — tamanho diferente (2 em "pt", 1 em "en")',
    ]);
    expect(lines({ l: [{ t: 'a' }, { t: 'b' }] }, { l: [{ t: 'a' }, { t: '' }] })).toEqual([
      'paridade: src/i18n/ui.ts › l[1].t — texto vazio em "en"',
    ]);
    expect(lines({ l: ['a'] }, { l: 'a' })).toEqual([
      'paridade: src/i18n/ui.ts › l — tipo diferente (lista em "pt", texto em "en")',
    ]);
  });

  it('elemento do React é uma folha: não entra nas propriedades internas', () => {
    const element = (text: string) => ({
      $$typeof: Symbol.for('react.transitional.element'),
      props: { children: text },
    });

    expect(lines({ a: element('oi') }, { a: element('hello') })).toEqual([]);
    expect(lines({ a: element('oi') }, { a: 'hello' })).toEqual([
      'paridade: src/i18n/ui.ts › a — tipo diferente (elemento em "pt", texto em "en")',
    ]);
  });

  it('chave com valor undefined conta como ausente; null é um tipo', () => {
    expect(lines({ a: 'x' }, { a: undefined })).toEqual([
      'paridade: src/i18n/ui.ts › a — falta a tradução em "en"',
    ]);
    expect(lines({ a: 'x' }, { a: null })).toEqual([
      'paridade: src/i18n/ui.ts › a — tipo diferente (texto em "pt", nulo em "en")',
    ]);
  });

  it('vários problemas saem juntos, na ordem em que aparecem', () => {
    expect(lines({ a: 'x', b: 'y', c: 'z' }, { a: '', c: 'z' })).toEqual([
      'paridade: src/i18n/ui.ts › a — texto vazio em "en"',
      'paridade: src/i18n/ui.ts › b — falta a tradução em "en"',
    ]);
  });

  it('nomes dos lados configuráveis', () => {
    expect(diffKeys({ a: 'x' }, {}, ['A', 'B']).map((p) => p.reason)).toEqual([
      'falta a tradução em "B"',
    ]);
  });
});
