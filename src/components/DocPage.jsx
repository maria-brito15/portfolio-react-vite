import Header from './Header';
import Footer from './Footer';
import { useLanguage } from '../i18n/LanguageContext';
import { Prompt } from '../terminal/Terminal';

// Moldura comum de Currículo e Acadêmico: cabeçalho do site, a "linha de
// comando" que abriu a página e um índice numerado das seções.
export default function DocPage({ command, sections, actions, children }) {
  const { t } = useLanguage();
  const links = [
    { to: '/', label: t.nav.portfolio },
    { to: '/curriculo', label: t.nav.resume },
    { to: '/academico', label: t.nav.academics },
    { to: '/#projetos', label: t.nav.projects },
    { to: '/#contato', label: t.nav.contact },
  ];
  return (
    <>
      <Header links={links} />
      <main className="doc">
        <div className="doc-cmd">
          <p className="term-line">
            <Prompt />
            <span className="t-input">{command}</span>
          </p>
          {actions}
        </div>
        <div className="doc-layout">
          <aside className="doc-toc" aria-label={t.doc.toc}>
            <ol>
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span className="doc-num">{String(i + 1).padStart(2, '0')}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </aside>
          <div className="doc-body">{children}</div>
        </div>
      </main>
      <Footer>{t.footer}</Footer>
    </>
  );
}

export function DocSection({ id, index, title, summary, children }) {
  return (
    <section className="doc-sec" id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>
        <span className="doc-num" aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        {title}
      </h2>
      {summary && <p className="doc-summary">{summary}</p>}
      {children}
    </section>
  );
}
