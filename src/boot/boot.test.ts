// T1.3 (V-03, V-08): as tabelas de tema e de idioma do requirements, as funções puras do boot e o
// script inline avaliado em `vm`, que precisa decidir igual às funções.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { bootSource, languageOffer, resolveTheme, type LanguageOfferInput } from './boot';

describe('resolveTheme (tabela "Resolução do tema")', () => {
  it.each([
    ['nenhuma, sistema claro', null, false, 'light'],
    ['nenhuma, sistema escuro', null, true, 'dark'],
    ['claro gravado, sistema escuro', 'light', true, 'light'],
    ['escuro gravado, sistema claro', 'dark', false, 'dark'],
    ['valor inválido (dracula), sistema claro', 'dracula', false, 'light'],
    ['valor inválido (dracula), sistema escuro', 'dracula', true, 'dark'],
    ['valor de outro tipo', 42, true, 'dark'],
  ])('%s', (_, stored, systemDark, expected) => {
    expect(resolveTheme({ stored, systemDark })).toBe(expected);
  });
});

const base: LanguageOfferInput = {
  path: '/projetos',
  storedLang: null,
  dismissed: false,
  navigatorLangs: ['en-US', 'en'],
  storageOk: true,
};

describe('languageOffer (tabela "Resolução do idioma")', () => {
  it.each<[string, Partial<LanguageOfferInput>, boolean]>([
    ['PT, nada gravado, navegador em inglês: oferece', {}, true],
    ['PT, navegador em português: sem faixa', { navigatorLangs: ['pt-BR', 'en'] }, false],
    ['PT, navegador em espanhol: sem faixa', { navigatorLangs: ['es-AR'] }, false],
    ['PT, escolha PT gravada: a escolha vence', { storedLang: 'pt' }, false],
    ['PT, escolha EN gravada: sem faixa', { storedLang: 'en' }, false],
    ['PT, faixa dispensada: sem faixa (FR-034)', { dismissed: true }, false],
    ['/en/projects, nada gravado: EN, sem faixa', { path: '/en/projects' }, false],
    [
      '/en/projects, escolha PT: o endereço vence',
      { path: '/en/projects', storedLang: 'pt' },
      false,
    ],
    ['/en (home em inglês): sem faixa', { path: '/en' }, false],
    ['/en/ com barra final: sem faixa', { path: '/en/' }, false],
    [
      'armazenamento bloqueado: oferece em toda visita (FR-026)',
      { storageOk: false, storedLang: 'pt', dismissed: true },
      true,
    ],
    [
      'armazenamento bloqueado, navegador em PT: sem faixa',
      { storageOk: false, navigatorLangs: ['pt-BR'] },
      false,
    ],
    ['/xyz inexistente em PT, navegador em inglês: segue a regra', { path: '/xyz' }, true],
    ['/en/xyz inexistente: EN, sem faixa', { path: '/en/xyz' }, false],
    ['rota sem casca (terminal): nunca (FR-041)', { bare: true }, false],
    ['sem idiomas no navegador: sem faixa', { navigatorLangs: [] }, false],
    [
      'só o primeiro idioma conta: pt-BR antes de en',
      { navigatorLangs: ['pt-BR', 'en-US'] },
      false,
    ],
    ['idioma em maiúsculas: EN-gb', { navigatorLangs: ['EN-gb'] }, true],
    ['"en" só como prefixo de caminho: /entrada não é inglês', { path: '/entrada' }, true],
  ])('%s', (_, patch, expected) => {
    expect(languageOffer({ ...base, ...patch })).toBe(expected);
  });
});

// Ambiente mínimo do navegador para o script inline.
interface Env {
  stored?: string | null;
  storedLang?: string | null;
  dismissed?: boolean;
  systemDark?: boolean;
  langs?: string[];
  path?: string;
  blocked?: boolean;
  shell?: string;
  noMatchMedia?: boolean;
}

function runBoot(env: Env, source = bootSource()) {
  const attrs = new Map<string, string>();
  const classes = new Set<string>();

  if (env.shell) attrs.set('data-shell', env.shell);

  const root = {
    setAttribute: (k: string, v: string) => attrs.set(k, v),
    getAttribute: (k: string) => attrs.get(k) ?? null,
    classList: { add: (c: string) => classes.add(c) },
    style: { colorScheme: '' },
  };
  const values: Record<string, string | null | undefined> = {
    'portfolio-theme': env.stored,
    'portfolio-lang': env.storedLang,
    'portfolio-lang-offer': env.dismissed ? 'dismissed' : null,
  };
  const sandbox = {
    document: { documentElement: root },
    localStorage: {
      getItem: (k: string) => {
        if (env.blocked) throw new Error('SecurityError');

        return values[k] ?? null;
      },
    },
    window: {
      matchMedia: env.noMatchMedia ? undefined : () => ({ matches: Boolean(env.systemDark) }),
    },
    navigator: { languages: env.langs ?? ['pt-BR'], language: (env.langs ?? ['pt-BR'])[0] },
    location: { pathname: env.path ?? '/projetos' },
  };

  vm.runInNewContext(source, sandbox);

  return {
    theme: attrs.get('data-theme'),
    offer: attrs.has('data-lang-offer'),
    js: classes.has('js'),
    colorScheme: root.style.colorScheme,
  };
}

describe('script inline (bootSource) avaliado em vm', () => {
  it('marca data-theme, a classe js e color-scheme', () => {
    const out = runBoot({ stored: 'light', systemDark: true });

    expect(out).toMatchObject({ theme: 'light', js: true, colorScheme: 'light' });
  });

  it('decide igual às funções, em todas as combinações de tema', () => {
    for (const stored of [null, 'light', 'dark', 'dracula', 'solarized']) {
      for (const systemDark of [false, true]) {
        expect(runBoot({ stored, systemDark }).theme, `${stored}/${systemDark}`).toBe(
          resolveTheme({ stored, systemDark }),
        );
      }
    }
  });

  it('decide igual às funções, em todas as combinações de faixa de idioma', () => {
    for (const path of ['/projetos', '/en', '/en/projects', '/xyz']) {
      for (const storedLang of [null, 'pt', 'en']) {
        for (const dismissed of [false, true]) {
          for (const langs of [['en-US'], ['pt-BR', 'en'], ['es'], []]) {
            for (const blocked of [false, true]) {
              const expected = languageOffer({
                path,
                storedLang: blocked ? null : storedLang,
                dismissed: blocked ? false : dismissed,
                navigatorLangs: langs,
                storageOk: !blocked,
              });

              expect(
                runBoot({ path, storedLang, dismissed, langs, blocked }).offer,
                JSON.stringify({ path, storedLang, dismissed, langs, blocked }),
              ).toBe(expected);
            }
          }
        }
      }
    }
  });

  it('valor antigo (dracula) é ignorado e segue o sistema', () => {
    expect(runBoot({ stored: 'dracula', systemDark: false }).theme).toBe('light');
    expect(runBoot({ stored: 'dracula', systemDark: true }).theme).toBe('dark');
  });

  it('armazenamento bloqueado: sem erro, tema do sistema e faixa em toda visita (FR-006, FR-026)', () => {
    const out = runBoot({ blocked: true, systemDark: true, langs: ['en-US'] });

    expect(out).toMatchObject({ theme: 'dark', offer: true, js: true });
  });

  it('sem matchMedia: segue sem erro e usa o claro', () => {
    expect(runBoot({ noMatchMedia: true }).theme).toBe('light');
  });

  it('a rota sem casca (data-shell="bare") nunca marca a faixa (FR-041)', () => {
    expect(runBoot({ shell: 'bare', langs: ['en-US'] }).offer).toBe(false);
    expect(runBoot({ langs: ['en-US'] }).offer).toBe(true);
  });

  it('a faixa nunca é marcada sob /en nem com escolha gravada', () => {
    expect(runBoot({ path: '/en/projects', langs: ['en-US'] }).offer).toBe(false);
    expect(runBoot({ storedLang: 'pt', langs: ['en-US'] }).offer).toBe(false);
  });
});

describe('regra do boot serializado (autocontido, sem imports)', () => {
  it('o arquivo não tem imports', () => {
    const source = readFileSync(join(process.cwd(), 'src/boot/boot.ts'), 'utf8');

    expect(source).not.toMatch(/^\s*import\s/m);
    expect(source).not.toMatch(/\brequire\(/);
  });

  it('cada função serializada roda sozinha, num contexto vazio (nenhum identificador livre)', () => {
    const resolve = vm.runInNewContext(`(${resolveTheme.toString()})`);
    const offer = vm.runInNewContext(`(${languageOffer.toString()})`);

    expect(resolve({ stored: 'dark', systemDark: false })).toBe('dark');
    expect(offer({ ...base })).toBe(true);
  });

  it('o script inteiro roda com um ambiente que só tem o navegador', () => {
    expect(() => runBoot({})).not.toThrow();
  });

  it('um identificador livre falha (guarda do próprio teste)', () => {
    const planted = `(function () { var x = outroModulo.valor; })();`;

    expect(() => runBoot({}, planted)).toThrow(/outroModulo is not defined/);
  });

  it('bootSource não leva helpers do esbuild (como __name)', () => {
    expect(bootSource()).not.toMatch(/__name|__publicField|__defProp/);
  });
});
