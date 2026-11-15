import { useLanguage } from '../../i18n/LanguageContext';
import { toHalf } from '../../data/notebook/activity';

// Avaliação em estrelas (revisão R1, CD-91): 0 a 5, de meia em meia. Desenho = cinco estrelas vazias
// e, por cima, as mesmas cinco cortadas na largura da nota (meia estrela = meia largura de glifo).
// Para leitor de tela é uma imagem com "3,5 de 5". Sem nota, um travessão rotulado "sem nota":
// nunca zero presumido. Só para livros e filmes; não serve a habilidades nem a projetos.
export default function Stars({ value, className = '' }: { value?: number; className?: string }) {
  const { lang, t } = useLanguage();

  if (value === undefined || Number.isNaN(value)) {
    return (
      <span className={`nb-stars is-none ${className}`.trim()} role="img" aria-label={t.nb.stars.none}>
        —
      </span>
    );
  }

  const rating = toHalf(value);
  const text = lang === 'pt' ? String(rating).replace('.', ',') : String(rating);

  return (
    <span
      className={`nb-stars ${className}`.trim()}
      role="img"
      aria-label={t.nb.stars.label(text)}
      data-rating={rating}
    >
      <span className="nb-stars-base" aria-hidden="true">
        ★★★★★
      </span>
      <span className="nb-stars-fill" aria-hidden="true" style={{ width: `${(rating / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
