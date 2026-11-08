import SectionTitle from '../../components/ui/SectionTitle';

export default function Skills({ content }) {
  return (
    <section id="habilidades" className="sec" aria-labelledby="habilidades-title">
      <SectionTitle id="habilidades-title" label={content.label}>
        {content.title}
      </SectionTitle>
      <div className="skills-block">
        {content.rows.map(([area, tools]) => (
          <div className="sk-row" key={area}>
            <h3>{area}</h3>
            <p>{tools}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
