import { profile } from '../data/profile';

// Botões de contato do original (e-mail, LinkedIn, GitHub).
export default function ContactLinks({ email, emailLabel }) {
  return (
    <div className="clinks">
      <a className="clink" href={`mailto:${email}`}>
        {emailLabel}
      </a>
      <a className="clink" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
        💼 LinkedIn
      </a>
      <a className="clink" href={profile.github} target="_blank" rel="noopener noreferrer">
        🐙 GitHub
      </a>
    </div>
  );
}
