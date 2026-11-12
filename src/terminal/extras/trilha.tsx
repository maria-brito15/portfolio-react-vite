// `trilha` (trail): a trilha guiada da persona no terminal (docs/specs/trilhas/).
// Sem argumento mostra a trilha, o progresso e o passo atual; `iniciar`, `continuar`,
// `reiniciar` e `sair` controlam o tour. Também traz de volta o cartão dispensado
// ("Agora não", TR-08). Os efeitos só rodam fora do replay, como nos outros comandos.
import type { Lang, Localized } from '../../types';
import { ui } from '../../i18n/ui';
import { fold } from '../../data/routes';
import type { Command, CommandContext } from '../commands';
import { Cmd } from '../outputs';
import { RunCommand } from '../pageIndex';

const L = (pt: string, en: string): Localized => ({ pt, en });

type Action = 'start' | 'restart' | 'exit';

const WORDS: Record<string, Action> = {
  iniciar: 'start',
  start: 'start',
  comecar: 'start',
  continuar: 'start',
  continue: 'start',
  resume: 'start',
  reiniciar: 'restart',
  restart: 'restart',
  refazer: 'restart',
  sair: 'exit',
  exit: 'exit',
};

// `código` entre crases vira <Cmd>.
const withCmd = (text: string) =>
  text.split('`').map((part, i) => (i % 2 ? <Cmd key={i}>{part}</Cmd> : part));

function Status({ ctx, lang }: { ctx: CommandContext; lang: Lang }) {
  const t = ui[lang].trail;
  const c = t.cmd;
  const { trail, steps, step, index, progress, doneCount } = ctx.trail ?? {};
  const name = lang === 'pt' ? 'trilha' : 'trail';

  if (!trail || !steps || !step) return <p>{withCmd(c.noPersona)}</p>;

  const started = doneCount || progress?.step || progress?.finished;

  return (
    <div>
      <p>
        <strong>{trail.title[lang]}</strong> <span className="t-dim">{t.steps(steps.length)}</span>
        {progress?.finished && <span className="t-dim"> · {t.completed}</span>}
      </p>
      <p className="t-dim">{trail.intro[lang]}</p>
      {started && !progress?.finished && (
        <>
          <p className="t-dim">{t.seen(doneCount ?? 0, steps.length)}</p>
          <p>
            {c.current} {t.counter((index ?? 0) + 1, steps.length)}: {withCmd(step.text(lang))}
          </p>
        </>
      )}
      <p>
        <RunCommand command={`${name} ${lang === 'pt' ? 'iniciar' : 'start'}`}>
          {progress?.finished
            ? t.restart
            : started
              ? t.resume(doneCount ?? 0, steps.length)
              : t.start}
        </RunCommand>{' '}
        {started && (
          <RunCommand command={`${name} ${lang === 'pt' ? 'reiniciar' : 'restart'}`}>
            {t.restart}
          </RunCommand>
        )}
      </p>
      <p className="t-dim">{c.usage}</p>
    </div>
  );
}

export const trilha: Command = {
  names: ['trilha', 'trail'],
  usage: L('[iniciar|continuar|reiniciar|sair]', '[start|resume|restart|exit]'),
  desc: L(
    'a trilha guiada da sua persona: um percurso curto pelo site',
    'the guided trail for your persona: a short walk through the site',
  ),
  run: (args, ctx) => {
    const word = fold(args[0] ?? '');
    const action = WORDS[word];
    const trail = ctx.trail;

    // Palavra desconhecida: mostra o estado e a ajuda de uso, sem mudar nada.
    if (!action) return { output: (lang) => <Status ctx={ctx} lang={lang} /> };

    if (!trail?.trail) return { output: (lang) => <p>{withCmd(ui[lang].trail.cmd.noPersona)}</p> };

    if (action === 'exit') {
      const wasOpen = trail.active;

      if (!ctx.replay) trail.exit();

      return {
        output: (lang) => (
          <p className="t-dim">{wasOpen ? ui[lang].trail.cmd.closed : ui[lang].trail.cmd.none}</p>
        ),
      };
    }

    // `iniciar`/`continuar` retomam de onde parou; `reiniciar` zera.
    if (!ctx.replay) {
      if (action === 'restart') trail.restart();
      else {
        trail.undismiss();
        trail.start();
      }
    }

    const title = trail.trail.title;
    const total = trail.steps.length;
    const at = action === 'restart' || trail.progress.finished ? 0 : trail.index;

    return {
      output: (lang) => (
        <p>
          {ui[lang].trail.cmd.opened} <strong>{title[lang]}</strong>{' '}
          <span className="t-dim">· {ui[lang].trail.counter(at + 1, total)}</span>
        </p>
      ),
    };
  },
};
