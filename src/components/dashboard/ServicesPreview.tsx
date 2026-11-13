import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { services } from '../../data/services';
import { routeById } from '../../data/routes';
import Card from '../ui/Card';
import Chip from '../ui/Chip';
import SectionTitle from '../ui/SectionTitle';
import type { BlockProps } from './blockProps';

// Serviços, cases e dúvidas frequentes (cliente), lidos de `services.tsx`, os mesmos
// textos e valores da página Serviços. Aqui só um recorte, com links para cada âncora.
const FAQ_SHOWN = 3;

export default function ServicesPreview({ heading }: BlockProps) {
  const { lang, t } = useLanguage();
  const h = t.ws.home;
  const c = services[lang];
  const page = routeById('servicos')?.path ?? '/servicos';

  return (
    <section className="dash-section" aria-labelledby="offer-title">
      <div className="dash-head">
        <SectionTitle as="h2" id="offer-title" size="md">
          {heading ?? h.offer}
        </SectionTitle>
        <Link to={`${page}#servicos`}>{h.offerMore}</Link>
      </div>
      <ul className="offer-grid">
        {c.services.items.map((item) => (
          <li key={item.title}>
            <Card as="article" data-tone="coral">
              <h3>
                <span aria-hidden="true">{item.icon} </span>
                {item.title}
              </h3>
              <p className="t-dim">{item.text}</p>
              <p className="offer-meta">
                {item.meta.slice(0, 2).map((m) => (
                  <Chip key={m} accent="coral">
                    {m}
                  </Chip>
                ))}
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <div className="dash-split offer-more">
        <div>
          <h3>{h.cases}</h3>
          <ul className="link-list">
            {c.cases.items.map((item) => (
              <li key={item.id}>
                <Link to={`${page}#cases`}>{item.title}</Link>
                <span className="t-dim"> {item.badge}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>{h.faq}</h3>
          <ul className="link-list">
            {c.faq.items.slice(0, FAQ_SHOWN).map((item) => (
              <li key={item.q}>
                <Link to={`${page}#faq`}>{item.q}</Link>
              </li>
            ))}
          </ul>
          <Link to={`${page}#faq`}>{h.faqMore}</Link>
        </div>
      </div>
    </section>
  );
}
