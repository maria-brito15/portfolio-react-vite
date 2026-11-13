import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { academics } from '../../data/academics';
import { routeById } from '../../data/routes';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import type { BlockProps } from './blockProps';

// Trajetória acadêmica em miniatura (professor): formação, marcos e quantas disciplinas já
// estão listadas. Tudo vem de `academics.ts`; notas e detalhes ficam na página Acadêmico.
export default function AcademicSnapshot({ heading }: BlockProps) {
  const { lang, t } = useLanguage();
  const h = t.ws.home;
  const courses = academics.semesters.reduce((n, s) => n + s.courses.length, 0);

  return (
    <section className="dash-section" aria-labelledby="academic-title">
      <div className="dash-head">
        <SectionTitle as="h2" id="academic-title" size="md">
          {heading ?? h.academic}
        </SectionTitle>
        <Link to={routeById('academico')?.path ?? '/academico'}>{h.academicMore}</Link>
      </div>
      <ul className="fact-grid">
        {academics.programs.map((p) => (
          <li key={p.id}>
            <Card as="article" data-tone="mint">
              <h3>{p.degree[lang]}</h3>
              <p className="t-dim">
                {p.institution} · {p.start}–{p.end}
                {p.expected ? ` (${h.expected})` : ''}
              </p>
            </Card>
          </li>
        ))}
        {courses > 0 && (
          <li>
            <Card as="article" data-tone="amber">
              <h3>{h.courseCount(courses)}</h3>
            </Card>
          </li>
        )}
      </ul>
    </section>
  );
}
