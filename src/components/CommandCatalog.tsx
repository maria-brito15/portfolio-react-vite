// Documentação dos comandos do terminal, por categoria, com botões que rodam o
// comando na sessão. Lê o inventário de `commands.tsx` (via terminal/catalog).
import { useLanguage } from '../i18n/LanguageContext';
import { CATEGORIES, commandsIn, type CommandCategory } from '../terminal/catalog';
import { seriesTone } from '../data/tones';
import SectionTitle from './ui/SectionTitle';
import RunButton from './RunButton';

export default function CommandCatalog({
  only,
  go = false,
  title,
  lead,
}: {
  // Mostra só estas categorias (o Game Center mostra "fun").
  only?: CommandCategory[];
  go?: boolean;
  title: string;
  lead: string;
}) {
  const { lang, t } = useLanguage();
  const idx = lang === 'pt' ? 0 : 1;

  return (
    <section className="catalog" aria-labelledby="catalog-title">
      <SectionTitle as="h2" id="catalog-title" size="md">
        {title}
      </SectionTitle>
      <p className="t-dim">{lead}</p>
      <div className="catalog-grid">
        {(only ?? CATEGORIES).map((category, i) => (
          <div key={category} className="catalog-group" data-tone={seriesTone(i)}>
            <h3>{t.ws.terminal.categories[category]}</h3>
            <ul>
              {commandsIn(category).map((c) => {
                const name = c.names[idx];

                return (
                  <li key={c.id}>
                    <div className="catalog-cmd">
                      {c.needsArg ? <code>{name}</code> : <RunButton command={name} go={go} />}
                      {c.usage && <span className="t-dim"> {c.usage[lang]}</span>}
                    </div>
                    <p>
                      {c.desc?.[lang]}
                      {c.needsArg && <span className="t-dim"> · {t.ws.terminal.needsArg}</span>}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
