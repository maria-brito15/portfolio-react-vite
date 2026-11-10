import SectionTitle from '../../components/ui/SectionTitle';
import { profile } from '../../data/profile';

import type { PortfolioContent } from '../../data/portfolio';

export default function About({ content }: { content: PortfolioContent['about'] }) {
  return (
    <section id="sobre" className="sec" aria-labelledby="sobre-title">
      <SectionTitle id="sobre-title" label={content.label}>
        {content.title}
      </SectionTitle>
      <div className="about-grid">
        <div className="about-left">
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
        </div>
        <div className="about-right">
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
        </div>
      </div>
    </section>
  );
}
