import SectionTitle from '../../components/ui/SectionTitle';

import type { PortfolioContent } from '../../data/portfolio';

export default function Skills({ content }: { content: PortfolioContent['skills'] }) {
  return (
    <section id="habilidades" className="sec" aria-labelledby="habilidades-title">
      <SectionTitle as="h1" id="habilidades-title" label={content.label}>
        {content.title}
      </SectionTitle>
      <div className="skills-block">
        {content.rows.map(([area, tools]) => (
          <div className="sk-row" key={area}>
            <h2>{area}</h2>
            <p>{tools}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
