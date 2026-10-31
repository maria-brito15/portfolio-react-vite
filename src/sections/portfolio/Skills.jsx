import Reveal from '../../components/Reveal';

export default function Skills({ content }) {
  return (
    <section id="habilidades" className="sec" aria-labelledby="habilidades-title">
      <div className="lbl">{content.label}</div>
      <h2 className="stitle" id="habilidades-title">
        {content.title}
      </h2>
      <div className="skills-block">
        {content.rows.map(([area, tools]) => (
          <Reveal className="sk-row" key={area}>
            <h3>{area}</h3>
            <p>{tools}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
