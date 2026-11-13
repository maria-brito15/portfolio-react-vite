import { useState } from 'react';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { resume } from '../../data/resume';
import { experienceGroups } from '../../data/experiences';
import { projects } from '../../data/projects';
import { routeById } from '../../data/routes';
import { finalistProjects } from '../../utils/resume';
import { parsePeriodStart, sortByDateDesc } from '../../utils/projectDate';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import SectionTitle from '../../components/ui/SectionTitle';
import type { BlockProps } from '../../components/dashboard/blockProps';

// Visão profissional (rh): as competências do currículo por categoria, as experiências em
// ordem cronológica inversa e os reconhecimentos, numa só área com troca rápida. Lê os
// mesmos dados do currículo e de Experiências; a página completa continua a um clique.
type View = 'skills' | 'experience' | 'highlights';

const VIEWS: View[] = ['skills', 'experience', 'highlights'];

const TEXT = {
  pt: {
    title: 'Visão profissional',
    lead: 'Competências, experiências e reconhecimentos em um só lugar. Abra o que interessa.',
    nav: 'Seções da visão profissional',
    views: {
      skills: 'Competências',
      experience: 'Experiência',
      highlights: 'Destaques',
    },
    since: 'Tempo contado a partir do primeiro projeto ou curso com cada tecnologia.',
    projectsLabel: 'Projetos finalistas',
    awardsLabel: 'Reconhecimentos',
    seeProject: 'Ver projeto',
    resume: 'Ver o currículo completo',
    contact: 'Entrar em contato',
    allExperience: 'Todas as experiências →',
  },
  en: {
    title: 'Professional overview',
    lead: 'Skills, experience and recognition in one place. Open what matters to you.',
    nav: 'Professional overview sections',
    views: {
      skills: 'Skills',
      experience: 'Experience',
      highlights: 'Highlights',
    },
    since: 'Time counted from the first project or course with each technology.',
    projectsLabel: 'Finalist projects',
    awardsLabel: 'Recognition',
    seeProject: 'See project',
    resume: 'See the full resume',
    contact: 'Get in touch',
    allExperience: 'All experience →',
  },
};

const pick = (value: string | { pt: string; en: string }, lang: 'pt' | 'en') =>
  typeof value === 'string' ? value : value[lang];

export default function ProfessionalOverview({ heading, lead }: BlockProps) {
  const { lang } = useLanguage();
  const text = TEXT[lang];
  const r = resume[lang];
  const [view, setView] = useState<View>('skills');

  // Experiências (sem os reconhecimentos), da mais recente para a mais antiga.
  const experience = sortByDateDesc(
    experienceGroups
      .filter((g) => g.id !== 'awards')
      .flatMap((g) => g.items)
      .map((item) => ({ item, date: parsePeriodStart(item.period.pt) ?? { year: 0 } })),
  );
  const awards = experienceGroups.find((g) => g.id === 'awards')?.items ?? [];
  const finalists = finalistProjects(projects);

  return (
    <section className="dash-section exp-block" aria-labelledby="overview-title" data-tone="amber">
      <SectionTitle as="h2" id="overview-title" size="md">
        {heading ?? text.title}
      </SectionTitle>
      <p className="t-dim">{lead ?? text.lead}</p>

      <nav className="exp-tabs" aria-label={text.nav}>
        {VIEWS.map((id) => (
          <button
            key={id}
            type="button"
            className="exp-tab"
            aria-pressed={view === id}
            aria-controls="overview-panel"
            onClick={() => setView(id)}
          >
            {text.views[id]}
          </button>
        ))}
      </nav>

      <div id="overview-panel" className="exp-panel">
        {view === 'skills' && (
          <>
            <p className="t-dim">{text.since}</p>
            <div className="exp-list">
              {r.skills.map(([group, items]) => (
                <details key={group} className="exp-item">
                  <summary>{group}</summary>
                  <p className="t-dim">{items}</p>
                </details>
              ))}
            </div>
          </>
        )}

        {view === 'experience' && (
          <>
            <ol className="exp-list exp-timeline">
              {experience.map(({ item }) => (
                <li key={item.id}>
                  <details className="exp-item">
                    <summary>
                      <strong>{item.period[lang]}</strong> · {item.role[lang]}{' '}
                      <span className="t-dim">· {pick(item.org, lang)}</span>
                    </summary>
                    <p className="t-dim">{item.description[lang]}</p>
                    {item.tag && <Chip accent="amber">{item.tag[lang]}</Chip>}
                  </details>
                </li>
              ))}
            </ol>
            <Link to={routeById('experiencias')?.path ?? '/experiencias'}>
              {text.allExperience}
            </Link>
          </>
        )}

        {view === 'highlights' && (
          <div className="dash-split">
            <div>
              <h3>{text.projectsLabel}</h3>
              <ul className="link-list">
                {finalists.map((p) => (
                  <li key={p.id}>
                    <Link to={routeById('projetos')?.path ?? '/projetos'}>{p.name}</Link>
                    <span className="t-dim"> {p[lang].badge}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>{text.awardsLabel}</h3>
              <ul className="link-list">
                {awards.map((a) => (
                  <li key={a.id}>
                    {a.role[lang]}
                    <span className="t-dim"> · {a.period[lang]}</span>
                    <p className="t-dim">{a.description[lang]}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <Card as="div" className="exp-cta">
        <Link
          to={routeById('curriculo')?.path ?? '/curriculo'}
          className="dash-btn dash-btn--primary"
        >
          {text.resume}
        </Link>
        <Link to={routeById('contato')?.path ?? '/contato'} className="dash-btn">
          {text.contact}
        </Link>
      </Card>
    </section>
  );
}
