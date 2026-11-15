import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatSyncDate } from '../../data/personal/review';
import type { ActivityItem, ActivityKind } from '../../data/notebook/activity';
import Stars from './Stars';

// Concluído (assistiu, terminou de ler) usa a cor de confirmação; começar a ler é estado ativo.
const TONE: Record<ActivityKind, 'done' | 'active'> = {
  watched: 'done',
  rewatched: 'done',
  finished: 'done',
  started: 'active',
};

function Entry({ item }: { item: ActivityItem }) {
  const { lang, t } = useLanguage();
  const a = t.nb.activity;
  // Dia ISO sem hora: formatado em UTC, para o fuso de quem lê não trocar o dia.
  const date = formatSyncDate(item.date, lang, 'UTC', false);
  const title = item.year === undefined ? item.title : `${item.title} (${item.year})`;
  const tone = TONE[item.kind];

  return (
    <li className={`nb-act is-${tone}`} data-kind={item.kind}>
      <span className="nb-act-thumb" aria-hidden="true">
        {item.image && <img src={item.image} alt="" loading="lazy" decoding="async" />}
      </span>
      <p className="nb-act-line">
        <span className="nb-act-mark" aria-hidden="true">
          {tone === 'done' ? '✓' : '●'}
        </span>
        <time dateTime={item.date} className="nb-act-date">
          {a.on(date)}
        </time>
        {', '}
        <span className="nb-act-verb">{a.kinds[item.kind]}</span>{' '}
        {item.href ? (
          <a className="nb-act-title" href={item.href} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        ) : (
          <span className="nb-act-title">{title}</span>
        )}
        {item.rating !== undefined && (
          <span className="nb-act-rating">
            {' — '}
            {a.rating} <Stars value={item.rating} />
          </span>
        )}
        {item.liked && (
          <span className="nb-act-liked" role="img" aria-label={a.liked}>
            {' '}♥
          </span>
        )}
      </p>
    </li>
  );
}

// Feed de atividade (revisão R1, CD-92): lista cronológica "em [data], [ação] — nota [x]". Começa com
// `limit` itens e "mostrar mais" revela outro tanto. Sem item, a frase de vazio (nunca inventa).
export default function ActivityFeed({
  items,
  limit = 12,
  expandable = true,
}: {
  items: ActivityItem[];
  limit?: number;
  expandable?: boolean;
}) {
  const { t } = useLanguage();
  const [shown, setShown] = useState(limit);

  if (!items.length) return <p className="nb-act-empty">{t.nb.activity.empty}</p>;

  return (
    <>
      <ol className="nb-acts" aria-label={t.nb.activity.label}>
        {items.slice(0, shown).map((item) => (
          <Entry key={item.id} item={item} />
        ))}
      </ol>
      {expandable && shown < items.length && (
        <button type="button" className="nb-btn nb-acts-more" onClick={() => setShown((n) => n + limit)}>
          {t.nb.activity.more} ({items.length - shown})
        </button>
      )}
    </>
  );
}
