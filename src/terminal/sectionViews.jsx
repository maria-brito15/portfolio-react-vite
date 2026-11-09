// Conteúdo COMPLETO de cada seção das páginas, em formato de terminal.
// Tudo é lido de src/data/* (os mesmos dados das páginas próprias): nenhum
// texto é duplicado aqui e PT/EN vêm dos dados.
import { resume } from '../data/resume';
import { academics } from '../data/academics';
import { experienceGroups } from '../data/experiences';
import { projects } from '../data/projects';
import { services } from '../data/services';
import { profile } from '../data/profile';
import { skillTimeline, formatSince } from '../data/skillTimeline';
import { ui } from '../i18n/ui';
import {
  activitiesByYear,
  semestersDesc,
  summarizeSemester,
  yearProgress,
} from '../utils/academics';
import { finalistProjects } from '../utils/resume';
import { formatProjectDate } from '../utils/projectDate';
import { Ext, TermLink } from './outputs';

const pick = (value, lang) =>
  value && typeof value === 'object' && 'pt' in value ? value[lang] : value;
const Title = ({ children }) => <p className="t-dim"># {children}</p>;

// ---------------------------------------------------------------- Currículo
function ResumeSection({ id, lang }) {
  const c = resume[lang];
  const t = ui[lang].term;

  switch (id) {
    case 'resumo':
      return (
        <div>
          <Title>{c.sections.summary}</Title>
          {c.summary.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      );
    case 'competencias':
      return (
        <div>
          <Title>{c.sections.skills}</Title>
          <p className="t-dim">{c.skillsSummary}</p>
          {skillTimeline.map((group) => (
            <div key={group.id} className="t-group">
              <p className="t-accent">{group.title[lang]}</p>
              <ul className="t-table t-table-svc">
                {group.items.map((skill) => (
                  <li key={skill.name}>
                    <span>{skill.name}</span>
                    <span className="t-dim">
                      {skill.since
                        ? `${formatSince(skill.since, lang)} · ${c.since(skill.since, pick(skill.source, lang))}`
                        : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Title>
            {lang === 'pt' ? 'lista completa do currículo' : 'full list from the resume'}
          </Title>
          <dl className="t-kv">
            {c.skills.map(([area, list]) => (
              <div key={area}>
                <dt>{area}</dt>
                <dd>{list}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case 'experiencias':
      return (
        <div>
          <Title>{c.sections.experience}</Title>
          {experienceGroups
            .filter((g) => g.id !== 'awards')
            .map((g) => (
              <ExperienceGroup key={g.id} group={g} lang={lang} />
            ))}
        </div>
      );
    case 'projetos':
      return (
        <div>
          <Title>{c.sections.projects}</Title>
          {c.projects.map((p) => (
            <div key={p.name} className="t-group">
              <p>
                <span className="t-accent">{p.name}</span>
                <span className="t-dim"> — {p.subtitle}</span>
              </p>
              {p.award && <p className="t-ok">🏆 {p.award}</p>}
              <ul className="t-bullets">
                {p.points.map((point) => (
                  <li key={point.slice(0, 24)}>{point}</li>
                ))}
              </ul>
              {p.link &&
                (p.link.to ? (
                  <TermLink to={p.link.to}>{p.link.label}</TermLink>
                ) : (
                  <Ext href={p.link.href}>{p.link.label}</Ext>
                ))}
            </div>
          ))}
        </div>
      );
    case 'formacao':
      return (
        <div>
          <Title>{c.sections.education}</Title>
          <ul className="t-table">
            {[...academics.programs].reverse().map((p) => (
              <li key={p.id}>
                <span className="t-dim">
                  {p.start}–{p.end}
                  {p.expected ? `* ${t.expected}` : ''}
                </span>
                <span className="t-accent">{p.institution}</span>
                <span className="t-wrap">{p.degree[lang]}</span>
              </li>
            ))}
          </ul>
          <p>
            <span className="t-dim">{c.languagesLabel}: </span>
            {c.languages}
          </p>
        </div>
      );
    case 'reconhecimentos': {
      const finalists = finalistProjects(projects);
      const awards = experienceGroups.find((g) => g.id === 'awards')?.items ?? [];

      return (
        <div>
          <Title>{c.sections.awards}</Title>
          {awards.map((item) => {
            const instances = item.id === 'finalista' ? finalists : [];
            const times = Math.max(1, instances.length);

            return (
              <div key={item.id} className="t-group">
                <p>
                  <span className="t-ok">{times}×</span>{' '}
                  <span className="t-accent">{item.role[lang]}</span>
                  <span className="t-dim">
                    {' '}
                    · {pick(item.org, lang)} · {c.received(times)}
                  </span>
                </p>
                <ul className="t-bullets">
                  {instances.map((p) => (
                    <li key={p.id}>
                      {p.name} <span className="t-dim">{formatProjectDate(p.date)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      );
    }
    default:
      return null;
  }
}

// ----------------------------------------------------------------- Acadêmico
function AcademicsSection({ id, lang }) {
  const t = ui[lang].term;
  const programName = (pid) => academics.programs.find((p) => p.id === pid)?.degree[lang] ?? '';

  switch (id) {
    case 'linha-do-tempo': {
      const first = academics.timeline[0].year;
      const last = academics.timeline.at(-1).year;
      const pct = yearProgress(first, last);
      const filled = Math.round(pct / 5);

      return (
        <div>
          <Title>{t.timeline}</Title>
          <ul className="t-table t-table-act">
            {academics.timeline.map((m) => (
              <li key={m.year}>
                <span className="t-accent">{m.year}</span>
                <span className="t-wrap">{m.label[lang]}</span>
                <span />
              </li>
            ))}
          </ul>
          <p>
            <span aria-hidden="true">
              [{'■'.repeat(filled)}
              {'□'.repeat(20 - filled)}] {pct}%
            </span>{' '}
            <span className="t-dim">{t.progress(pct, last)}</span>
          </p>
          <p className="t-dim">{t.progressNote}</p>
        </div>
      );
    }
    case 'formacao':
      return (
        <div>
          <Title>{t.degrees}</Title>
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
          <p className="t-dim">* {t.expected}</p>
        </div>
      );
    case 'atividades':
      return (
        <div>
          <Title>{t.activities}</Title>
          {activitiesByYear(academics, { projects, experienceGroups }, lang).map((y) => (
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
        </div>
      );
    case 'disciplinas':
      return (
        <div>
          <Title>{t.semesters}</Title>
          {semestersDesc(academics.semesters).map((s) => {
            const totals = summarizeSemester(s.courses);

            return (
              <div key={s.id} className="t-group">
                <p>
                  <span className="t-accent">{s.label[lang]}</span>
                  <span className="t-dim"> · {programName(s.program)}</span>
                  {s.inProgress && <span className="t-ok"> · {t.inProgress}</span>}
                </p>
                {s.courses.length === 0 ? (
                  <p className="t-dim">{t.noCourses}</p>
                ) : (
                  <>
                    <ul className="t-table t-table-grades">
                      {s.courses.map((course) => (
                        <li key={pick(course.name, 'pt')}>
                          <span className="t-wrap">{pick(course.name, lang)}</span>
                          <span className="t-dim">{course.hours}h</span>
                          <span className="t-dim">
                            {t.modality[course.modality] ?? course.modality}
                          </span>
                          <span>{course.grade ?? '—'}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="t-dim">
                      {t.hours}: {totals.done}/{totals.total} · {t.average}: {totals.average ?? '—'}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------------------ Serviços
function ServicesSection({ id, lang }) {
  const c = services[lang];
  const t = ui[lang].term;

  switch (id) {
    case 'servicos':
      return (
        <div>
          <Title>{t.services}</Title>
          {c.services.items.map((item) => (
            <div key={item.title} className="t-group">
              <p>
                <span className="t-accent">{item.title}</span>
              </p>
              <p>{item.text}</p>
              <p className="t-dim">{item.meta.join(' · ')}</p>
            </div>
          ))}
          <p className="t-dim">
            {c.services.custom.title} {c.services.custom.text}
          </p>
        </div>
      );
    case 'cases':
      return (
        <div>
          <Title>{c.cases.label}</Title>
          {c.cases.items.map((item) => (
            <div key={item.id} className="t-group">
              <p>
                <span className="t-accent">{item.title}</span>
                <span className="t-dim"> · {item.badge}</span>
              </p>
              {item.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
              <p className="t-dim">{item.deliverables.join(' · ')}</p>
            </div>
          ))}
        </div>
      );
    case 'faq':
      return (
        <div>
          <Title>{c.faq.title}</Title>
          {c.faq.items.map((item) => (
            <div key={item.q} className="t-group">
              <p className="t-accent">? {item.q}</p>
              <p>{item.a}</p>
            </div>
          ))}
        </div>
      );
    case 'contato':
      return (
        <div>
          <Title>{c.contact.label}</Title>
          <p>{c.contact.text}</p>
          <p>
            <a href={`mailto:${profile.servicesEmail}`}>{profile.servicesEmail}</a>
          </p>
        </div>
      );
    default:
      return null;
  }
}

// ------------------------------------------------------ Experiências e projetos
function ExperienceGroup({ group, lang }) {
  return (
    <div className="t-group">
      <p className="t-accent">{group.title[lang]}</p>
      {group.items.map((item) => (
        <div key={item.id} className="t-group">
          <p>
            <span>{item.role[lang]}</span>
            <span className="t-dim">
              {' '}
              · {pick(item.org, lang)} · {item.period[lang]}
            </span>
            {item.tag && <span className="t-warn"> [{item.tag[lang]}]</span>}
          </p>
          <p className="t-dim">{item.description[lang]}</p>
        </div>
      ))}
    </div>
  );
}

function ExperiencesSection({ id, lang }) {
  const group = experienceGroups.find((g) => g.id === id);

  return group ? <ExperienceGroup group={group} lang={lang} /> : null;
}

function ProjectSection({ id, lang }) {
  const p = projects.find((x) => x.id === id);

  if (!p) return null;

  const copy = p[lang];

  return (
    <div>
      <p>
        <span className="t-dim">{formatProjectDate(p.date)} </span>
        <span className="t-accent">{p.name}</span>
        {copy.badge && <span className="t-ok"> · {copy.badge}</span>}
      </p>
      <p>{copy.description}</p>
      {copy.versions?.map((v) => (
        <div key={v.label} className="t-group">
          <p>
            <span className="t-warn">{v.label}</span>
            <span className="t-dim">
              {' '}
              · {formatProjectDate(v.date)} · {v.stack}
            </span>
          </p>
          <p>{v.description}</p>
          <ul className="t-bullets">
            {v.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="t-dim">{p.tech.join(' · ')}</p>
      <p>
        {p.repo && <Ext href={p.repo}>github</Ext>}
        {p.repo && p.caseStudy && <span className="t-dim"> · </span>}
        {p.caseStudy && (
          <TermLink to={p.caseStudy}>{lang === 'pt' ? 'estudo de caso' : 'case study'}</TermLink>
        )}
      </p>
    </div>
  );
}

const BY_ROUTE = {
  curriculo: ResumeSection,
  academico: AcademicsSection,
  servicos: ServicesSection,
  experiencias: ExperiencesSection,
  projetos: ProjectSection,
};

// `section` é um item de sectionsOf(routeId) (src/data/sections.js).
export default function SectionView({ routeId, section, lang }) {
  const View = BY_ROUTE[routeId];

  return View ? <View id={section.id} lang={lang} /> : null;
}
