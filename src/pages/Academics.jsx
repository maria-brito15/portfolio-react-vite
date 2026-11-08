import DocPage, { DocSection } from '../components/DocPage';
import { Link } from '../router';
import { academics } from '../data/academics';
import { projects } from '../data/projects';
import { experienceGroups } from '../data/experiences';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  activitiesByYear,
  semestersDesc,
  summarizeSemester,
  yearProgress,
} from '../utils/academics';

const pick = (value, lang) => (typeof value === 'string' ? value : value[lang]);

const TEXT = {
  pt: {
    meta: {
      title: 'Acadêmico — Duda Brito | Engenharia de Software',
      description:
        'Trajetória acadêmica de Maria Eduarda Brito na PUC Minas: formação, projetos finalistas, monitoria, extensão e competições.',
    },
    command: 'cd ~/academico && ls -la',
    title: 'Trajetória acadêmica',
    intro:
      'Formação na PUC Minas, de Ciência da Computação a Engenharia de Software, com os projetos, monitorias e atividades de cada ano.',
    sections: {
      path: 'Linha do tempo',
      programs: 'Formação',
      years: 'Atividades por ano',
      courses: 'Disciplinas e notas',
    },
    today: 'hoje',
    progress: (pct, end) => `${pct}% do caminho até a previsão de conclusão (${end})`,
    progressNote: 'Estimativa pelo calendário, não pela carga horária cumprida.',
    expected: 'previsão',
    stats: {
      finalist: 'vezes finalista',
      academic: 'atividades acadêmicas',
      learning: 'cursos e competições',
    },
    kinds: {
      project: 'Projeto',
      academic: 'Acadêmico',
      learning: 'Curso / competição',
      awards: 'Reconhecimento',
    },
    cols: { period: 'Período', activity: 'Atividade', type: 'Tipo' },
    courseCols: { name: 'Disciplina', hours: 'C.H.', modality: 'Modalidade', grade: 'Nota' },
    modality: { presencial: 'Presencial', hibrida: 'Híbrida', virtual: 'Virtual' },
    inProgress: 'em andamento',
    emptySemester: 'Disciplinas e notas a preencher.',
    totals: (done, total, avg) => `Carga horária: ${done}/${total}h · Média: ${avg ?? '—'}`,
    devHint:
      'Só no modo de desenvolvimento: preencha `semesters` em src/data/academics.js com o histórico oficial para exibir as tabelas de disciplinas e notas.',
    resume: 'Ver o currículo →',
  },
  en: {
    meta: {
      title: 'Academics — Duda Brito | Software Engineering',
      description:
        "Maria Eduarda Brito's academic record at PUC Minas: degrees, finalist projects, teaching assistantship, outreach and competitions.",
    },
    command: 'cd ~/academics && ls -la',
    title: 'Academic record',
    intro:
      'Studies at PUC Minas, from Computer Science to Software Engineering, with the projects, TA work and activities of each year.',
    sections: {
      path: 'Timeline',
      programs: 'Degrees',
      years: 'Activities by year',
      courses: 'Courses and grades',
    },
    today: 'today',
    progress: (pct, end) => `${pct}% of the way to expected graduation (${end})`,
    progressNote: 'Estimated from the calendar, not from completed credit hours.',
    expected: 'expected',
    stats: {
      finalist: 'times finalist',
      academic: 'academic activities',
      learning: 'courses and competitions',
    },
    kinds: {
      project: 'Project',
      academic: 'Academic',
      learning: 'Course / competition',
      awards: 'Recognition',
    },
    cols: { period: 'Period', activity: 'Activity', type: 'Type' },
    courseCols: { name: 'Course', hours: 'Hours', modality: 'Modality', grade: 'Grade' },
    modality: { presencial: 'In person', hibrida: 'Hybrid', virtual: 'Online' },
    inProgress: 'in progress',
    emptySemester: 'Courses and grades to be added.',
    totals: (done, total, avg) => `Hours: ${done}/${total} · Average: ${avg ?? '—'}`,
    devHint:
      'Development mode only: fill `semesters` in src/data/academics.js with the official transcript to show the course and grade tables.',
    resume: 'See the resume →',
  },
};

function programName(id, lang) {
  return academics.programs.find((p) => p.id === id)?.degree[lang] ?? '';
}

export default function Academics() {
  const { lang } = useLanguage();
  const c = TEXT[lang];
  useDocumentMeta(c.meta);

  const first = academics.timeline[0].year;
  const last = academics.timeline[academics.timeline.length - 1].year;
  const pct = yearProgress(first, last);
  const span = last + 1 - first;
  const pos = (year) => `${((year - first) / span) * 100}%`;

  const finalists = projects.filter((p) => /^Finalista/.test(p.pt.badge ?? '')).length;
  const count = (id) => experienceGroups.find((g) => g.id === id)?.items.length ?? 0;
  const stats = [
    [`${finalists}×`, c.stats.finalist],
    [count('academic'), c.stats.academic],
    [count('learning'), c.stats.learning],
  ];

  const sections = [
    { id: 'trajetoria', title: c.sections.path },
    { id: 'formacao-academica', title: c.sections.programs },
    { id: 'por-ano', title: c.sections.years },
  ];
  const showCourses = academics.semesters.length > 0;
  if (showCourses) sections.push({ id: 'disciplinas', title: c.sections.courses });

  return (
    <DocPage command={c.command} sections={sections}>
      <header className="doc-head">
        <h1>{c.title}</h1>
        <p className="doc-muted">{c.intro}</p>
        <ul className="ac-stats">
          {stats.map(([value, label]) => (
            <li key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </header>

      <DocSection id="trajetoria" index={1} title={c.sections.path}>
        <div
          className="ac-track"
          role="img"
          aria-label={`${academics.timeline.map((m) => `${m.year}: ${m.label[lang]}`).join('; ')}. ${c.progress(pct, last)}`}
        >
          <div className="ac-bar">
            <div className="ac-fill" style={{ width: `${pct}%` }}></div>
            <div className="ac-today" style={{ left: `${pct}%` }}>
              <span>{c.today}</span>
            </div>
          </div>
          <ol className="ac-marks" aria-hidden="true">
            {academics.timeline.map((m) => (
              <li key={m.year} style={{ left: pos(m.year) }}>
                <strong>{m.year}</strong>
                <span>{m.label[lang]}</span>
              </li>
            ))}
          </ol>
        </div>
        <p>{c.progress(pct, last)}</p>
        <p className="doc-muted">{c.progressNote}</p>
      </DocSection>

      <DocSection id="formacao-academica" index={2} title={c.sections.programs}>
        <div className="ac-programs">
          {[...academics.programs].reverse().map((p) => (
            <article key={p.id} className="ac-program">
              <span className="doc-date">
                {p.start}–{p.end}
                {p.expected ? ` (${c.expected})` : ''}
              </span>
              <h3>{p.degree[lang]}</h3>
              <p className="doc-muted">{p.institution}</p>
            </article>
          ))}
        </div>
      </DocSection>

      <DocSection id="por-ano" index={3} title={c.sections.years}>
        {activitiesByYear(academics, { projects, experienceGroups }, lang).map((y) => (
          <div className="ac-year" key={y.year}>
            <h3 className="doc-group-title">{y.year}</h3>
            <div className="ac-table-wrap">
              <table className="ac-table">
                <thead>
                  <tr>
                    <th scope="col">{c.cols.activity}</th>
                    <th scope="col">{c.cols.type}</th>
                    <th scope="col">{c.cols.period}</th>
                  </tr>
                </thead>
                <tbody>
                  {y.rows.map((row) => (
                    <tr key={row.key}>
                      <td>
                        {row.to ? (
                          <Link to={row.to}>{row.title}</Link>
                        ) : (
                          <strong>{row.title}</strong>
                        )}
                        {row.detail && <span className="doc-muted"> · {row.detail}</span>}
                      </td>
                      <td>
                        <span className="ac-chip">{c.kinds[row.kind]}</span>
                      </td>
                      <td className="doc-date">{row.period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {!showCourses && import.meta.env.DEV && <p className="ac-dev-hint">{c.devHint}</p>}
        <p>
          <Link to="/curriculo">{c.resume}</Link>
        </p>
      </DocSection>

      {showCourses && (
        <DocSection id="disciplinas" index={4} title={c.sections.courses}>
          {semestersDesc(academics.semesters).map((s) => {
            const totals = summarizeSemester(s.courses);
            return (
              <div className="ac-year" key={s.id}>
                <h3 className="doc-group-title">
                  {s.label[lang]}
                  <span className="ac-program-name">{programName(s.program, lang)}</span>
                  {s.inProgress && <span className="ac-chip ac-live">{c.inProgress}</span>}
                </h3>
                <div className="ac-table-wrap">
                  <table className="ac-table ac-courses">
                    <thead>
                      <tr>
                        <th scope="col">{c.courseCols.name}</th>
                        <th scope="col">{c.courseCols.hours}</th>
                        <th scope="col">{c.courseCols.modality}</th>
                        <th scope="col">{c.courseCols.grade}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.courses.length === 0 && (
                        <tr className="ac-empty">
                          <td colSpan={4}>{c.emptySemester}</td>
                        </tr>
                      )}
                      {s.courses.map((course) => (
                        <tr key={pick(course.name, 'pt')}>
                          <td>{pick(course.name, lang)}</td>
                          <td>{course.hours}</td>
                          <td>{c.modality[course.modality] ?? course.modality}</td>
                          <td className="ac-grade">{course.grade ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    {s.courses.length > 0 && (
                      <tfoot>
                        <tr>
                          <td colSpan={4}>{c.totals(totals.done, totals.total, totals.average)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            );
          })}
        </DocSection>
      )}
    </DocPage>
  );
}
