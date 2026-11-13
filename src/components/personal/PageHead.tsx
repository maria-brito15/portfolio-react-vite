import { routeById } from '../../data/routes';
import { useLanguage } from '../../i18n/LanguageContext';
import EditorialHeader from './EditorialHeader';

// Cabeça das subpáginas: o kicker é o caminho editorial ("Pessoal / Filmes") e o título é o
// rótulo da rota; tudo vem de `routes.ts`.
export default function PageHead({ routeId, deck }: { routeId: string; deck: string }) {
  const { lang } = useLanguage();
  const route = routeById(routeId);
  const parent = route?.parent ? routeById(route.parent) : undefined;
  const label = route?.label[lang] ?? '';

  return (
    <EditorialHeader
      kicker={parent ? `${parent.label[lang]} / ${label}` : label}
      title={label}
      deck={deck}
      tone="amber"
    />
  );
}
