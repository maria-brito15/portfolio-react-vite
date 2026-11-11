import SectionTitle from '../../components/ui/SectionTitle';
import { experienceGroups } from '../../data/experiences';
import { useLanguage } from '../../i18n/LanguageContext';

import type { PortfolioContent } from '../../data/portfolio';
import type { Lang, Localized } from '../../types';

const pick = (value: string | Localized, lang: Lang) =>
  typeof value === 'string' ? value : value[lang];

export default function Experience({ content }: { content: PortfolioContent['experience'] }) {
  const { lang } = useLanguage();

  return (
    <section id="experiencias" className="sec" aria-labelledby="experiencias-title">
      <SectionTitle as="h1" id="experiencias-title" label={content.label}>
        {content.title}
      </SectionTitle>
      {experienceGroups.map((group) => (
        <div className="extra-group" id={`exp-${group.id}`} key={group.id}>
          <h2 className="extra-group-title">{group.title[lang]}</h2>
          <div className="extra-grid">
            {group.items.map((item) => (
              <div className="extra-card" key={item.id}>
                <span className={`extra-bdg${item.highlight ? ' highlight' : ''}`}>
                  {item.period[lang]}
                </span>
                <div>
                  <h3>{item.role[lang]}</h3>
                  <p className="extra-org">{pick(item.org, lang)}</p>
                  <p>{item.description[lang]}</p>
                </div>
                {item.tag && (
                  <div className="extra-meta">
                    <span className="extra-tag">{item.tag[lang]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
