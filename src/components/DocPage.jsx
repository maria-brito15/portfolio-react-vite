import SiteShell from './shell/SiteShell';
import { useLanguage } from '../i18n/LanguageContext';

// Conteúdo comum de Currículo e Acadêmico, dentro da Window do SiteShell:
// índice numerado das seções à esquerda e o corpo do documento à direita.
export default function DocPage({ routeId, sections, actions, children }) {
  const { t } = useLanguage();
  return (
    <SiteShell routeId={routeId}>
      <div className="doc">
        {actions}
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
      </div>
    </SiteShell>
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
