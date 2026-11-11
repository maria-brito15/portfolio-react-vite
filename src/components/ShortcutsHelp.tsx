// Lista de atalhos de teclado (`?`), lida da tabela única em data/shortcuts.ts.
import { useLanguage } from '../i18n/LanguageContext';
import { shortcuts } from '../data/shortcuts';
import Overlay from './Overlay';

export default function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const { lang, t } = useLanguage();

  return (
    <Overlay label={t.overlay.shortcuts} onClose={onClose}>
      <div className="shortcuts">
        <h2 className="shortcuts-title">{t.overlay.shortcuts}</h2>
        <dl className="shortcuts-list">
          {shortcuts.map((s) => (
            <div key={s.keys}>
              <dt>
                <kbd>{s.keys}</kbd>
              </dt>
              <dd>{s.desc[lang]}</dd>
            </div>
          ))}
        </dl>
        <button type="button" className="shortcuts-close" onClick={onClose}>
          {t.overlay.close}
        </button>
      </div>
    </Overlay>
  );
}
