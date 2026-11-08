import SectionTitle from '../../components/ui/SectionTitle';
import { experienceGroups } from '../../data/experiences';
import { useLanguage } from '../../i18n/LanguageContext';

const pick = (value, lang) => (typeof value === 'string' ? value : value[lang]);

export default function Experience({ content }) {
  const { lang } = useLanguage();
  return (
    <section id="experiencias" className="sec" aria-labelledby="experiencias-title">
      <SectionTitle id="experiencias-title" label={content.label}>
        {content.title}
      </SectionTitle>
      {experienceGroups.map((group) => (
        <div className="extra-group" key={group.id}>
          <h3 className="extra-group-title">{group.title[lang]}</h3>
          <div className="extra-grid">
            {group.items.map((item) => (
              <div className="extra-card" key={item.id}>
                <span className={`extra-bdg${item.highlight ? ' highlight' : ''}`}>
                  {item.period[lang]}
                </span>
                <div>
                  <h4>{item.role[lang]}</h4>
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
