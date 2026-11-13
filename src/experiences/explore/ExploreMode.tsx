import { useState } from 'react';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTrail } from '../../trails/TrailProvider';
import { secrets } from '../../data/trails';
import { exploreHints } from '../../data/explore';
import { routeById } from '../../data/routes';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import SectionTitle from '../../components/ui/SectionTitle';
import RunButton from '../../components/RunButton';
import type { BlockProps } from '../../components/dashboard/blockProps';

// Modo Explorar (amigo): os segredos que o site já tem (`secrets` de `trails.ts`), com dicas
// que o visitante pede aos poucos. Os achados são os mesmos da trilha de conquistas; o
// botão de recomeçar zera só eles. Opcional: nada do resto do site depende disto.
const TEXT = {
  pt: {
    title: 'Modo explorar',
    lead: 'Há comandos e jogos escondidos. Procure sozinho e peça uma dica só se quiser.',
    progress: (found: number, total: number) => `${found} de ${total} segredos achados`,
    found: 'achado',
    hidden: 'ainda escondido',
    hint: 'Dica',
    how: 'Mostrar como',
    last: (name: string) => `Você achou “${name}”. Que tal`,
    restart: 'Recomeçar a exploração',
    restartNote: 'Zera só os segredos achados. A trilha e o resto do site ficam como estão.',
    optional: 'Opcional: o resto do site continua igual.',
    complete: 'Você achou todos os segredos que listei. Ainda pode haver mais.',
  },
  en: {
    title: 'Explore mode',
    lead: 'There are hidden commands and games. Look on your own and ask for a hint only if you want.',
    progress: (found: number, total: number) => `${found} of ${total} secrets found`,
    found: 'found',
    hidden: 'still hidden',
    hint: 'Hint',
    how: 'Show how',
    last: (name: string) => `You found “${name}”. How about`,
    restart: 'Restart exploring',
    restartNote:
      'Clears only the secrets found. The trail and the rest of the site stay as they are.',
    optional: 'Optional: the rest of the site stays the same.',
    complete: 'You found every secret I listed. There may still be more.',
  },
};

// 0 = nada pedido, 1 = dica, 2 = como fazer.
type Level = 0 | 1 | 2;

export default function ExploreMode({ heading, lead }: BlockProps) {
  const { lang } = useLanguage();
  const { found, resetSecrets } = useTrail();
  const text = TEXT[lang];
  const [levels, setLevels] = useState<Record<string, Level>>({});
  const foundSecrets = secrets.filter((s) => found.includes(s.id));
  // O último achado, na ordem em que o provedor os guarda.
  const lastId = [...found].reverse().find((id) => secrets.some((s) => s.id === id));
  const last = secrets.find((s) => s.id === lastId);
  const next = last ? exploreHints[last.id]?.next : undefined;
  const nextRoute = next && routeById(next.route);

  const ask = (id: string, level: Level) => setLevels((prev) => ({ ...prev, [id]: level }));

  return (
    <section className="dash-section exp-block" aria-labelledby="explore-title" data-tone="pink">
      <SectionTitle as="h2" id="explore-title" size="md">
        {heading ?? text.title}
      </SectionTitle>
      <p className="t-dim">{lead ?? text.lead}</p>
      <p className="explore-progress" role="status">
        {text.progress(foundSecrets.length, secrets.length)}
      </p>

      <ul className="explore-list">
        {secrets.map((s) => {
          const isFound = found.includes(s.id);
          const info = exploreHints[s.id];
          const level = levels[s.id] ?? 0;

          return (
            <li key={s.id}>
              <Card as="div" className="explore-item" data-found={isFound || undefined}>
                <p className="explore-name">
                  <strong>{isFound ? s.label[lang] : '???'}</strong>{' '}
                  <Chip tone={isFound ? 'live' : 'default'}>
                    {isFound ? text.found : text.hidden}
                  </Chip>
                </p>
                {!isFound && info && (
                  <>
                    {level >= 1 && <p className="t-dim">{info.hint[lang]}</p>}
                    {level >= 2 && (
                      <p className="t-dim">
                        {info.how[lang]} {info.command && <RunButton command={info.command} go />}
                      </p>
                    )}
                    {level < 2 && (
                      <button
                        type="button"
                        className="explore-ask"
                        onClick={() => ask(s.id, (level + 1) as Level)}
                      >
                        {level === 0 ? text.hint : text.how}
                      </button>
                    )}
                  </>
                )}
              </Card>
            </li>
          );
        })}
      </ul>

      {last && next && nextRoute && (
        <p className="explore-next" role="status">
          {text.last(last.label[lang])} <Link to={nextRoute.path}>{next.label[lang]}</Link>?
        </p>
      )}
      {foundSecrets.length === secrets.length && <p className="t-dim">{text.complete}</p>}

      <p className="explore-actions">
        <Link to={routeById('jogos')?.path ?? '/jogos'} className="dash-btn">
          {routeById('jogos')?.label[lang]}
        </Link>
        <Link to={routeById('terminal')?.path ?? '/terminal'} className="dash-btn">
          {routeById('terminal')?.label[lang]}
        </Link>
        {foundSecrets.length > 0 && (
          <button
            type="button"
            className="dash-btn"
            onClick={() => {
              resetSecrets();
              setLevels({});
            }}
          >
            {text.restart}
          </button>
        )}
      </p>
      <p className="t-dim">{foundSecrets.length > 0 ? text.restartNote : text.optional}</p>
    </section>
  );
}
