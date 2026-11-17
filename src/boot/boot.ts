// Módulo de boot (spec 002, TD-011 e TD-012): as regras de tema e de idioma que rodam num script
// inline no <head>, antes do primeiro desenho (FR-005), e também nos componentes e nos testes.
//
// REGRAS DESTE ARQUIVO
// - SEM imports: `bootSource()` monta o texto do script com `Function.prototype.toString`, e uma
//   função serializada não leva consigo nada que estava fora dela.
// - Cada função é AUTOCONTIDA: constantes ficam dentro dela e nenhuma chama outra do módulo.
// - `bootSource()` só é chamado pelo plugin do Vite (Node); não pode entrar no bundle do cliente.
//
// O script lê o armazenamento sob try/catch (FR-006) e marca no <html>: `data-theme`, a classe
// `js`, `style.colorScheme` e `data-lang-offer` (a faixa de idioma, que nunca redireciona).

export type BootTheme = 'light' | 'dark';

export interface ThemeInput {
  // valor gravado em `portfolio-theme` (qualquer coisa: só 'light' e 'dark' valem) ou null
  stored: unknown;
  // `matchMedia('(prefers-color-scheme: dark)').matches`
  systemDark: boolean;
}

export interface LanguageOfferInput {
  path: string;
  // valor gravado em `portfolio-lang` ('pt' ou 'en') ou null
  storedLang: unknown;
  // `portfolio-lang-offer === 'dismissed'`
  dismissed: boolean;
  // `navigator.languages`, na ordem de preferência
  navigatorLangs: readonly string[];
  // false quando ler o armazenamento lançou erro: a escolha e a dispensa não podem ser lidas
  storageOk: boolean;
  // a rota sem casca (o terminal, FR-041) nunca mostra a faixa
  bare?: boolean;
}

// Tabela "Resolução do tema" do requirements: a escolha gravada vale se for válida; senão, o sistema.
export function resolveTheme(input: ThemeInput): BootTheme {
  const valid = ['light', 'dark'];

  if (typeof input.stored === 'string' && valid.indexOf(input.stored) !== -1) {
    return input.stored as BootTheme;
  }

  return input.systemDark ? 'dark' : 'light';
}

// Tabela "Resolução do idioma": devolve true quando a faixa que oferece o inglês deve aparecer.
// Nunca redireciona. Sob `/en` ou `/en/...` o endereço manda (EN, sem faixa); uma escolha gravada
// ou a dispensa vencem a preferência do navegador; com o armazenamento bloqueado nada disso pode ser
// lido, então a faixa volta em toda visita em que o navegador prefere o inglês (FR-026).
export function languageOffer(input: LanguageOfferInput): boolean {
  const path = input.path;

  if (input.bare) return false;
  if (path === '/en' || path.indexOf('/en/') === 0) return false;

  if (input.storageOk) {
    if (input.storedLang === 'pt' || input.storedLang === 'en') return false;
    if (input.dismissed) return false;
  }

  const first = input.navigatorLangs.length > 0 ? String(input.navigatorLangs[0]) : '';
  const primary = first.toLowerCase().split('-')[0];

  return primary === 'en';
}

// Texto do script inline. Cada função entra como declaração e o corpo lê o armazenamento.
export function bootSource(): string {
  return [
    '(function () {',
    resolveTheme.toString(),
    languageOffer.toString(),
    'var root = document.documentElement;',
    'var storageOk = true;',
    'var stored = null;',
    'var storedLang = null;',
    'var dismissed = false;',
    'try {',
    "  stored = localStorage.getItem('portfolio-theme');",
    "  storedLang = localStorage.getItem('portfolio-lang');",
    "  dismissed = localStorage.getItem('portfolio-lang-offer') === 'dismissed';",
    '} catch (e) {',
    '  storageOk = false;',
    '}',
    'var systemDark = false;',
    'try {',
    "  systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;",
    '} catch (e) {}',
    'var theme = resolveTheme({ stored: stored, systemDark: systemDark });',
    "root.setAttribute('data-theme', theme);",
    'root.style.colorScheme = theme;',
    "root.classList.add('js');",
    'var langs = [];',
    'try {',
    '  langs = Array.prototype.slice.call(navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]);',
    '} catch (e) {}',
    'var offer = false;',
    'try {',
    '  offer = languageOffer({',
    '    path: location.pathname,',
    '    storedLang: storedLang,',
    '    dismissed: dismissed,',
    '    navigatorLangs: langs,',
    '    storageOk: storageOk,',
    "    bare: root.getAttribute('data-shell') === 'bare',",
    '  });',
    '} catch (e) {}',
    "if (offer) root.setAttribute('data-lang-offer', '');",
    '})();',
  ].join('\n');
}
