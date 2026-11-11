// Comandos de personalidade: `fortune`, `cowsay`, `matrix` e `rm`. Todos
// inofensivos. Só `fortune` aparece na `ajuda`; os outros são para quem explora.
import { Suspense, lazy } from 'react';
import type { Lang, Localized } from '../../types';
import { fortunes } from '../../data/fortunes';
import { profile } from '../../data/profile';
import type { Command, CommandResult } from '../commands';
import { Cmd, TermLink } from '../outputs';
import { prefersReducedMotion } from '../../utils/env';
import { cowsay, matrixEnd, wrapText } from './ascii';
import BootSequence from './Boot';

const L = (pt: string, en: string): Localized => ({ pt, en });

const MatrixRain = lazy(() => import('./Matrix'));

export const fortune: Command = {
  names: ['fortune', 'fortune'],
  desc: L('uma frase aleatória', 'a random quote'),
  run: () => {
    // Sorteia uma vez, na hora de rodar: trocar de idioma redesenha a mesma frase.
    const pick = fortunes.length ? fortunes[Math.floor(Math.random() * fortunes.length)] : null;

    return {
      output: (lang) =>
        pick ? (
          <div>
            {wrapText(pick.text[lang], 72).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
            {pick.by && <p className="t-dim">— {pick.by}</p>}
          </div>
        ) : (
          <p className="t-dim">
            {lang === 'pt'
              ? 'sem frases ainda (em construção).'
              : 'no quotes yet (under construction).'}
          </p>
        ),
    };
  },
};

export const cow: Command = {
  names: ['cowsay', 'cowsay'],
  hidden: true,
  run: (args) => ({
    output: (lang) => (
      <pre className="t-ascii">{cowsay(args.join(' ') || (lang === 'pt' ? 'muuu!' : 'moo!'))}</pre>
    ),
  }),
};

export const matrix: Command = {
  names: ['matrix', 'matrix'],
  hidden: true,
  run: (_args, ctx) => ({
    // No replay (histórico restaurado) não anima de novo: só a linha final.
    output: (lang) =>
      ctx.replay ? (
        <p className="t-dim">{matrixEnd(lang)}</p>
      ) : (
        <Suspense fallback={<p className="t-dim">…</p>}>
          <MatrixRain lang={lang} />
        </Suspense>
      ),
  }),
};

// `boot`: repete a sequência da primeira visita, sob demanda. No replay e com
// movimento reduzido, mostra tudo de uma vez.
export const boot: Command = {
  names: ['boot', 'boot'],
  hidden: true,
  run: (_args, ctx) => ({
    output: (lang) => <BootSequence lang={lang} instant={ctx.replay || prefersReducedMotion()} />,
  }),
};

export const rm: Command = {
  names: ['rm', 'rm'],
  hidden: true,
  run: (args) => ({
    output: (lang) =>
      args.length ? (
        <p className="t-ok">
          {lang === 'pt'
            ? 'rm: nada foi apagado. É só um portfólio, mas o git lembra de tudo. 🙂'
            : "rm: nothing was deleted. It's just a portfolio, but git remembers everything. 🙂"}
        </p>
      ) : (
        <p className="t-err">{lang === 'pt' ? 'rm: faltou o operando' : 'rm: missing operand'}</p>
      ),
  }),
};

// `sudo contratar-duda` / `sudo hire-duda`: a resposta bem-humorada aponta o contato.
export const HIRE = ['contratar-duda', 'hire-duda'];

export function hireOutput(lang: Lang) {
  return (
    <div>
      <p className="t-ok">
        {lang === 'pt'
          ? '[sudo] permissão concedida. Boa escolha!'
          : '[sudo] permission granted. Great choice!'}
      </p>
      <p>
        {lang === 'pt' ? 'Vamos conversar: ' : "Let's talk: "}
        <a href={`mailto:${profile.email}`}>{profile.email}</a> <span className="t-dim">·</span>{' '}
        <TermLink to="/contato">/contato</TermLink>
      </p>
      <p className="t-dim">
        {lang === 'pt' ? 'Mais opções: ' : 'More options: '}
        <Cmd>{lang === 'pt' ? 'contato' : 'contact'}</Cmd>
      </p>
    </div>
  );
}

export const hireResult = (): CommandResult => ({ output: hireOutput });
