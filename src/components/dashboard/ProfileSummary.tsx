import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { resume } from '../../data/resume';
import { academics } from '../../data/academics';
import { experienceGroups } from '../../data/experiences';
import { projects } from '../../data/projects';
import { routeById } from '../../data/routes';
import { experienceStats, finalistProjects } from '../../utils/resume';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import type { BlockProps } from './blockProps';

// Resumo para quem avalia o perfil (RH): o texto do currículo, formação, experiências e
// reconhecimentos, tudo lido dos mesmos dados do currículo. Não é um segundo currículo:
// encaminha para a página completa.
export default function ProfileSummary({ heading }: BlockProps) {
  const { lang, t } = useLanguage();
  const h = t.ws.home;
  const r = resume[lang];
  const exp = experienceStats(experienceGroups);
  const awards = finalistProjects(projects).length;

  return (
    <section className="dash-section" aria-labelledby="profile-title">
      <div className="dash-head">
        <SectionTitle as="h2" id="profile-title" size="md">
          {heading ?? h.profile}
        </SectionTitle>
        <Link to={routeById('curriculo')?.path ?? '/curriculo'}>{h.fullResume}</Link>
      </div>
      <p className="profile-summary">{r.summary[0]}</p>
      <ul className="fact-grid">
        <li>
          <Card as="article" data-tone="amber">
            <h3>{r.sections.education}</h3>
            {academics.programs.map((p) => (
              <p key={p.id}>
                {p.degree[lang]}
                <span className="t-dim">
                  {' '}
                  · {p.institution} · {p.start}–{p.end}
                  {p.expected ? ` (${h.expected})` : ''}
                </span>
              </p>
            ))}
          </Card>
        </li>
        <li>
          <Card as="article" data-tone="violet">
            <h3>{r.sections.experience}</h3>
            <p>{r.experienceSummary(exp.count, exp.firstYear)}</p>
            <Link to={routeById('experiencias')?.path ?? '/experiencias'}>
              {routeById('experiencias')?.label[lang]} →
            </Link>
          </Card>
        </li>
        {awards > 0 && (
          <li>
            <Card as="article" data-tone="mint">
              <h3>{r.sections.awards}</h3>
              <p>{r.awardsSummary(awards)}</p>
            </Card>
          </li>
        )}
      </ul>
    </section>
  );
}
