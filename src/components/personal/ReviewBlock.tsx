import { truncateReview } from '../../data/personal/review';
import { usePersonalText } from '../../i18n/usePersonalText';

// Resenha como citação, com kicker próprio (D8): inteira até ~400 caracteres; acima disso,
// truncada com o link canônico para a fonte (crédito e atribuição). Sem `url` não há link; `moreLabel`
// troca o texto do link (o padrão fala do Letterboxd).
export default function ReviewBlock({
  review,
  url,
  moreLabel,
}: {
  review: string;
  url?: string;
  moreLabel?: string;
}) {
  const p = usePersonalText();
  const { text, truncated } = truncateReview(review);

  return (
    <blockquote className="pe-review">
      <p className="pe-kicker">{p.review.label}</p>
      <p>{text}</p>
      {truncated && url && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {moreLabel ?? p.review.more}
        </a>
      )}
    </blockquote>
  );
}
