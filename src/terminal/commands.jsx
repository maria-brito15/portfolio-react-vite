// Interpretador do terminal da página inicial.
//
// `runCommand(input, ctx)` devolve { output, clear } sem tocar no DOM:
// - `output(lang)` desenha a resposta no idioma atual (trocar de idioma
//   re-desenha o histórico inteiro);
// - os efeitos (navegar, trocar tema/idioma) passam por `ctx` e só rodam
//   quando `ctx.replay` é falso. No replay (histórico restaurado ao voltar
//   para a página) a saída é refeita sem repetir os efeitos.
import { Link } from '../router';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { experienceGroups } from '../data/experiences';
import { portfolio } from '../data/portfolio';
import { academics } from '../data/academics';
import { formatProjectDate } from '../utils/projectDate';

const L = (pt, en) => ({ pt, en });
const pick = (value, lang) =>
  value && typeof value === 'object' && 'pt' in value ? value[lang] : value;

// Diretórios: seções da página inicial e páginas do site.
export const directories = [
  { name: 'sobre', alias: 'about', to: '/#sobre', desc: L('quem sou', 'who I am') },
  {
    name: 'habilidades',
    alias: 'skills',
    to: '/#habilidades',
    desc: L('stack e ferramentas', 'stack and tools'),
  },
  {
    name: 'projetos',
    alias: 'projects',
    to: '/#projetos',
    desc: L('linha do tempo de projetos', 'project timeline'),
  },
  {
    name: 'experiencias',
    alias: 'experience',
    to: '/#experiencias',
    desc: L('além da sala de aula', 'beyond the classroom'),
  },
  {
    name: 'contato',
    alias: 'contact',
    to: '/#contato',
    desc: L('e-mail, LinkedIn, GitHub', 'email, LinkedIn, GitHub'),
  },
  {
    name: 'curriculo',
    alias: 'resume',
    to: '/curriculo',
    desc: L('currículo em uma página', 'one-page resume'),
    page: true,
  },
  {
    name: 'academico',
    alias: 'academics',
    to: '/academico',
    desc: L('formação e trajetória', 'education and record'),
    page: true,
  },
  {
    name: 'servicos',
    alias: 'services',
    to: '/servicos',
    desc: L('sites e landing pages', 'websites and landing pages'),
    page: true,
  },
];

function findDirectory(arg) {
  const name = (arg ?? '')
    .toLowerCase()
    .replace(/^\.?\/+|\/+$/g, '')
    .replace(/^~\/?/, '');
  return directories.find((d) => d.name === name || d.alias === name);
}

const Ext = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

const Cmd = ({ children }) => <span className="t-cmd">{children}</span>;

// ---------------------------------------------------------------------------
// Comandos. `names[0]` é o nome em português, `names[1]` o em inglês.
// ---------------------------------------------------------------------------
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
            {lang === 'pt'
              ? 'Dica: Tab completa, ↑ ↓ navegam no histórico, Ctrl+L limpa a tela.'
              : 'Tip: Tab completes, ↑ ↓ browse history, Ctrl+L clears the screen.'}
          </p>
        </div>
      ),
    }),
  },
  {
    names: ['sobre', 'whoami'],
    aliases: ['about', 'quemsou'],
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
            <p className="t-dim">
              {lang === 'pt' ? 'mais em ' : 'more at '}
              <Link to="/#sobre">/#sobre</Link>
            </p>
          </div>
        );
      },
    }),
  },
  {
    names: ['ls', 'ls'],
    aliases: ['dir'],
    desc: L('lista seções e páginas', 'list sections and pages'),
    run: () => ({
      output: (lang) => (
        <ul className="t-ls">
          {directories.map((d) => (
            <li key={d.name}>
              <Link to={d.to} className={d.page ? 't-file' : 't-dir'}>
                {lang === 'pt' ? d.name : d.alias}
                {d.page ? '' : '/'}
              </Link>
              <span className="t-dim">{d.desc[lang]}</span>
            </li>
          ))}
        </ul>
      ),
    }),
  },
  {
    names: ['cd', 'cd'],
    aliases: ['abrir', 'open'],
    usage: L('<seção>', '<section>'),
    desc: L('vai até uma seção ou página', 'go to a section or page'),
    run: (args, ctx) => {
      const arg = args[0];
      if (!arg || arg === '~' || arg === '..' || arg === '/') {
        if (!ctx.replay) ctx.navigate('/');
        return { output: () => null };
      }
      const dir = findDirectory(arg);
      if (!dir) {
        return {
          output: (lang) => (
            <p className="t-err">
              cd: {arg}:{' '}
              {lang === 'pt' ? 'diretório não encontrado. Tente ' : 'no such directory. Try '}
              <Cmd>ls</Cmd>
            </p>
          ),
        };
      }
      if (!ctx.replay) ctx.navigate(dir.to);
      return {
        output: (lang) => (
          <p className="t-dim">
            {dir.page
              ? lang === 'pt'
                ? 'abrindo '
                : 'opening '
              : lang === 'pt'
                ? 'indo para '
                : 'going to '}
            <Link to={dir.to}>{dir.to}</Link>
          </p>
        ),
      };
    },
  },
  {
    names: ['projetos', 'projects'],
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
                    <Link to={p.caseStudy}>{lang === 'pt' ? 'estudo de caso' : 'case study'}</Link>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="t-dim">
            {lang === 'pt' ? 'detalhes: ' : 'details: '}
            <Cmd>cd {lang === 'pt' ? 'projetos' : 'projects'}</Cmd>
          </p>
        </div>
      ),
    }),
  },
  {
    names: ['habilidades', 'skills'],
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
    desc: L('abre o currículo', 'open the resume'),
    run: (args, ctx) => openPage('/curriculo', ctx),
  },
  {
    names: ['academico', 'academics'],
    aliases: ['formacao', 'education'],
    desc: L('abre a trajetória acadêmica', 'open the academic record'),
    run: (args, ctx) => {
      const result = openPage('/academico', ctx);
      return {
        output: (lang) => (
          <div>
            <ul className="t-table">
              {academics.programs.map((p) => (
                <li key={p.id}>
                  <span className="t-dim">
                    {p.start}–{p.end}
                    {p.expected ? '*' : ''}
                  </span>
                  <span className="t-accent">{p.institution}</span>
                  <span className="t-wrap">{p.degree[lang]}</span>
                </li>
              ))}
            </ul>
            {result.output(lang)}
          </div>
        ),
      };
    },
  },
  {
    names: ['servicos', 'services'],
    desc: L('abre a página de serviços', 'open the services page'),
    run: (args, ctx) => openPage('/servicos', ctx),
  },
  {
    names: ['contato', 'contact'],
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
              <Link to="/#contato">/#contato</Link>
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

function openPage(to, ctx) {
  if (!ctx.replay) ctx.navigate(to);
  return {
    output: (lang) => (
      <p className="t-dim">
        {lang === 'pt' ? 'abrindo ' : 'opening '}
        <Link to={to}>{to}</Link>
      </p>
    ),
  };
}

function allNames(command) {
  return [...new Set([...command.names, ...(command.aliases ?? [])])];
}

export function findCommand(name) {
  const key = name.toLowerCase();
  return commands.find((c) => allNames(c).includes(key));
}

export function parse(input) {
  const [name = '', ...args] = input.trim().split(/\s+/);
  return { name, args };
}

export function runCommand(input, ctx) {
  const { name, args } = parse(input);
  if (!name) return { output: () => null };
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
  return command.run(args, ctx);
}

// Autocompletar com Tab: completa o comando e, depois de `cd`, o diretório.
export function complete(input, lang) {
  const { name, args } = parse(input);
  const endsWithSpace = /\s$/.test(input);
  if (!args.length && !endsWithSpace) {
    const visible = commands.filter((c) => !c.hidden);
    const preferred = visible.map((c) => (lang === 'pt' ? c.names[0] : c.names[1]));
    const others = visible.flatMap(allNames);
    const prefix = name.toLowerCase();
    // Com um único comando do idioma atual, completa nele; senão lista as opções.
    const own = [...new Set(preferred)].filter((n) => n.startsWith(prefix));
    if (own.length === 1) return `${own[0]} `;
    const options = [...new Set([...preferred, ...others])].filter((n) => n.startsWith(prefix));
    return options.length === 1 ? `${options[0]} ` : options.length ? options : input;
  }
  if (['cd', 'abrir', 'open'].includes(name.toLowerCase()) && args.length <= 1) {
    const prefix = (args[0] ?? '').toLowerCase();
    const options = directories
      .map((d) => (lang === 'pt' ? d.name : d.alias))
      .filter((n) => n.startsWith(prefix));
    return options.length === 1 ? `${name} ${options[0]}` : options.length ? options : input;
  }
  return input;
}

// Atalhos clicáveis abaixo do terminal (essenciais no celular).
export const quickCommands = {
  pt: ['ajuda', 'sobre', 'projetos', 'curriculo', 'academico', 'contato'],
  en: ['help', 'whoami', 'projects', 'resume', 'academics', 'contact'],
};
