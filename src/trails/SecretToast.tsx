import { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { secrets } from '../data/trails';
import { useTrail } from './TrailProvider';

// Aviso discreto de segredo encontrado (TR-20): só na trilha de conquistas, em região
// `aria-live`, sem som, some sozinho. A carga inicial nunca dispara o aviso.
const SHOW_MS = 4000;

export default function SecretToast() {
  const { lang, t } = useLanguage();
  const { trail, found } = useTrail();
  const [seen, setSeen] = useState(found.length);
  const [message, setMessage] = useState<string | null>(null);
  const on = trail?.style === 'achievements';

  // Só compara com a contagem anterior (padrão "estado derivado durante a renderização").
  if (found.length !== seen) {
    setSeen(found.length);

    const latest = secrets.find((s) => s.id === found.at(-1));

    if (on && latest && found.length > seen)
      setMessage(t.trail.secretFound(latest.label[lang], found.length, secrets.length));
  }

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => setMessage(null), SHOW_MS);

    return () => clearTimeout(timer);
  }, [message]);

  // Só a trilha de conquistas tem a região viva; nas outras páginas ela nem existe.
  if (!on) return null;

  return (
    <div className="secret-toast-slot" role="status" aria-live="polite">
      {message && <p className="secret-toast">{message}</p>}
    </div>
  );
}
