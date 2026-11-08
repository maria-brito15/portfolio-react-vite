// Visões em terminal das páginas dedicadas (currículo, acadêmico, serviços):
// resumos úteis, lidos dos mesmos dados das páginas próprias.
import { resume } from '../data/resume';
import { academics } from '../data/academics';
import { experienceGroups } from '../data/experiences';
import { projects } from '../data/projects';
import { services } from '../data/services';
import { profile } from '../data/profile';
import { ui } from '../i18n/ui';
import { activitiesByYear, semestersDesc } from '../utils/academics';
import { experienceStats } from '../utils/resume';
import { formatProjectDate } from '../utils/projectDate';
import { Ext } from './outputs';

export function ResumeView({ lang }) {
  const c = resume[lang];
  const t = ui[lang].term;
  const exp = experienceStats(experienceGroups);
  const sections = [
    [c.sections.summary, ''],
    [c.sections.skills, ''],
    [c.sections.experience, c.experienceSummary(exp.count, exp.firstYear)],
    [c.sections.projects, `${c.projects.length}`],
    [c.sections.education, academics.programs.at(-1).degree[lang]],
    [c.sections.awards, ''],
  ];
  return (
    <div>
      <p>
        <span className="t-accent">{c.name}</span>
      </p>
      <p className="t-dim">{c.headline}</p>
      <p className="t-dim"># {t.sections}</p>
      <ol className="t-numbered">
        {sections.map(([title, hint], i) => (
          <li key={title}>
            <span className="t-dim">{String(i + 1).padStart(2, '0')}</span>
            <span>{title}</span>
            <span className="t-dim t-wrap">{hint}</span>
          </li>
        ))}
      </ol>
      <p className="t-dim"># {t.contacts}</p>
      <p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <span className="t-dim"> · </span>
        <Ext href={profile.linkedin}>LinkedIn</Ext>
        <span className="t-dim"> · </span>
        <Ext href={profile.github}>GitHub</Ext>
      </p>
    </div>
  );
}

export function AcademicsView({ lang }) {
  const t = ui[lang].term;
  const years = activitiesByYear(academics, { projects, experienceGroups }, lang);
  const programName = (id) => academics.programs.find((p) => p.id === id)?.degree[lang] ?? '';
  return (
    <div>
      <ul className="t-table">
        {[...academics.programs].reverse().map((p) => (
          <li key={p.id}>
            <span className="t-dim">
              {p.start}–{p.end}
              {p.expected ? '*' : ''}
            </span>
            <span className="t-accent">{p.institution}</span>
            <span className="t-wrap">{p.degree[lang]}</span>
          </li>
        ))}
      </ul>

      <p className="t-dim"># {t.timeline}</p>
      <p>
        {academics.timeline.map((m, i) => (
          <span key={m.year}>
            {i > 0 && <span className="t-dim"> → </span>}
            <span className="t-accent">{m.year}</span> {m.label[lang]}
          </span>
        ))}
      </p>

      <p className="t-dim"># {t.activities}</p>
      {years.map((y) => (
        <div key={y.year} className="t-group">
          <p className="t-accent">{y.year}</p>
          <ul className="t-table t-table-act">
            {y.rows.map((row) => (
              <li key={row.key}>
                <span className="t-dim">{formatProjectDate(row.date)}</span>
                <span className="t-wrap">
                  {row.title}
                  {row.detail && <span className="t-dim"> · {row.detail}</span>}
                </span>
                <span className="t-dim">{t.kinds[row.kind]}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <p className="t-dim"># {t.semesters}</p>
      <ul className="t-table t-table-act">
        {semestersDesc(academics.semesters).map((s) => (
          <li key={s.id}>
            <span className="t-dim">{s.label[lang]}</span>
            <span className="t-wrap">{programName(s.program)}</span>
            <span className="t-dim">
              {s.inProgress ? t.inProgress : s.courses.length ? s.courses.length : t.noCourses}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ServicesView({ lang }) {
  const c = services[lang].services;
  const t = ui[lang].term;
  return (
    <div>
      <p className="t-dim"># {t.services}</p>
      <ul className="t-table t-table-svc">
        {c.items.map((item) => (
          <li key={item.title}>
            <span className="t-accent">{item.title}</span>
            <span className="t-dim t-wrap">{item.meta.join(' · ')}</span>
          </li>
        ))}
      </ul>
      <p className="t-dim">{t.servicesMore}</p>
      <p className="t-dim">
        <a href={`mailto:${profile.servicesEmail}`}>{profile.servicesEmail}</a>
      </p>
    </div>
  );
}
