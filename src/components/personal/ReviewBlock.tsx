import { truncateReview } from '../../data/personal/review';
import { usePersonalText } from '../../i18n/usePersonalText';

// Resenha como citação, com kicker próprio (D8): inteira até ~400 caracteres; acima disso,
// truncada com o link canônico para o Letterboxd (crédito e atribuição).
export default function ReviewBlock({ review, url }: { review: string; url: string }) {
  const p = usePersonalText();
  const { text, truncated } = truncateReview(review);

  return (
    <blockquote className="pe-review">
      <p className="pe-kicker">{p.review.label}</p>
      <p>{text}</p>
      {truncated && (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {p.review.more}
        </a>
      )}
    </blockquote>
  );
}
