import { Link } from '../../router';
import { profile } from '../../data/profile';

export default function Hero({ content }) {
  return (
    <section className="hero" id="inicio">
      <div className="glow" aria-hidden="true"></div>
      <div>
        <div className="badge">
          <span className="bdot" aria-hidden="true"></span>
          <span className="page-tag">{content.tag}</span>
        </div>
        <h1>{content.title}</h1>
        <p className="hero-sub">{content.sub}</p>
        <div className="hero-ctas">
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="btn">
            GitHub →
          </a>
          <Link to="/#projetos" className="btn-o">
            {content.cta}
          </Link>
        </div>
        <div className="hero-pills">
          {content.pills.map((pill) => (
            <span className="hero-pill" key={pill}>
              {pill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
