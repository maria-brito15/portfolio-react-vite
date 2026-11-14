import { theater, type TheaterData } from '../../data/personal/theater';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';
import CuratedEntry from './CuratedEntry';
import EditorialSection from './EditorialSection';

// Parte da página de teatro que vem de `data/personal/theater.ts` (sem rede): vivências,
// produções favoritas, observações e referências visuais. Seção sem item não aparece. As peças
// vistas continuam em `TheaterTimeline` (mesma curadoria, passa pela fonte `manual`).
export default function TheaterProfile({ data = theater }: { data?: TheaterData }) {
  const { lang } = useLanguage();
  const text = usePersonalText().theater;

  return (
    <>
      {data.experiences.length > 0 && (
        <EditorialSection title={text.experiences}>
          <ol className="pe-entries">
            {data.experiences.map((item, i) => (
              <CuratedEntry
                key={item.id}
                index={i}
                title={item.title[lang]}
                meta={item.period}
                note={item.note?.[lang]}
                noteLabel={text.note}
              />
            ))}
          </ol>
        </EditorialSection>
      )}
      {data.favorites.length > 0 && (
        <EditorialSection title={text.favorites}>
          <ol className="pe-entries">
            {data.favorites.map((item, i) => (
              <CuratedEntry
                key={item.id}
                index={i}
                title={item.title}
                meta={[item.company, item.year].filter(Boolean).join(' · ')}
                note={item.note?.[lang]}
                noteLabel={text.note}
              />
            ))}
          </ol>
        </EditorialSection>
      )}
      {data.observations.length > 0 && (
        <EditorialSection title={text.observations}>
          <ol className="pe-entries">
            {data.observations.map((item, i) => (
              <CuratedEntry key={item.id} index={i} title={item.text[lang]} />
            ))}
          </ol>
        </EditorialSection>
      )}
      {data.references.length > 0 && (
        <EditorialSection title={text.references}>
          <ol className="pe-entries">
            {data.references.map((item, i) => (
              <CuratedEntry
                key={item.id}
                index={i}
                title={item.title[lang]}
                meta={item.creator}
                note={item.note?.[lang]}
                noteLabel={text.note}
              >
                {item.url && (
                  <p className="pe-entry-meta">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {text.openReference}
                    </a>
                  </p>
                )}
              </CuratedEntry>
            ))}
          </ol>
        </EditorialSection>
      )}
    </>
  );
}
