import type { Instrument } from '../../data/personal/types';
import { useLanguage } from '../../i18n/LanguageContext';
import { usePersonalText } from '../../i18n/usePersonalText';

// Instrumento: só o nome é obrigatório; nível, ano de início e nota aparecem se a Duda
// preencheu (nunca se presume experiência).
export default function InstrumentCard({ instrument }: { instrument: Instrument }) {
  const { lang } = useLanguage();
  const p = usePersonalText();
  const meta = [instrument.level?.[lang], instrument.since && p.music.since(instrument.since)].filter(
    Boolean,
  );

  return (
    <li className="pe-card">
      <p className="pe-entry-title">{instrument.name[lang]}</p>
      {meta.length > 0 && <p className="pe-entry-meta">{meta.join(' · ')}</p>}
      {instrument.note && <p className="pe-entry-note">{instrument.note[lang]}</p>}
    </li>
  );
}
