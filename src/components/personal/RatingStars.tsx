import type { Rating } from '../../data/personal/types';
import { formatRating } from '../../data/personal/review';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';

// Nota em texto: `★★★½`, com o equivalente para leitor de tela ("3,5 de 5"). Sem nota, mostra
// um travessão e diz "sem nota": o filme sem avaliação do feed real não quebra a linha (CL-22).
export default function RatingStars({ rating }: { rating?: Rating }) {
  const { lang } = useLanguage();
  const p = usePersonalText();

  if (rating === undefined)
    return (
      <span className="pe-rating pe-rating--none" role="img" aria-label={p.rating.none}>
        —
      </span>
    );

  const { stars, label } = formatRating(rating, lang);

  return (
    <span className="pe-rating" role="img" aria-label={label}>
      {stars}
    </span>
  );
}
