import type { PersonalFeed } from '../../data/personal/types';
import { useLanguage } from '../../i18n/LanguageContext';
import Chip from '../ui/Chip';

// Selo de página (CL-13): aparece enquanto os dados vierem do mock. Quem lê o selo é o feed,
// não o modo global, então ele acompanha o dado mesmo que as fontes se misturem.
export default function PlaceholderBadge({ source }: { source?: PersonalFeed<unknown>['source'] }) {
  const { t } = useLanguage();

  if (source !== 'mock') return null;

  return (
    <p className="personal-placeholder" role="note">
      <Chip accent="amber">{t.personal.placeholder.badge}</Chip>{' '}
      <span className="t-dim">{t.personal.placeholder.hint}</span>
    </p>
  );
}
