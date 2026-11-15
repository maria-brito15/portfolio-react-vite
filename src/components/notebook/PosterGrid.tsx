import { useState } from 'react';
import { Link } from '../../router';
import Stars from './Stars';

export interface Poster {
  id: string;
  title: string;
  // Linha curta sob o título: autor, ano.
  sub?: string;
  image?: string;
  // Só livros e filmes têm nota; quem não passa `rated` não mostra estrelas.
  rating?: number;
  rated?: boolean;
  // Selo de estado: `done` (verde: lido, assistido) ou `active` (quente: lendo agora).
  status?: { tone: 'done' | 'active'; label: string };
  // Ocupa 2×2 no mosaico (ex.: o livro de agora).
  feature?: boolean;
  // Interno (`/…`, pelo roteador) ou externo (nova aba).
  href?: string;
}

// Um pôster (2:3): capa ou pôster da fonte; sem imagem, ou com ela quebrada, o cartaz tipográfico
// (título em serifa). Título, linha e nota ficam sempre no DOM (é o nome do link); na tela só
// aparecem no hover e no foco, e ficam sempre visíveis onde não há hover (toque).
function PosterTile({ poster }: { poster: Poster }) {
  const [failed, setFailed] = useState<string>();
  const showImage = Boolean(poster.image) && failed !== poster.image;
  const body = (
    <>
      <span className="nb-poster-frame" aria-hidden="true">
        {showImage ? (
          <img
            src={poster.image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(poster.image)}
          />
        ) : (
          <span className="nb-poster-ph">{poster.title}</span>
        )}
      </span>
      <span className="nb-poster-info">
        <span className="nb-poster-title">{poster.title}</span>
        {poster.sub && <span className="nb-poster-sub">{poster.sub}</span>}
        {poster.rated && <Stars value={poster.rating} />}
      </span>
      {poster.status && (
        <span className={`nb-poster-badge is-${poster.status.tone}`}>{poster.status.label}</span>
      )}
    </>
  );
  const className = `nb-poster-link${showImage ? '' : ' is-typographic'}`;
  const href = poster.href;

  return (
    <li className={`nb-poster${poster.feature ? ' is-feature' : ''}`}>
      {!href ? (
        <div className={className}>{body}</div>
      ) : href.startsWith('/') ? (
        <Link to={href} className={className}>
          {body}
        </Link>
      ) : (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      )}
    </li>
  );
}

// Grade densa de pôsteres (revisão R1, CD-90), em mosaico: colunas automáticas, pôsteres em
// destaque ocupam 2×2 e `dense` preenche os buracos. Lista com rótulo; a ordem do DOM é a da lista.
export default function PosterGrid({
  posters,
  label,
  size = 'md',
}: {
  posters: Poster[];
  label: string;
  size?: 'sm' | 'md';
}) {
  if (!posters.length) return null;

  return (
    <ul className={`nb-posters nb-posters--${size}`} aria-label={label}>
      {posters.map((poster) => (
        <PosterTile key={poster.id} poster={poster} />
      ))}
    </ul>
  );
}
