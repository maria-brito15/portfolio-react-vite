import type { ReactNode } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { HOME, type HomeBlock } from '../../data/homeLayout';
import GithubStats from '../GithubStats';
import QuickAccess from './QuickAccess';
import FeaturedProjects from './FeaturedProjects';

// Monta o corpo da home na ordem de `homeLayout.ts`. Os blocos são sempre os mesmos
// componentes e os mesmos dados; a composição só escolhe quais, em que ordem e com que título.
export default function HomeSections() {
  const { lang } = useLanguage();

  const render = (block: HomeBlock): ReactNode => {
    const text = { heading: block.title?.[lang], lead: block.lead?.[lang] };

    switch (block.id) {
      case 'projects':
        return <FeaturedProjects {...text} ids={block.projects} />;
      case 'quick':
        return <QuickAccess {...text} />;
      case 'github':
        return <GithubStats summary />;
    }
  };

  // Blocos `half` vizinhos dividem a linha.
  const rows: HomeBlock[][] = [];

  for (const block of HOME.blocks) {
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
