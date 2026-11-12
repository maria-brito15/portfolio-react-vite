// Interpretador do terminal da página inicial.
//
// `runCommand(input, ctx)` devolve { output, clear } sem tocar no DOM:
// - `output(lang)` desenha a resposta no idioma atual (trocar de idioma
//   re-desenha o histórico inteiro);
// - os efeitos (navegar, trocar tema/idioma) passam por `ctx` e só rodam
//   quando `ctx.replay` é falso. No replay (histórico restaurado ao voltar
//   para a página) a saída é refeita sem repetir os efeitos.
import type { ReactNode } from 'react';
import type { Lang, Localized, Theme } from '../types';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { experienceGroups } from '../data/experiences';
import { portfolio } from '../data/portfolio';
import { TERMINAL_PATH, directories, fold, type Route } from '../data/routes';
import {
  findSection,
  resolveTarget,
  sectionsOf,
  splitTarget,
  targetPath,
  type Section,
} from '../data/sections';
import { projectPeriod } from '../utils/projectDate';
import { findTheme, themes } from '../data/themes';
import { shortcutLine, shortcuts } from '../data/shortcuts';
import { ui } from '../i18n/ui';
import { ActionLine, Cmd, Ext, TermLink } from './outputs';
import { AcademicsView, ResumeView, ServicesView } from './views';
import SectionView from './sectionViews';
import { PageIndex, RunCommand, SectionNav } from './pageIndex';
import { HIRE, extraCommands, hireResult, personaAnswer } from './extras';
import type { Persona, PersonaId } from '../data/personas';
import type { TrailValue } from '../trails/TrailProvider';

const L = (pt: string, en: string): Localized => ({ pt, en });

// Última página com índice aberta (e a seção): dá sentido a `2`, `proximo` e `anterior`.
export interface NavContext {
  routeId: string;
  sectionId: string | null;
}

// Tudo o que um comando pode ler (e os efeitos que pode disparar, fora do replay).
export interface CommandContext {
  lang: Lang;
  theme: Theme;
  history: string[];
  context?: NavContext | null;
  toggleLang: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  replay: boolean;
  // Persona do visitante (ver `data/personas.ts`). `personaPending`: a pergunta da
  // primeira visita ainda não foi respondida nem pulada.
  persona?: Persona;
  personaPending?: boolean;
  choosePersona?: (id: PersonaId) => void;
  clearPersona?: () => void;
  // Estado das trilhas (comando `trilha`); só leitura e controles, sem efeito no replay.
  trail?: TrailValue;
}

export interface CommandResult {
  output: (lang: Lang) => ReactNode;
  clear?: boolean;
  redirect?: string;
}

export interface Command {
  names: [string, string];
  aliases?: string[];
  route?: string;
  usage?: Localized;
  desc?: Localized;
  hidden?: boolean;
  run: (args: string[], ctx: CommandContext) => CommandResult;
}

// Exemplos do esquema de seções, mostrados na `ajuda`.
const HELP_SECTIONS = [
  ['ls <página>', 'ls <page>', 'lista as seções de uma página', 'list the sections of a page'],
  [
    '<página> <seção>',
    '<page> <section>',
    'lê a seção no terminal (ex.: curriculo competencias)',
    'read the section here (e.g. resume skills)',
  ],
  [
    'cd <página>/<seção>',
    'cd <page>/<section>',
    'abre a página própria na seção',
    'open the page itself at the section',
  ],
];

const errorLine = (text: string) => <p className="t-err">{text}</p>;
const pick = (value: string | Localized, lang: Lang) =>
  value && typeof value === 'object' && 'pt' in value ? value[lang] : value;

// ---------------------------------------------------------------------------
// Comandos. `names[0]` é o nome em português, `names[1]` o em inglês.
// ---------------------------------------------------------------------------
// `ls <página>`: o mesmo índice numerado que o comando da página mostra
// (`PageIndex`), sempre com o par "ver no terminal / abrir página própria".
function listSections(route: Route): CommandResult {
  const hasSections = sectionsOf(route.id).length > 0;

  return {
    output: (lang) => {
      const page = lang === 'pt' ? route.name : route.alias;

      return (
        <>
          {hasSections ? (
            <PageIndex routeId={route.id} />
          ) : (
            <p className="t-dim">
              {page}:{' '}
              {lang === 'pt' ? 'esta página não tem seções; use' : 'this page has no sections; use'}{' '}
              <Cmd>{page}</Cmd>
            </p>
          )}
          <ActionLine routeId={route.id} />
        </>
      );
    },
  };
}

// `<página> <seção>`: conteúdo completo da seção, lido dos dados da página.
function runSection(command: Command, args: string[]): CommandResult {
  const route = command.route as string;
  const section = findSection(route, args[0]);
  const name = command.names[0];

  if (!sectionsOf(route).length) {
    return {
      output: (lang) =>
        errorLine(
          `${name}: ${lang === 'pt' ? 'esta página não tem seções' : 'this page has no sections'}`,
        ),
    };
  }
  if (!section || args.length > 1) {
    const bad = section ? args.slice(1).join(' ') : args.join(' ');

    // Erro que reensina: diz o que não existe e reimprime o índice da página.
    return {
      output: (lang) => (
        <>
          <PageIndex routeId={route} error={ui[lang].term.nav.notExist(bad)} />
          <ActionLine routeId={route} />
        </>
      ),
    };
  }

  return {
    output: (lang) => (
      <>
        <SectionView routeId={route} section={section} lang={lang} />
        <SectionNav routeId={route} section={section} />
        <ActionLine routeId={route} section={section} />
      </>
    ),
  };
}

// Nomes de `proximo`/`anterior` nos dois idiomas, vindos de ui.ts.
const NEXT = { pt: ui.pt.term.nav.nextWord, en: ui.en.term.nav.nextWord };
const PREVIOUS = { pt: ui.pt.term.nav.previousWord, en: ui.en.term.nav.previousWord };

// Seção vizinha da última página aberta. Com o índice aberto (sem seção), a
// próxima é a primeira e a anterior já é o começo.
function stepSection(
  context: NavContext,
  direction: number,
): { section: Section; edge?: undefined } | { edge: 'first' | 'last'; section?: undefined } {
  const list = sectionsOf(context.routeId);
  const at = context.sectionId ? list.findIndex((s) => s.id === context.sectionId) : -1;
  const target = list[at + direction];

  return target ? { section: target } : { edge: direction > 0 ? 'last' : 'first' };
}

const pageCommand = (routeId: string) => commands.find((c) => c.route === routeId) as Command;

// `proximo` / `anterior`: abrem, aqui no terminal, a seção vizinha.
function runStep(direction: number, ctx: CommandContext): CommandResult {
  const { context } = ctx;

  if (!context) return { output: (lang) => errorLine(ui[lang].term.nav.noContext) };

  const step = stepSection(context, direction);

  if (step.edge) {
    return { output: (lang) => <p className="t-dim">{ui[lang].term.nav[step.edge]}</p> };
  }

  return runSection(pageCommand(context.routeId), [step.section.id]);
}

const themeName = (id: Theme, lang: Lang) => themes.find((t) => t.id === id)?.names[lang] ?? id;

// Lista de temas: cada nome é um botão que roda `tema <nome>`; o atual vem marcado.
function ThemeList({ current, lang, error }: { current: Theme; lang: Lang; error?: string }) {
  return (
    <div>
      {error && <p className="t-err">{error}</p>}
      <p className="t-dim">{lang === 'pt' ? 'temas disponíveis:' : 'available themes:'}</p>
      <ul className="t-index-list">
        {themes.map((theme) => (
          <li key={theme.id}>
            <RunCommand command={`${lang === 'pt' ? 'tema' : 'theme'} ${theme.names[lang]}`}>
              <span className="t-ok">{theme.id === current ? '●' : '○'}</span>
              <span className="t-accent">{theme.names[lang]}</span>
              <span className="t-dim">
                {theme.id === current ? (lang === 'pt' ? 'atual' : 'current') : ''}
              </span>
            </RunCommand>
          </li>
        ))}
      </ul>
    </div>
  );
}

// `tema` alterna claro/escuro; `tema <nome>` escolhe; `tema ls` lista. Nome
// desconhecido não quebra: diz o que não existe e reimprime a lista.
function runTheme(args: string[], ctx: CommandContext): CommandResult {
  if (!args.length) {
    const next = ctx.theme === 'dark' ? 'light' : 'dark';

    if (!ctx.replay) ctx.toggleTheme();

    return {
      output: (lang) => (
        <p className="t-ok">
          {lang === 'pt' ? 'tema: ' : 'theme: '}
          {themeName(next, lang)}
        </p>
      ),
    };
  }

  if (args.length === 1 && ['ls', 'lista', 'list'].includes(fold(args[0]))) {
    return { output: (lang) => <ThemeList current={ctx.theme} lang={lang} /> };
  }

  const theme = args.length === 1 ? findTheme(args[0]) : undefined;

  if (!theme) {
    return {
      output: (lang) => (
        <ThemeList
          current={ctx.theme}
          lang={lang}
          error={`${lang === 'pt' ? 'tema' : 'theme'}: ${args.join(' ')}: ${
            lang === 'pt' ? 'tema não encontrado' : 'theme not found'
          }`}
        />
      ),
    };
  }

  if (!ctx.replay) ctx.setTheme(theme.id);

  return {
    output: (lang) => (
      <p className="t-ok">
        {lang === 'pt' ? 'tema: ' : 'theme: '}
        {theme.names[lang]}
      </p>
    ),
  };
}

const commands: Command[] = [
  {
    names: ['ajuda', 'help'],
    desc: L('lista os comandos', 'list the commands'),
    run: () => ({
      output: (lang) => (
        <div className="t-help">
          <p className="t-dim">
            {lang === 'pt'
              ? 'Comandos disponíveis (português ou inglês funcionam igual):'
              : 'Available commands (Portuguese or English names both work):'}
          </p>
          <dl>
            {commands
              .filter((c) => !c.hidden)
              .map((c) => (
                <div key={c.names[0]}>
                  <dt>
                    <Cmd>{lang === 'pt' ? c.names[0] : c.names[1]}</Cmd>
                    {c.usage && <span className="t-dim"> {c.usage[lang]}</span>}
                  </dt>
                  <dd>{c.desc?.[lang]}</dd>
                </div>
              ))}
          </dl>
          <p className="t-dim">
            {lang === 'pt' ? 'seções dentro das páginas:' : 'sections inside the pages:'}
          </p>
          <dl>
            {HELP_SECTIONS.map(([pt, en, dpt, den]) => (
              <div key={pt}>
                <dt>
                  <Cmd>{lang === 'pt' ? pt : en}</Cmd>
                </dt>
                <dd>{lang === 'pt' ? dpt : den}</dd>
              </div>
            ))}
          </dl>
          <p className="t-dim">
            {ui[lang].term.nav.howTo} {ui[lang].term.nav.howToSteps}
          </p>
          <p className="t-howto">
            {(lang === 'pt'
              ? ['curriculo', '2', 'cd curriculo']
              : ['resume', '2', 'cd resume']
            ).map((step, i) => (
              <span key={step}>
                {i > 0 && <span className="t-dim"> → </span>}
                <RunCommand command={step}>
                  <Cmd>{step}</Cmd>
                </RunCommand>
              </span>
            ))}
          </p>
          <p className="t-dim">
            {lang === 'pt' ? 'Dica: ' : 'Tip: '}
            {shortcuts
              .slice(0, 6)
              .map((s) => shortcutLine(s, lang))
              .join(', ')}
            .
          </p>
        </div>
      ),
    }),
  },
  {
    names: ['sobre', 'whoami'],
    aliases: ['about', 'quemsou'],
    route: 'sobre',
    desc: L('quem é a Duda', 'who Duda is'),
    run: () => ({
      output: (lang) => {
        const about = portfolio[lang].about;

        return (
          <div>
            <p>
              <span className="t-accent">{about.name}</span>
            </p>
            <p className="t-dim">
              {about.role} · {about.location}
            </p>
            <p>{about.bio[0]}</p>
            <p className="t-dim">
              {lang === 'pt' ? 'interesses: ' : 'interests: '}
              {about.interests.join(' · ')}
            </p>
          </div>
        );
      },
    }),
  },
  {
    names: ['ls', 'ls'],
    aliases: ['dir'],
    usage: L('[página]', '[page]'),
    desc: L('lista páginas (ou as seções de uma página)', 'list pages (or the sections of a page)'),
    run: (args) => {
      const target = resolveTarget(args);

      if (target.error === 'page') {
        return {
          output: (lang) =>
            errorLine(
              `ls: ${target.arg}: ${lang === 'pt' ? 'página não encontrada. Tente ls' : 'page not found. Try ls'}`,
            ),
        };
      }
      if (target.error) {
        return {
          output: (lang) =>
            errorLine(
              `ls: ${target.arg}: ${lang === 'pt' ? 'não é um diretório (use ls <página>)' : 'not a directory (use ls <page>)'}`,
            ),
        };
      }
      if (target.route && !target.section) return listSections(target.route);

      return {
        output: (lang) => (
          <ul className="t-ls">
            {directories.map((d) => (
              <li key={d.name}>
                <TermLink to={d.path} className="t-file">
                  {lang === 'pt' ? d.name : d.alias}
                </TermLink>
                <span className="t-dim">
                  {d.desc[lang]}
                  {sectionsOf(d.id).length > 0 && (
                    <>
                      {' '}
                      · {sectionsOf(d.id).length} {lang === 'pt' ? 'seções' : 'sections'}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        ),
      };
    },
  },
  {
    names: ['cd', 'cd'],
    aliases: ['abrir', 'open'],
    usage: L('<página>[/<seção>]', '<page>[/<section>]'),
    desc: L(
      'abre a página própria (e a seção, se informada)',
      'open the page itself (and the section)',
    ),
    run: (args) => {
      const target = resolveTarget(args);

      if (target.home) return { output: () => null, redirect: TERMINAL_PATH };
      if (target.error) {
        return {
          output: (lang) =>
            errorLine(
              target.error === 'page'
                ? `cd: ${target.arg}: ${lang === 'pt' ? 'página não encontrada. Tente ls' : 'page not found. Try ls'}`
                : `cd: ${target.arg}: ${lang === 'pt' ? 'seção não encontrada. Tente ls ' : 'section not found. Try ls '}${lang === 'pt' ? target.route.name : target.route.alias}`,
            ),
        };
      }

      // Só `cd` e "abrir página própria" navegam; passam pelo carregamento.
      return { output: () => null, redirect: targetPath(target.route, target.section) };
    },
  },
  {
    names: [NEXT.pt, NEXT.en],
    aliases: ['n'],
    desc: L('próxima seção da última página aberta', 'next section of the last page opened'),
    run: (args, ctx) => runStep(1, ctx),
  },
  {
    names: [PREVIOUS.pt, PREVIOUS.en],
    aliases: ['p'],
    desc: L('seção anterior da última página aberta', 'previous section of the last page opened'),
    run: (args, ctx) => runStep(-1, ctx),
  },
  {
    names: ['projetos', 'projects'],
    route: 'projetos',
    desc: L('lista os projetos', 'list the projects'),
    run: () => ({
      output: (lang) => (
        <div>
          <ul className="t-table">
            {projects.map((p) => (
              <li key={p.id}>
                <span className="t-dim">{projectPeriod(p, lang)}</span>
                <span className="t-accent">{p.name}</span>
                <span className="t-dim t-wrap">{p.tech.join(', ')}</span>
                <span>
                  {p.repo && <Ext href={p.repo}>github</Ext>}
                  {p.caseStudy && (
                    <TermLink to={p.caseStudy}>
                      {lang === 'pt' ? 'estudo de caso' : 'case study'}
                    </TermLink>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ),
    }),
  },
  {
    names: ['habilidades', 'skills'],
    route: 'habilidades',
    aliases: ['stack'],
    desc: L('stack e ferramentas', 'stack and tools'),
    run: () => ({
      output: (lang) => (
        <dl className="t-kv">
          {portfolio[lang].skills.rows.map(([area, tools]) => (
            <div key={area}>
              <dt>{area}</dt>
              <dd>{tools}</dd>
            </div>
          ))}
        </dl>
      ),
    }),
  },
  {
    names: ['experiencias', 'experience'],
    route: 'experiencias',
    aliases: ['exp'],
    desc: L('experiências e atividades', 'experience and activities'),
    run: () => ({
      output: (lang) => (
        <div>
          {experienceGroups.map((g) => (
            <div key={g.id} className="t-group">
              <p className="t-dim"># {g.title[lang]}</p>
              <ul className="t-table t-table-exp">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <span className="t-accent">{pick(e.org, lang)}</span>
                    <span className="t-wrap">{pick(e.role, lang)}</span>
                    <span className="t-dim">{e.period[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ),
    }),
  },
  {
    names: ['curriculo', 'resume'],
    aliases: ['cv'],
    route: 'curriculo',
    desc: L('resumo do currículo', 'resume summary'),
    run: () => ({ output: (lang) => <ResumeView lang={lang} /> }),
  },
  {
    names: ['academico', 'academics'],
    aliases: ['formacao', 'education'],
    route: 'academico',
    desc: L('trajetória acadêmica', 'academic record'),
    run: () => ({ output: (lang) => <AcademicsView lang={lang} /> }),
  },
  {
    names: ['servicos', 'services'],
    route: 'servicos',
    desc: L('serviços oferecidos', 'services offered'),
    run: () => ({ output: (lang) => <ServicesView lang={lang} /> }),
  },
  {
    names: ['contato', 'contact'],
    route: 'contato',
    aliases: ['social', 'email'],
    desc: L('e-mail e redes', 'email and socials'),
    run: () => ({
      output: (lang) => (
        <dl className="t-kv">
          <div>
            <dt>email</dt>
            <dd>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </dd>
          </div>
          <div>
            <dt>github</dt>
            <dd>
              <Ext href={profile.github}>{profile.github.replace('https://', '')}</Ext>
            </dd>
          </div>
          <div>
            <dt>linkedin</dt>
            <dd>
              <Ext href={profile.linkedin}>{profile.linkedin.replace('https://', '')}</Ext>
            </dd>
          </div>
          <div>
            <dt>{lang === 'pt' ? 'formulário' : 'form'}</dt>
            <dd>
              <TermLink to="/contato">/contato</TermLink>
            </dd>
          </div>
        </dl>
      ),
    }),
  },
  {
    names: ['tema', 'theme'],
    usage: L('[nome | ls]', '[name | ls]'),
    desc: L(
      'alterna claro/escuro, ou escolhe um tema (tema ls lista)',
      'toggle light/dark, or pick a theme (theme ls lists them)',
    ),
    run: runTheme,
  },
  {
    names: ['idioma', 'lang'],
    aliases: ['language', 'en', 'pt'],
    desc: L('alterna português/inglês', 'switch Portuguese/English'),
    run: (args, ctx) => {
      if (!ctx.replay) ctx.toggleLang();

      return {
        output: (lang) => (
          <p className="t-ok">{lang === 'pt' ? 'idioma: português' : 'language: English'}</p>
        ),
      };
    },
  },
  {
    names: ['historico', 'history'],
    desc: L('comandos já digitados', 'commands typed so far'),
    run: (args, ctx) => ({
      output: (lang) => (
        <>
          <ol className="t-history">
            {ctx.history.map((h, i) => (
              <li key={i}>
                <span className="t-dim">{String(i + 1).padStart(3, ' ')}</span> {h}
              </li>
            ))}
          </ol>
          <p className="t-dim">
            {lang === 'pt'
              ? `${ctx.history.length} ${ctx.history.length === 1 ? 'comando' : 'comandos'} até agora. O histórico não mente.`
              : `${ctx.history.length} ${ctx.history.length === 1 ? 'command' : 'commands'} so far. History never lies.`}
          </p>
        </>
      ),
    }),
  },
  {
    names: ['inicio', 'home'],
    desc: L('volta à tela inicial do terminal', 'back to the terminal home screen'),
    run: () => ({ clear: true, output: () => null }),
  },
  {
    names: ['limpar', 'clear'],
    aliases: ['cls'],
    desc: L('limpa a tela', 'clear the screen'),
    run: () => ({ clear: true, output: () => null }),
  },
  {
    names: ['atalhos', 'shortcuts'],
    aliases: ['keys'],
    desc: L('atalhos de teclado', 'keyboard shortcuts'),
    run: () => ({
      output: (lang) => (
        <dl className="t-kv t-shortcuts">
          {shortcuts.map((s) => (
            <div key={s.keys}>
              <dt>{s.keys}</dt>
              <dd>{s.desc[lang]}</dd>
            </div>
          ))}
        </dl>
      ),
    }),
  },
  ...extraCommands,
  // Comandos "de shell" que não aparecem na ajuda.
  {
    names: ['pwd', 'pwd'],
    hidden: true,
    run: () => ({ output: () => <p>/home/visitante/mariab.dev</p> }),
  },
  {
    names: ['echo', 'echo'],
    hidden: true,
    run: (args) => ({ output: () => <p>{args.join(' ')}</p> }),
  },
  {
    names: ['data', 'date'],
    hidden: true,
    run: () => {
      const now = new Date();

      return {
        output: (lang) => <p>{now.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')}</p>,
      };
    },
  },
  {
    names: ['sudo', 'sudo'],
    hidden: true,
    run: (args) =>
      args.length === 1 && HIRE.includes(fold(args[0]))
        ? hireResult()
        : {
            output: (lang) => (
              <p className="t-err">
                {lang === 'pt'
                  ? 'visitante não está no arquivo sudoers. Este incidente será reportado. 🙂'
                  : 'visitante is not in the sudoers file. This incident will be reported. 🙂'}
              </p>
            ),
          },
  },
];

function allNames(command: Command) {
  return [...new Set([...command.names, ...(command.aliases ?? [])])];
}

export function findCommand(name: string) {
  const key = fold(name);

  return commands.find((c) => allNames(c).some((n) => fold(n) === key));
}

// Quebra a linha em nome e argumentos; aceita aspas ("..." ou '...') e espaços extras.
export function parse(input: string) {
  const tokens = [...input.trim().matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
  const [name = '', ...args] = tokens;

  return { name, args };
}

// curriculo/competencias → nome `curriculo` + argumento `competencias`.
function parseCommand(input: string) {
  let { name, args } = parse(input);

  if (name.includes('/') && !name.startsWith('/')) {
    const [head, ...rest] = name.split('/');

    name = head;
    args = [...rest.filter(Boolean), ...args];
  }

  return { name, args };
}

// Contexto da navegação: a última página com índice (e a seção) aberta aqui.
// É o que dá sentido a `2`, `proximo` e `anterior` sozinhos. Função pura: o
// replay do histórico a reaplica sem rodar efeito nenhum.
//   { routeId, sectionId | null }  ou  null (nenhum índice aberto)
export function contextAfter(input: string, prev: NavContext | null = null): NavContext | null {
  const { name, args } = parseCommand(input);

  // Número sozinho: seção da última página aberta (número fora do índice → o índice).
  if (/^\d+$/.test(name) && !args.length) {
    return prev
      ? { routeId: prev.routeId, sectionId: findSection(prev.routeId, name)?.id ?? null }
      : prev;
  }

  const command = name ? findCommand(name) : undefined;

  if (!command) return prev;

  const id = command.names[0];

  if (id === 'limpar' || id === 'inicio') return null;
  if (id === NEXT.pt || id === PREVIOUS.pt) {
    const step = prev ? stepSection(prev, id === NEXT.pt ? 1 : -1) : undefined;

    return prev && step?.section ? { routeId: prev.routeId, sectionId: step.section.id } : prev;
  }
  if (id === 'cd') return resolveTarget(args).home ? null : prev;
  if (id === 'ls') {
    const target = resolveTarget(args);
    const listed = target.route && !target.error && !target.section;

    return listed && sectionsOf(target.route.id).length
      ? { routeId: target.route.id, sectionId: null }
      : prev;
  }
  if (command.route && sectionsOf(command.route).length) {
    const section = args.length === 1 ? findSection(command.route, args[0]) : undefined;

    return { routeId: command.route, sectionId: section?.id ?? null };
  }

  return prev;
}

// Reconstrói o contexto de um histórico inteiro (sessão restaurada).
export const contextOfHistory = (inputs: string[]) =>
  inputs.reduce<NavContext | null>((ctx, input) => contextAfter(input, ctx), null);

export function runCommand(input: string, ctx: CommandContext): CommandResult {
  const { name, args } = parseCommand(input);

  if (!name) return { output: () => null };
  // `2` sozinho abre a seção 2 da última página aberta; com a pergunta de persona
  // pendente (ainda não há página aberta), `1`–`5` respondem a ela.
  if (/^\d+$/.test(name) && !args.length) {
    const answer = personaAnswer(name, ctx);

    if (answer) return answer;

    return ctx.context
      ? runSection(pageCommand(ctx.context.routeId), [name])
      : { output: (lang) => errorLine(ui[lang].term.nav.noContext) };
  }

  const command = findCommand(name);

  if (!command) {
    // O nome de uma persona, dito sozinho, também responde à pergunta pendente.
    const answer = args.length ? undefined : personaAnswer(name, ctx);

    if (answer) return answer;

    return {
      output: (lang) => (
        <p className="t-err">
          {name}: {lang === 'pt' ? 'comando não encontrado. Digite ' : 'command not found. Type '}
          <Cmd>{lang === 'pt' ? 'ajuda' : 'help'}</Cmd>
        </p>
      ),
    };
  }
  if (command.route && args.length) return runSection(command, args);

  const result = command.run(args, ctx);

  if (!command.route || !result.output) return result;

  // Todo comando com página dedicada termina com o par "ver no terminal /
  // abrir página própria".
  const body = result.output;
  const routeId = command.route;
  const hasSections = sectionsOf(routeId).length > 0;

  return {
    ...result,
    output: (lang) => (
      <>
        {body(lang)}
        {hasSections && <PageIndex routeId={routeId} />}
        <ActionLine routeId={routeId} />
      </>
    ),
  };
}

const NAV_COMMANDS = ['cd', 'ls', 'open', 'abrir', 'dir'];

// Opções que começam com o prefixo: primeiro os nomes do idioma atual; se
// nenhum servir, os do outro idioma.
function matching(candidates: Localized[], prefix: string, lang: Lang) {
  const key = fold(prefix);
  const own = [...new Set(candidates.map((c) => c[lang]))].filter((n) => fold(n).startsWith(key));

  if (own.length) return own;

  const other = lang === 'pt' ? 'en' : 'pt';

  return [...new Set(candidates.map((c) => c[other]))].filter((n) => fold(n).startsWith(key));
}

const finish = (input: string, last: string, options: string[]) => {
  const head = input.slice(0, input.length - last.length);

  if (options.length === 1) return head + options[0];

  return options.length ? options : input;
};

// Autocompletar com Tab: comando; depois de cd/ls/open, a página; depois de
// "<página>/" ou "<página> ", a seção interna (também em "<página> <seção>").
export function complete(input: string, lang: Lang): string | string[] {
  const { name, args } = parse(input);
  const endsWithSpace = /\s$/.test(input);

  if (!args.length && !endsWithSpace && !name.includes('/')) {
    const visible = commands.filter((c) => !c.hidden);
    const preferred = visible.map((c) => (lang === 'pt' ? c.names[0] : c.names[1]));
    const others = visible.flatMap(allNames);
    const prefix = fold(name);
    // Com um único comando do idioma atual, completa nele; senão lista as opções.
    const own = [...new Set(preferred)].filter((n) => fold(n).startsWith(prefix));

    if (own.length === 1) return `${own[0]} `;

    const options = [...new Set([...preferred, ...others])].filter((n) =>
      fold(n).startsWith(prefix),
    );

    return options.length === 1 ? `${options[0]} ` : options.length ? options : input;
  }

  const head = name.split('/')[0];
  const command = findCommand(head);
  const isNav = NAV_COMMANDS.includes(head.toLowerCase());

  if (!command || (!isNav && !command.route)) return input;

  // Partes já digitadas depois do comando, e o pedaço que está sendo completado.
  const typed = name.includes('/')
    ? [...name.split('/').slice(1), ...splitTarget(args)]
    : splitTarget(args);
  const tail = /[\s/]$/.test(input) ? '' : (typed.pop() ?? '');
  const parts = isNav ? typed : [command.route as string, ...typed];

  if (isNav && parts.length === 0) {
    return finish(
      input,
      tail,
      matching(
        directories.map((d) => ({ pt: d.name, en: d.alias })),
        tail,
        lang,
      ),
    );
  }
  if (parts.length === 1) {
    const route = isNav
      ? directories.find((d) => fold(d.name) === fold(parts[0]) || fold(d.alias) === fold(parts[0]))
      : undefined;
    const routeId = isNav ? route?.id : command.route;

    if (!routeId) return input;

    const sections = sectionsOf(routeId).map((sec) => ({ pt: sec.name, en: sec.alias }));

    return finish(input, tail, matching(sections, tail, lang));
  }

  return input;
}

// Atalhos clicáveis abaixo do terminal (essenciais no celular).
export const quickCommands = {
  pt: ['inicio', 'ajuda', 'ls', 'sobre', 'projetos', 'curriculo', 'academico', 'contato'],
  en: ['home', 'help', 'ls', 'whoami', 'projects', 'resume', 'academics', 'contact'],
};

// Inventário para testes e documentação: todos os comandos e seus nomes.
export const commandInventory = () =>
  commands.map((c) => ({
    id: c.names[0],
    names: allNames(c),
    hidden: Boolean(c.hidden),
    route: c.route ?? null,
    desc: c.desc ?? null,
    usage: c.usage ?? null,
  }));
