import { lazy, Suspense, type ReactNode } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersona } from '../../hooks/usePersona';
import { homeFor, type HomeBlock } from '../../data/personaHome';
import GithubStats from '../GithubStats';
import QuickAccess from './QuickAccess';
import FeaturedProjects from './FeaturedProjects';
import InteractivePanel from './InteractivePanel';
import ProfileSummary from './ProfileSummary';
import StackOverview from './StackOverview';
import AcademicSnapshot from './AcademicSnapshot';
import ServicesPreview from './ServicesPreview';
import IntentShortcuts from './IntentShortcuts';

// As experiências por persona são pesadas e cada visitante vê só uma: ficam fora do JS inicial.
const ProfessionalOverview = lazy(() => import('../../experiences/recruiter/ProfessionalOverview'));
const ArchitectureExplorer = lazy(() => import('../../experiences/tech/ArchitectureExplorer'));
const AcademicTimeline = lazy(() => import('../../experiences/professor/AcademicTimeline'));
const SolutionJourney = lazy(() => import('../../experiences/client/SolutionJourney'));
const ExploreMode = lazy(() => import('../../experiences/explore/ExploreMode'));

// Monta o corpo da home na ordem da persona (`personaHome.ts`). Os blocos são sempre os
// mesmos componentes e os mesmos dados; a persona só escolhe quais, em que ordem e com que
// título. Sem persona, vale a composição padrão.
export default function PersonaHomeSections() {
  const { lang } = useLanguage();
  const { persona } = usePersona();
  const { blocks } = homeFor(persona?.id);

  const render = (block: HomeBlock): ReactNode => {
    const text = { heading: block.title?.[lang], lead: block.lead?.[lang] };

    switch (block.id) {
      case 'profile':
        return <ProfileSummary {...text} />;
      case 'stack':
        return <StackOverview {...text} />;
      case 'academic':
        return <AcademicSnapshot {...text} />;
      case 'services':
        return <ServicesPreview {...text} />;
      case 'projects':
        return <FeaturedProjects {...text} ids={block.projects} />;
      case 'quick':
        return <QuickAccess {...text} />;
      case 'github':
        return <GithubStats summary />;
      case 'intents':
        return <IntentShortcuts {...text} />;
      case 'interactive':
        return <InteractivePanel {...text} />;
      case 'overview':
        return (
          <Suspense fallback={null}>
            <ProfessionalOverview {...text} />
          </Suspense>
        );
      case 'architecture':
        return (
          <Suspense fallback={null}>
            <ArchitectureExplorer {...text} />
          </Suspense>
        );
      case 'timeline':
        return (
          <Suspense fallback={null}>
            <AcademicTimeline {...text} />
          </Suspense>
        );
      case 'journey':
        return (
          <Suspense fallback={null}>
            <SolutionJourney {...text} />
          </Suspense>
        );
      case 'explore':
        return (
          <Suspense fallback={null}>
            <ExploreMode {...text} />
          </Suspense>
        );
    }
  };

  // Blocos `half` vizinhos dividem a linha (como o GitHub e o Interativo sempre fizeram).
  const rows: HomeBlock[][] = [];

  for (const block of blocks) {
    const last = rows[rows.length - 1];

    if (block.half && last?.[0].half) last.push(block);
    else rows.push([block]);
  }

  return (
    <>
      {rows.map((row) =>
        row.length > 1 ? (
          <div className="dash-split" key={row.map((b) => b.id).join('+')}>
            {row.map((b) => (
              <div key={b.id}>{render(b)}</div>
            ))}
          </div>
        ) : (
          <div key={row[0].id}>{render(row[0])}</div>
        ),
      )}
    </>
  );
}
