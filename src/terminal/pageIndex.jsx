// Índice numerado das seções de uma página e a barra de vizinhos: a própria
// saída ensina o próximo passo (número, nome, clique, cd, ls, ajuda).
// O mesmo componente serve ao comando da página e ao `ls <página>`.
import { useLanguage } from '../i18n/LanguageContext';
import { routeById } from '../data/routes';
import { neighbors, sectionsOf } from '../data/sections';
import { ui } from '../i18n/ui';
import { Cmd } from './outputs';
import { useTerminalSession } from './sessionContext';

// Nome do comando da página e da seção no idioma atual.
export const pageName = (route, lang) => (lang === 'pt' ? route.name : route.alias);
export const sectionName = (section, lang) => (lang === 'pt' ? section.name : section.alias);

// Botão que executa um comando: mouse e toque sem digitar (essencial no celular).
export function RunCommand({ command, className = '', children }) {
  const session = useTerminalSession();
  return (
    <button
      type="button"
      className={`t-run ${className}`.trim()}
      onClick={() => session.execute(command)}
      disabled={session.busy}
    >
      {children}
    </button>
  );
}

export function PageIndex({ routeId, error }) {
  const { lang } = useLanguage();
  const route = routeById(routeId);
  const sections = sectionsOf(routeId);
  const t = ui[lang].term.nav;
  const page = pageName(route, lang);
  const example = sections[1] ?? sections[0];
  const exampleNumber = sections[1] ? 2 : 1;

  return (
    <div className="t-index">
      {error && <p className="t-err">{error}</p>}
      <p>
        <span className="t-accent">{page}</span>
        <span className="t-dim">
          {' '}
          — {route.label[lang]} · {route.desc[lang]}
        </span>
      </p>
      <p className="t-dim">{t.count(sections.length)}</p>
      <ul className="t-index-list">
        {sections.map((section, i) => (
          <li key={section.id}>
            <RunCommand command={`${page} ${i + 1}`}>
              <span className="t-warn">[{i + 1}]</span>
              <span className="t-accent">{sectionName(section, lang)}</span>
              <span className="t-dim t-wrap">{section.desc?.[lang] ?? section.label[lang]}</span>
            </RunCommand>
          </li>
        ))}
      </ul>
      <p className="t-dim">
        → {t.viewSection} <Cmd>{`${page} ${exampleNumber}`}</Cmd> ({t.or}){' '}
        <Cmd>{`${page} ${sectionName(example, lang)}`}</Cmd>
      </p>
      <p className="t-dim">
        → {t.openPage} <Cmd>{`cd ${page}`}</Cmd> · {t.listAgain} <Cmd>{`ls ${page}`}</Cmd>
      </p>
      <p className="t-dim">
        → {t.home} <Cmd>cd ~</Cmd> · {t.help} <Cmd>{lang === 'pt' ? 'ajuda' : 'help'}</Cmd>
      </p>
    </div>
  );
}

// Fim de uma seção: próxima · anterior · índice (clicáveis).
export function SectionNav({ routeId, section }) {
  const { lang } = useLanguage();
  const route = routeById(routeId);
  const t = ui[lang].term.nav;
  const page = pageName(route, lang);
  const { number, prev, next } = neighbors(routeId, section.id);
  const item = (label, target, n) =>
    target ? (
      <RunCommand command={`${page} ${n}`}>
        {label}: <Cmd>{`${page} ${n}`}</Cmd> ({sectionName(target, lang)})
      </RunCommand>
    ) : (
      <span className="t-dim">
        {label}: {label === t.next ? t.last : t.first}
      </span>
    );
  return (
    <p className="t-dim t-sectionnav">
      {item(t.next, next, number + 1)} · {item(t.previous, prev, number - 1)} ·{' '}
      <RunCommand command={page}>
        {t.index}: <Cmd>{page}</Cmd>
      </RunCommand>
    </p>
  );
}
