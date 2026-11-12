import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { routeById } from '../../data/routes';
import { LEVEL_NAMES, type Level } from '../../terminal/games/mines';
import { readBest } from '../../terminal/games/bestTimes';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import RunButton from '../RunButton';

// Os dois jeitos interativos de explorar o site: o Game Center e o terminal.
// Os recordes mostrados são os que o jogo já grava neste navegador.
export default function InteractivePanel() {
  const { lang, t } = useLanguage();
  const h = t.ws.home;
  const best = readBest();
  const records = (Object.keys(best) as Level[]).map(
    (level) => `${LEVEL_NAMES[level][lang]} ${best[level]} s`,
  );
  const tryCommands = lang === 'pt' ? ['ajuda', 'stats', 'neofetch'] : ['help', 'stats', 'neofetch'];

  return (
    <section className="dash-section" aria-labelledby="interactive-title">
      <SectionTitle as="h2" id="interactive-title" size="md">
        {h.interactive}
      </SectionTitle>
      <p className="t-dim">{h.interactiveLead}</p>
      <div className="interactive-grid">
        <Card as="article">
          <h3>{t.ws.games.mines}</h3>
          <p>{h.gameText}</p>
          {records.length > 0 && (
            <p className="t-dim">
              {h.gameBest}: {records.join(' · ')}
            </p>
          )}
          <Link to={routeById('jogos')?.path ?? '/jogos'}>{h.gamePlay}</Link>
        </Card>
        <Card as="article">
          <h3>{routeById('terminal')?.label[lang]}</h3>
          <p>{h.terminalText}</p>
          <p className="t-dim">
            {h.terminalTry}:{' '}
            {tryCommands.map((command) => (
              <RunButton key={command} command={command} go />
            ))}
          </p>
          <Link to={routeById('terminal')?.path ?? '/terminal'}>{h.terminalOpen}</Link>
        </Card>
      </div>
    </section>
  );
}
