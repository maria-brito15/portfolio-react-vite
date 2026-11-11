// Corpo das páginas /agora e /setup, usado pela página própria e pela visão em
// terminal (mesmo conteúdo, lido de data/now.ts e data/uses.ts). Sem conteúdo,
// mostra o aviso "em construção" no lugar (nada de texto inventado).
import type { Lang } from '../types';
import { now } from '../data/now';
import { uses } from '../data/uses';
import { ui } from '../i18n/ui';

export const nowIsEmpty = () => now.items.length === 0;
export const usesIsEmpty = () => uses.groups.length === 0;

export function DraftNotice({ lang }: { lang: Lang }) {
  return (
    <p className="draft-note">
      <strong>{ui[lang].draft.title}.</strong> {ui[lang].draft.text}
    </p>
  );
}

const updatedLine = (updated: string | null, lang: Lang) =>
  updated ? (
    <p className="t-dim">
      {lang === 'pt' ? 'atualizado em ' : 'updated on '}
      {updated}
    </p>
  ) : null;

export function NowBody({ lang }: { lang: Lang }) {
  if (nowIsEmpty()) return <DraftNotice lang={lang} />;

  return (
    <div>
      <dl className="t-kv">
        {now.items.map((item) => (
          <div key={item.label.pt}>
            <dt>{item.label[lang]}</dt>
            <dd>{item.text[lang]}</dd>
          </div>
        ))}
      </dl>
      {updatedLine(now.updated, lang)}
    </div>
  );
}

export function UsesBody({ lang }: { lang: Lang }) {
  if (usesIsEmpty()) return <DraftNotice lang={lang} />;

  return (
    <div>
      {uses.groups.map((group) => (
        <div key={group.title.pt} className="t-group">
          <p className="t-dim"># {group.title[lang]}</p>
          <dl className="t-kv">
            {group.items.map((item) => (
              <div key={item.name}>
                <dt>{item.name}</dt>
                <dd>{item.note?.[lang] ?? ''}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      {updatedLine(uses.updated, lang)}
    </div>
  );
}
