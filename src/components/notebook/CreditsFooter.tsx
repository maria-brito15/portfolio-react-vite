import { useLanguage } from '../../i18n/LanguageContext';
import { profile } from '../../data/profile';
import { toRoman, volume } from '../../data/notebook/volume';
import { cuttingRoom } from './useCuttingRoom';

// Créditos de filme no lugar do rodapé (CD-50 a CD-52). As fontes de dados são as dos feeds
// em uso; o aviso da TMDB é obrigatório (CD-51). O link da sala de montagem é o único
// anúncio do overlay do terminal. Revisão R1: sem o número do volume (o vocabulário de volume saiu da
// interface; o número continua só como chave da abertura).
export default function CreditsFooter() {
  const { t } = useLanguage();
  const c = t.nb.credits;
  const year = toRoman(volume.year);

  return (
    <footer className="nb-credits" aria-label={c.label}>
      <dl className="nb-credits-list">
        <div>
          <dt>{c.written}</dt>
          <dd>{t.nb.coverName}</dd>
        </div>
        <div>
          <dt>{c.typeset}</dt>
          <dd>Fraunces · JetBrains Mono</dd>
        </div>
        <div>
          <dt>{c.built}</dt>
          <dd>React · Vite · Netlify</dd>
        </div>
        <div>
          <dt>{c.data}</dt>
          <dd>
            <a href="https://hardcover.app" target="_blank" rel="noopener noreferrer">
              Hardcover
            </a>
            {' · '}
            <a href="https://letterboxd.com" target="_blank" rel="noopener noreferrer">
              Letterboxd
            </a>
            {' · '}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
              TMDB
            </a>
          </dd>
        </div>
      </dl>
      <p className="nb-credits-tmdb">{c.tmdb}</p>
      <p className="nb-credits-solo">
        {c.solo} · {year}
      </p>
      <p className="nb-credits-links">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <button
          type="button"
          className="nb-link-btn"
          aria-label={c.cuttingRoomLabel}
          onClick={cuttingRoom.show}
        >
          {c.cuttingRoom}
        </button>
      </p>
    </footer>
  );
}
