import { useEffect } from 'react';
import { Link, useRouter } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { projects, type Project } from '../../data/projects';
import { routeById } from '../../data/routes';

// Projetos que têm página própria (estudo de caso), na ordem de `projects`.
export const caseProjects = (): Project[] => projects.filter((p) => p.caseStudy);

const inField = (el: EventTarget | null) =>
  el instanceof Element &&
  el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="dialog"]') !==
    null;

// "Próxima produção" (CD-22): ocupa a viewport ao fim do estudo de caso, com o cartão do próximo
// projeto; ←/→ navegam entre projetos (desligados em campos e diálogos). Hoje só um projeto tem
// página; no último (ou único), aponta para a lista de projetos.
export default function NextProduction({ projectId }: { projectId: string }) {
  const { t } = useLanguage();
  const { navigate } = useRouter();
  const list = caseProjects();
  const index = list.findIndex((p) => p.id === projectId);
  const next = list.length > 1 && index >= 0 ? list[(index + 1) % list.length] : undefined;
  const prev = list.length > 1 && index >= 0 ? list[(index - 1 + list.length) % list.length] : undefined;
  const all = routeById('projetos');
  const p = t.nb.project;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      if (inField(event.target)) return;

      const target = event.key === 'ArrowRight' ? next : event.key === 'ArrowLeft' ? prev : undefined;

      if (target?.caseStudy) navigate(target.caseStudy);
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [next, prev, navigate]);

  const destination = next?.caseStudy ?? all?.path ?? '/projetos';
  const title = next?.name ?? p.last;

  return (
    <section className="nb-next" aria-label={p.nextEyebrow}>
      <p className="nb-kicker">{p.nextEyebrow}</p>
      <Link to={destination} className="nb-next-link">
        <span className="nb-next-title">{title}</span>
        <span className="nb-next-cta">{next ? p.next : p.last} →</span>
      </Link>
      {next && <p className="nb-next-keys">{p.nextKeys}</p>}
    </section>
  );
}
