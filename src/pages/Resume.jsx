import { useState } from 'react';
import DocPage, { DocSection } from '../components/DocPage';
import { Link } from '../router';
import { resume } from '../data/resume';
import { academics } from '../data/academics';
import { experienceGroups } from '../data/experiences';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { skillTimeline, formatSince } from '../data/skillTimeline';
import { formatProjectDate } from '../utils/projectDate';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const pick = (value, lang) => (typeof value === 'string' ? value : value[lang]);
const yearOf = (period) => Math.min(...(period.match(/\d{4}/g) ?? []).map(Number));

// Descrições longas começam recolhidas, como no azal.im; na impressão abrem.
function ExperienceCard({ index, item, kind, c, lang }) {
  const [open, setOpen] = useState(false);
  const description = item.description[lang];
  const long = description.length > 160;
  const id = `exp-${item.id}`;
  return (
    <li className="xp-card">
      <div className="xp-head">
        <span className="xp-num" aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        <div>
          <h3>{item.role[lang]}</h3>
          <p className="xp-org">
            {pick(item.org, lang)} <span className="doc-muted">· {kind}</span>
          </p>
        </div>
        <span className="doc-date">{item.period[lang]}</span>
      </div>
      <p id={id} className={`xp-desc${long && !open ? ' clamped' : ''}`}>
        {description}
      </p>
      {long && (
        <button
          type="button"
          className="xp-more no-print"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? c.showLess : c.showMore}
        </button>
      )}
      {item.tag && (
        <ul className="xp-tags">
          <li>{item.tag[lang]}</li>
        </ul>
      )}
    </li>
  );
}

export default function Resume() {
  const { lang } = useLanguage();
  const c = resume[lang];
  useDocumentMeta(c.meta);

  const groups = experienceGroups.filter((g) => g.id !== 'awards');
  const experiences = groups.flatMap((g) => g.items.map((item) => ({ item, kind: g.title[lang] })));
  const firstYear = Math.min(...experiences.map(({ item }) => yearOf(item.period.pt)));

  // Reconhecimentos: o card "Finalista" das experiências, com uma linha por
  // projeto finalista (projetos cujo selo começa com "Finalista").
  const finalists = projects.filter((p) => /^Finalista/.test(p.pt.badge ?? ''));
  const awards = experienceGroups
    .find((g) => g.id === 'awards')
    .items.map((item) => ({
      item,
      instances: item.id === 'finalista' ? finalists : [],
    }));
  const awardTotal = awards.reduce((sum, a) => sum + Math.max(1, a.instances.length), 0);

  const sections = [
    { id: 'resumo', title: c.sections.summary },
    { id: 'competencias', title: c.sections.skills },
    { id: 'experiencias-cv', title: c.sections.experience },
    { id: 'projetos-cv', title: c.sections.projects },
    { id: 'formacao', title: c.sections.education },
    { id: 'reconhecimentos', title: c.sections.awards },
  ];

  const actions = (
    <div className="doc-actions">
      <button type="button" className="btn" onClick={() => window.print()}>
        {c.print}
      </button>
      <span className="t-dim">{c.printHint}</span>
    </div>
  );

  return (
    <DocPage command={c.command} sections={sections} actions={actions}>
      <header className="doc-head">
        <h1>{c.name}</h1>
        <p className="doc-headline">{c.headline}</p>
        <p className="doc-muted">{c.location}</p>
        <ul className="doc-contacts">
          <li>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <Link to="/">mariab.dev</Link>
          </li>
        </ul>
      </header>

      <DocSection id="resumo" index={1} title={c.sections.summary}>
        {c.summary.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </DocSection>

      <DocSection id="competencias" index={2} title={c.sections.skills} summary={c.skillsSummary}>
        <div className="sk-grid">
          {skillTimeline.map((group) => (
            <div className="sk-group" key={group.id}>
              <h3 className="doc-group-title">{group.title[lang]}</h3>
              <ul>
                {group.items.map((skill) => {
                  const time = formatSince(skill.since, lang);
                  return (
                    <li key={skill.name}>
                      <span>{skill.name}</span>
                      {time && (
                        <span
                          className="sk-time"
                          title={c.since(skill.since, pick(skill.source, lang))}
                        >
                          {time}
                          <span className="sr-only">
                            {' '}
                            — {c.since(skill.since, pick(skill.source, lang))}
                          </span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <details className="sk-all">
          <summary>
            {lang === 'pt' ? 'Lista completa do currículo' : 'Full list from the resume'}
          </summary>
          <dl className="doc-kv">
            {c.skills.map(([area, list]) => (
              <div key={area}>
                <dt>{area}</dt>
                <dd>{list}</dd>
              </div>
            ))}
          </dl>
        </details>
      </DocSection>

      <DocSection
        id="experiencias-cv"
        index={3}
        title={c.sections.experience}
        summary={c.experienceSummary(experiences.length, firstYear)}
      >
        <ol className="xp-list">
          {experiences.map(({ item, kind }, i) => (
            <ExperienceCard key={item.id} index={i + 1} item={item} kind={kind} c={c} lang={lang} />
          ))}
        </ol>
      </DocSection>

      <DocSection id="projetos-cv" index={4} title={c.sections.projects}>
        {c.projects.map((p) => (
          <article className="doc-entry" key={p.name}>
            <div className="doc-entry-head">
              <h3>
                {p.name} <span className="doc-muted">— {p.subtitle}</span>
              </h3>
              {p.link &&
                (p.link.to ? (
                  <Link to={p.link.to}>{p.link.label} →</Link>
                ) : (
                  <a href={p.link.href} target="_blank" rel="noopener noreferrer">
                    {p.link.label} →
                  </a>
                ))}
            </div>
            {p.award && <p className="doc-award">🏆 {p.award}</p>}
            <ul>
              {p.points.map((point) => (
                <li key={point.slice(0, 24)}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </DocSection>

      <DocSection id="formacao" index={5} title={c.sections.education}>
        <ol className="xp-list">
          {[...academics.programs].reverse().map((p, i) => (
            <li className="xp-card" key={p.id}>
              <div className="xp-head">
                <span className="xp-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{p.degree[lang]}</h3>
                  <p className="xp-org">{p.institution}</p>
                </div>
                <span className="doc-date">
                  {p.start}–{p.end}
                  {p.expected ? ` (${c.expected})` : ''}
                </span>
              </div>
            </li>
          ))}
        </ol>
        <p>
          <strong>{c.languagesLabel}:</strong> {c.languages}
        </p>
        <p className="no-print">
          <Link to="/academico">{c.academicsLink}</Link>
        </p>
      </DocSection>

      <DocSection
        id="reconhecimentos"
        index={6}
        title={c.sections.awards}
        summary={c.awardsSummary(awardTotal)}
      >
        <ul className="aw-list">
          {awards.map(({ item, instances }) => {
            const times = Math.max(1, instances.length);
            return (
              <li className="xp-card aw-card" key={item.id}>
                <div className="aw-head">
                  <span className="aw-count">{times}×</span>
                  <div>
                    <h3>{item.role[lang]}</h3>
                    <p className="xp-org">
                      {pick(item.org, lang)}{' '}
                      <span className="doc-muted">· {c.received(times)}</span>
                    </p>
                  </div>
                </div>
                {instances.length > 0 && (
                  <ul className="aw-instances">
                    {instances.map((p) => (
                      <li key={p.id}>
                        <Link to="/#projetos">{p.name}</Link>
                        <span className="doc-date">{formatProjectDate(p.date)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </DocSection>
    </DocPage>
  );
}
