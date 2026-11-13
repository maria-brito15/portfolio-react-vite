import { useState } from 'react';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { services } from '../../data/services';
import { projects } from '../../data/projects';
import { clientNeeds } from '../../data/clientJourney';
import { routeById } from '../../data/routes';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import SectionTitle from '../../components/ui/SectionTitle';
import type { BlockProps } from '../../components/dashboard/blockProps';

// Jornada de solução (cliente): escolher a necessidade e ver o serviço, o case ou projeto,
// as dúvidas comuns e o contato. Tudo vem de `services.tsx` e `projects.tsx` (ver
// `clientJourney.ts`); nada aqui define preço, prazo ou garantia.
const TEXT = {
  pt: {
    title: 'Como posso ajudar você?',
    lead: 'Escolha o que você precisa e veja o serviço, um exemplo de entrega e as dúvidas mais comuns.',
    step1: '1. O que você precisa?',
    step2: '2. Serviço relacionado',
    step3: '3. Exemplo de entrega',
    step4: '4. Dúvidas comuns',
    step5: '5. Próximo passo',
    noExample:
      'Ainda não há um exemplo publicado para esta necessidade. O contato é o melhor caminho.',
    seeCase: 'Ver o case',
    seeProject: 'Ver o projeto',
    quote: 'Pedir orçamento',
    allServices: 'Ver todos os serviços',
    other: 'Não achou a sua necessidade? Cada projeto é único: fale comigo.',
    reset: 'Escolher outra necessidade',
  },
  en: {
    title: 'How can I help you?',
    lead: 'Pick what you need and see the service, an example of delivered work and the most common questions.',
    step1: '1. What do you need?',
    step2: '2. Related service',
    step3: '3. Example of delivered work',
    step4: '4. Common questions',
    step5: '5. Next step',
    noExample:
      'There is no published example for this need yet. Getting in touch is the best path.',
    seeCase: 'See the case',
    seeProject: 'See the project',
    quote: 'Request a quote',
    allServices: 'See all services',
    other: 'Did not find your need? Every project is unique: talk to me.',
    reset: 'Pick another need',
  },
};

export default function SolutionJourney({ heading, lead }: BlockProps) {
  const { lang } = useLanguage();
  const text = TEXT[lang];
  const c = services[lang];
  const [needId, setNeedId] = useState<string | null>(null);
  const need = clientNeeds.find((n) => n.id === needId);
  const page = routeById('servicos')?.path ?? '/servicos';
  const projectsPage = routeById('projetos')?.path ?? '/projetos';
  const cases = need ? c.cases.items.filter((i) => need.cases.includes(i.id)) : [];
  const related = need ? projects.filter((p) => need.projects.includes(p.id)) : [];

  return (
    <section className="dash-section exp-block" aria-labelledby="journey-title" data-tone="coral">
      <SectionTitle as="h2" id="journey-title" size="md">
        {heading ?? text.title}
      </SectionTitle>
      <p className="t-dim">{lead ?? text.lead}</p>

      <h3 id="journey-needs">{text.step1}</h3>
      <div className="exp-tabs" role="group" aria-labelledby="journey-needs">
        {clientNeeds.map((n) => (
          <button
            key={n.id}
            type="button"
            className="exp-tab"
            aria-pressed={n.id === needId}
            aria-controls="journey-result"
            onClick={() => setNeedId(n.id === needId ? null : n.id)}
          >
            {n.label[lang]}
          </button>
        ))}
      </div>

      <div id="journey-result" aria-live="polite">
        {need && (
          <>
            <h3>{text.step2}</h3>
            <ul className="offer-grid">
              {need.services.map((i) => {
                const item = c.services.items[i];

                return (
                  <li key={item.title}>
                    <Card as="article" data-tone="coral">
                      <h4>
                        <span aria-hidden="true">{item.icon} </span>
                        {item.title}
                      </h4>
                      <p className="t-dim">{item.text}</p>
                      <p className="offer-meta">
                        {item.meta.map((m) => (
                          <Chip key={m} accent="coral">
                            {m}
                          </Chip>
                        ))}
                      </p>
                    </Card>
                  </li>
                );
              })}
            </ul>

            <h3>{text.step3}</h3>
            {cases.length + related.length > 0 ? (
              <ul className="link-list">
                {cases.map((item) => (
                  <li key={item.id}>
                    <Link to={`${page}#cases`}>{item.title}</Link>
                    <span className="t-dim"> {item.badge}</span>
                    <p className="t-dim">{item.paragraphs[0]}</p>
                  </li>
                ))}
                {related.map((p) => (
                  <li key={p.id}>
                    <Link to={projectsPage}>{p.name}</Link>
                    <span className="t-dim"> {p[lang].badge}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="t-dim">{text.noExample}</p>
            )}

            <h3>{text.step4}</h3>
            <div className="exp-list">
              {need.faq.map((i) => {
                const item = c.faq.items[i];

                return (
                  <details key={item.q} className="exp-item">
                    <summary>{item.q}</summary>
                    <p className="t-dim">{item.a}</p>
                  </details>
                );
              })}
            </div>
          </>
        )}
      </div>

      <h3>{text.step5}</h3>
      <p className="exp-cta">
        <Link to={`${page}#contato`} className="dash-btn dash-btn--primary">
          {text.quote}
        </Link>
        <Link to={`${page}#servicos`} className="dash-btn">
          {text.allServices}
        </Link>
      </p>
      <p className="t-dim">{text.other}</p>
    </section>
  );
}
