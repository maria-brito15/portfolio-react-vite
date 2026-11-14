import { useState, type ReactNode } from 'react';

// O servidor entrega pôsteres do TMDB em w342; para capas pequenas (hub, diário) o navegador
// escolhe w185 e poupa banda. Outras fontes não têm tamanho alternativo: sem `srcSet`.
const TMDB_W342 = /^(https:\/\/image\.tmdb\.org\/t\/p\/)w342(\/.+)$/;

function tmdbSrcSet(src?: string) {
  const match = src ? TMDB_W342.exec(src) : null;

  return match ? `${match[1]}w185${match[2]} 185w, ${src} 342w` : undefined;
}

// Capa de livro ou pôster de filme (proporção 2:3). Sem URL, ou com a imagem quebrada,
// mostra o placeholder tipográfico (título + ano em bloco mono): nunca o ícone de imagem
// quebrada (CL-18). A imagem leva `width`/`height` e `loading="lazy"` para não deslocar o
// layout. Quem chama escolhe o `alt` (título e, se houver, ano).
export default function CoverFigure({
  src,
  alt,
  title,
  year,
  width = 200,
  height = 300,
  caption,
}: {
  src?: string;
  alt: string;
  title: string;
  year?: number;
  width?: number;
  height?: number;
  caption?: ReactNode;
}) {
  // Guarda qual URL falhou: trocar a `src` tenta de novo a nova imagem.
  const [failed, setFailed] = useState<string>();
  const showImage = Boolean(src) && failed !== src;

  return (
    <figure className="pe-cover">
      <div className="pe-cover-frame">
        {showImage ? (
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            srcSet={tmdbSrcSet(src)}
            sizes={`${width}px`}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(src)}
          />
        ) : (
          <div className="pe-cover-ph" role="img" aria-label={alt}>
            <span className="pe-cover-ph-title">{title}</span>
            {year !== undefined && <span className="pe-cover-ph-year">{year}</span>}
          </div>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
