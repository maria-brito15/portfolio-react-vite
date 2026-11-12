import { useLanguage } from '../i18n/LanguageContext';
import { secrets, type Trail } from '../data/trails';

// Progresso na medida da persona (TR-19): `checklist` ("você viu N de M", sem pontos nem
// níveis), `bar` (barra) ou `achievements` (segredos achados). Só a trilha de conquistas
// mostra a lista de segredos; os nomes que ainda não foram achados ficam como "?".
export default function TrailProgress({
  trail,
  done,
  total,
  found,
  compact = false,
}: {
  trail: Trail;
  done: number;
  total: number;
  found: string[];
  // No cartão do tour só o contador, sem a lista de segredos.
  compact?: boolean;
}) {
  const { lang, t } = useLanguage();
  const text = t.trail;

  if (trail.style === 'checklist')
    return done > 0 ? <p className="t-dim trail-progress">{text.seen(done, total)}</p> : null;

  if (trail.style === 'bar')
    return done > 0 ? (
      <p className="trail-bar">
        <progress value={done} max={total} aria-label={text.seen(done, total)} />
        <span className="t-dim">
          {done}/{total}
        </span>
      </p>
    ) : null;

  const count = secrets.filter((s) => found.includes(s.id)).length;

  return (
    <div className="trail-secrets">
      <p className="t-dim trail-progress">{text.secrets(count, secrets.length)}</p>
      {!compact && (
        <ul aria-label={text.secrets(count, secrets.length)}>
          {secrets.map((s) => (
            <li key={s.id} data-found={found.includes(s.id) || undefined}>
              {found.includes(s.id) ? `✓ ${s.label[lang]}` : '?'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
