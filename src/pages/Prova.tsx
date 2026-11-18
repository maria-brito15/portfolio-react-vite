// Página de prova (spec 002, T5.1, TD-009): reúne os elementos que a medição de tamanho e
// desempenho (T5.3) e os testes de acessibilidade e de teclado (T5.2) precisam: h1, h2, h3, três
// parágrafos marcados como exemplo, link de texto, botão principal e secundário, figura com `alt` e
// dimensões, cinco etiquetas. O rodapé com o link para a home é o da casca. Só existe no build de
// prova (`vite build --mode prova`); o site publicado não a contém.
import { Link } from '../router';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { pathInLang } from '../data/routes';
import Chip from '../components/ui/Chip';

export default function Prova() {
  const { lang, t } = useLanguage();
  const p = t.prova;

  useDocumentMeta('prova');

  return (
    <article className="prova">
      <h1>{p.title}</h1>
      <p className="t-dim">{p.lead}</p>
      <h2>{p.h2}</h2>
      {p.paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      <h3>{p.h3}</h3>
      <p>
        <Link to={pathInLang('/', lang)}>{p.link}</Link>
      </p>
      <p className="prova-actions">
        <button type="button" className="btn">
          {p.primary}
        </button>
        <button type="button" className="btn-o">
          {p.secondary}
        </button>
      </p>
      <figure>
        <img
          src="/assets/og-image.png"
          alt={p.figureAlt}
          width={1200}
          height={630}
          loading="lazy"
          decoding="async"
        />
        <figcaption>{p.figureCaption}</figcaption>
      </figure>
      <ul className="prova-tags" aria-label={p.tagsLabel}>
        {p.tags.map((tag) => (
          <li key={tag}>
            <Chip>{tag}</Chip>
          </li>
        ))}
      </ul>
    </article>
  );
}
