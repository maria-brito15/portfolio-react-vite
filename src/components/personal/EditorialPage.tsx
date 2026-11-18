import type { ReactNode } from 'react';
import { editorialNumber } from '../../data/personal/editorial';
import { routeById } from '../../data/routes';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useLanguage } from '../../i18n/LanguageContext';
import EditorialHeader from './EditorialHeader';

// Moldura de toda página do espaço cultural: o título do
// documento e a cabeça editorial (número 001–005, kicker, título e lede). Título e kicker saem
// de `routes.ts`: nas subpáginas o kicker é o caminho ("Pessoal / Filmes"); o hub passa o seu.
export default function EditorialPage({
  routeId,
  deck,
  kicker,
  children,
}: {
  routeId: string;
  deck: string;
  kicker?: string;
  children: ReactNode;
}) {
  const { lang } = useLanguage();
  const route = routeById(routeId);
  const parent = route?.parent ? routeById(route.parent) : undefined;
  const title = route?.label[lang] ?? '';

  useDocumentMeta(routeId);

  return (
    <>
      <section className="sec info-page">
        <EditorialHeader
          number={editorialNumber(routeId)}
          kicker={kicker ?? (parent ? `${parent.label[lang]} / ${title}` : title)}
          title={title}
          deck={deck}
          tone="amber"
        />
        {children}
      </section>
    </>
  );
}
