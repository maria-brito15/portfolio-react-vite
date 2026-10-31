import Reveal from '../../components/Reveal';
import { profile } from '../../data/profile';

export default function About({ content }) {
  return (
    <section id="sobre" className="sec" aria-labelledby="sobre-title">
      <div className="lbl">{content.label}</div>
      <h2 className="stitle" id="sobre-title">
        {content.title}
      </h2>
      <div className="about-grid">
        <Reveal className="about-left">
          <div className="about-avatar-wrap">
            <div className="about-avatar">
              <img src={profile.photo} alt={content.photoAlt} width="768" height="768" />
            </div>
            <div className="about-avatar-dot" aria-hidden="true"></div>
          </div>
          <div className="about-name">{content.name}</div>
          <div className="about-role">{content.role}</div>
          <div className="about-loc">
            {content.location}
            <br />
            {content.languages}
          </div>
          <div className="about-links">
            <a href={`mailto:${profile.email}`} className="about-link">
              ✉️ {profile.email}
            </a>
            <a
              href={profile.github}
              className="about-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              💻 github.com/maria-brito15
            </a>
            <a
              href={profile.linkedin}
              className="about-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              💼 LinkedIn
            </a>
          </div>
        </Reveal>
        <Reveal className="about-right">
          {content.bio.map((paragraph, i) => (
            <p className="about-bio" key={i}>
              {paragraph}
            </p>
          ))}
          <div className="interests">
            <div className="lbl">{content.interestsLabel}</div>
            <ul className="interests-list">
              {content.interests.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
