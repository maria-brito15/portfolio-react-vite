import { Suspense, lazy, useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import SiteShell from '../components/shell/SiteShell';
import CommandCatalog from '../components/CommandCatalog';
import Card from '../components/ui/Card';
import SectionTitle from '../components/ui/SectionTitle';
import { LEVELS, LEVEL_NAMES, type Level } from '../terminal/games/mines';
import { readBest } from '../terminal/games/bestTimes';

const Minesweeper = lazy(() => import('../terminal/games/Minesweeper'));

const LEVEL_IDS = Object.keys(LEVELS) as Level[];

// Biblioteca de jogos: cada jogo com descrição, níveis, melhor tempo (o recorde
// que o próprio jogo já grava no navegador) e botão de jogar. O tabuleiro é o
// mesmo componente do comando `minas`, carregado sob demanda. Só há um jogo; os
// comandos extras do terminal aparecem abaixo como "experiências".
export default function GameCenter() {
  const { lang, t } = useLanguage();
  const g = t.ws.games;
  const [playing, setPlaying] = useState<{ level: Level; run: number } | null>(null);
  // Relido ao começar e ao encerrar uma partida, que é quando o recorde pode mudar.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const best = useMemo(() => readBest(), [playing]);

  useDocumentMeta('jogos');

  return (
    <SiteShell routeId="jogos">
      <section className="sec games" aria-labelledby="games-title">
        <SectionTitle as="h1" id="games-title">
          {g.title}
        </SectionTitle>
        <p className="t-dim">{g.lead}</p>

        <Card as="article" className="game-card" aria-labelledby="game-mines">
          <h2 id="game-mines">{g.mines}</h2>
          <p>{g.minesText}</p>
          <ul className="game-levels">
            {LEVEL_IDS.map((level) => {
              const { rows, cols, mines } = LEVELS[level];
              const record = best[level];
              const active = playing?.level === level;

              return (
                <li key={level}>
                  <span className="game-level-name">{LEVEL_NAMES[level][lang]}</span>
                  <span className="t-dim">{g.size(rows, cols, mines)}</span>
                  <span className="t-dim">
                    {g.bestTime}: {record === undefined ? g.noBest : g.seconds(record)}
                  </span>
                  <button
                    type="button"
                    className="run-btn"
                    aria-label={`${g.play}: ${g.mines}, ${LEVEL_NAMES[level][lang]}`}
                    aria-pressed={active}
                    onClick={() => setPlaying({ level, run: (playing?.run ?? 0) + 1 })}
                  >
                    {active ? g.playing : g.play}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="t-dim">{g.bestNote}</p>

          {playing && (
            <div className="game-board term">
              <Suspense fallback={<p className="t-dim">…</p>}>
                <Minesweeper
                  key={playing.run}
                  lang={lang}
                  level={playing.level}
                  onExit={() => setPlaying(null)}
                />
              </Suspense>
              <button type="button" className="run-btn" onClick={() => setPlaying(null)}>
                ✕ {g.stop}
              </button>
            </div>
          )}

          <h3>{g.controls}</h3>
          <dl className="t-kv">
            {g.controlsList.map(([how, what]) => (
              <div key={how}>
                <dt>{how}</dt>
                <dd>{what}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <CommandCatalog only={['info', 'fun']} go title={g.experiences} lead={g.experiencesLead} />
      </section>
    </SiteShell>
  );
}
