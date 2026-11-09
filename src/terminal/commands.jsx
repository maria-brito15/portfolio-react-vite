// Interpretador do terminal da página inicial.
//
// `runCommand(input, ctx)` devolve { output, clear } sem tocar no DOM:
// - `output(lang)` desenha a resposta no idioma atual (trocar de idioma
//   re-desenha o histórico inteiro);
// - os efeitos (navegar, trocar tema/idioma) passam por `ctx` e só rodam
//   quando `ctx.replay` é falso. No replay (histórico restaurado ao voltar
//   para a página) a saída é refeita sem repetir os efeitos.
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { experienceGroups } from '../data/experiences';
import { portfolio } from '../data/portfolio';
import { directories, fold } from '../data/routes';
import { findSection, resolveTarget, sectionsOf, splitTarget, targetPath } from '../data/sections';
import { formatProjectDate } from '../utils/projectDate';
import { ActionLine, Cmd, Ext, TermLink } from './outputs';
import { AcademicsView, ResumeView, ServicesView } from './views';
import SectionView from './sectionViews';

const L = (pt, en) => ({ pt, en });

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

const errorLine = (text) => <p className="t-err">{text}</p>;
const pick = (value, lang) =>
  value && typeof value === 'object' && 'pt' in value ? value[lang] : value;

// ---------------------------------------------------------------------------
// Comandos. `names[0]` é o nome em português, `names[1]` o em inglês.
// ---------------------------------------------------------------------------
// `ls <página>`: seções internas, cada uma com a linha de comando para lê-la.
function listSections(route) {
  const sections = sectionsOf(route.id);
  return {
    output: (lang) => {
      const page = lang === 'pt' ? route.name : route.alias;
      if (!sections.length) {
        return (
          <>
            <p className="t-dim">
              {page}:{' '}
              {lang === 'pt' ? 'esta página não tem seções; use' : 'this page has no sections; use'}{' '}
              <Cmd>{page}</Cmd>
            </p>
            <ActionLine routeId={route.id} />
          </>
        );
      }
      return (
        <>
          <ul className="t-ls t-ls-sections">
            {sections.map((sec) => (
              <li key={sec.id}>
                <Cmd>
                  {page} {lang === 'pt' ? sec.name : sec.alias}
                </Cmd>
                <span className="t-dim">
                  {sec.label[lang]}
                  {sec.desc ? ` · ${sec.desc[lang]}` : ''}
                </span>
              </li>
            ))}
          </ul>
          <ActionLine routeId={route.id} />
        </>
      );
    },
  };
}

// `<página> <seção>`: conteúdo completo da seção, lido dos dados da página.
function runSection(command, args) {
  const route = command.route;
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
    return {
      output: (lang) =>
        errorLine(
          `${lang === 'pt' ? name : command.names[1]}: "${bad}": ${lang === 'pt' ? 'seção não encontrada. Tente ls ' : 'section not found. Try ls '}${lang === 'pt' ? name : command.names[1]}`,
        ),
    };
  }
  return {
    output: (lang) => (
      <>
        <SectionView routeId={route} section={section} lang={lang} />
        <ActionLine routeId={route} section={section} />
      </>
    ),
  };
}

const commands = [
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
                  <dd>{c.desc[lang]}</dd>
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
            {lang === 'pt'
              ? 'Dica: Tab completa (inclusive seções), ↑ ↓ navegam no histórico, Ctrl+L limpa a tela, Ctrl+K foca a barra.'
              : 'Tip: Tab completes (sections too), ↑ ↓ browse history, Ctrl+L clears the screen, Ctrl+K focuses the bar.'}
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
      if (target.home) return { output: () => null, redirect: '/' };
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
    names: ['projetos', 'projects'],
    route: 'projetos',
    desc: L('lista os projetos', 'list the projects'),
    run: () => ({
      output: (lang) => (
        <div>
          <ul className="t-table">
            {projects.map((p) => (
              <li key={p.id}>
                <span className="t-dim">{formatProjectDate(p.date)}</span>
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
    desc: L('alterna claro/escuro', 'toggle light/dark'),
    run: (args, ctx) => {
      const next = ctx.theme === 'dark' ? 'light' : 'dark';
      if (!ctx.replay) ctx.toggleTheme();
      return {
        output: (lang) => (
          <p className="t-ok">
            {lang === 'pt' ? 'tema: ' : 'theme: '}
            {next === 'dark'
              ? lang === 'pt'
                ? 'escuro'
                : 'dark'
              : lang === 'pt'
                ? 'claro'
                : 'light'}
          </p>
        ),
      };
    },
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
      output: () => (
        <ol className="t-history">
          {ctx.history.map((h, i) => (
            <li key={i}>
              <span className="t-dim">{String(i + 1).padStart(3, ' ')}</span> {h}
            </li>
          ))}
        </ol>
      ),
    }),
  },
  {
    names: ['limpar', 'clear'],
    aliases: ['cls'],
    desc: L('limpa a tela', 'clear the screen'),
    run: () => ({ clear: true, output: () => null }),
  },
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
    run: () => ({
      output: (lang) => (
        <p className="t-err">
          {lang === 'pt'
            ? 'visitante não está no arquivo sudoers. Este incidente será reportado. 🙂'
            : 'visitante is not in the sudoers file. This incident will be reported. 🙂'}
        </p>
      ),
    }),
  },
];

function allNames(command) {
  return [...new Set([...command.names, ...(command.aliases ?? [])])];
}

export function findCommand(name) {
  const key = fold(name);
  return commands.find((c) => allNames(c).some((n) => fold(n) === key));
}

// Quebra a linha em nome e argumentos; aceita aspas ("..." ou '...') e espaços extras.
export function parse(input) {
  const tokens = [...input.trim().matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
  const [name = '', ...args] = tokens;
  return { name, args };
}

export function runCommand(input, ctx) {
  let { name, args } = parse(input);
  if (!name) return { output: () => null };
  // curriculo/competencias → curriculo competencias
  if (name.includes('/') && !name.startsWith('/')) {
    const [head, ...rest] = name.split('/');
    name = head;
    args = [...rest.filter(Boolean), ...args];
  }
  const command = findCommand(name);
  if (!command) {
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
  return {
    ...result,
    output: (lang) => (
      <>
        {body(lang)}
        <ActionLine routeId={command.route} />
      </>
    ),
  };
}

const NAV_COMMANDS = ['cd', 'ls', 'open', 'abrir', 'dir'];

// Opções que começam com o prefixo: primeiro os nomes do idioma atual; se
// nenhum servir, os do outro idioma.
function matching(candidates, prefix, lang) {
  const key = fold(prefix);
  const own = [...new Set(candidates.map((c) => c[lang]))].filter((n) => fold(n).startsWith(key));
  if (own.length) return own;
  const other = lang === 'pt' ? 'en' : 'pt';
  return [...new Set(candidates.map((c) => c[other]))].filter((n) => fold(n).startsWith(key));
}

const finish = (input, last, options) => {
  const head = input.slice(0, input.length - last.length);
  if (options.length === 1) return head + options[0];
  return options.length ? options : input;
};

// Autocompletar com Tab: comando; depois de cd/ls/open, a página; depois de
// "<página>/" ou "<página> ", a seção interna (também em "<página> <seção>").
export function complete(input, lang) {
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
  const parts = isNav ? typed : [command.route, ...typed];

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
  pt: ['ajuda', 'ls', 'sobre', 'projetos', 'curriculo', 'academico', 'contato'],
  en: ['help', 'ls', 'whoami', 'projects', 'resume', 'academics', 'contact'],
};

// Inventário para testes e documentação: todos os comandos e seus nomes.
export const commandInventory = () =>
  commands.map((c) => ({
    id: c.names[0],
    names: allNames(c),
    hidden: Boolean(c.hidden),
    route: c.route ?? null,
  }));
