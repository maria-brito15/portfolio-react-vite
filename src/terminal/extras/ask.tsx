// `pergunte` (ask): pergunta em linguagem natural sobre a Duda, respondida pelo
// assistente a partir do conteúdo do site (docs/specs/assistente-ia/).
//
// O comando é síncrono, como todos: quem chama a rede é o componente da saída
// (`AskAnswer`). No replay (histórico restaurado) nada é chamado: mostra a resposta
// guardada na memória da sessão ou avisa que não foi guardada, sem gastar cota (D8).
import { useEffect, useState } from 'react';
import type { Lang, Localized } from '../../types';
import type { PersonaId } from '../../data/personas';
import { routeById } from '../../data/routes';
import { useLanguage } from '../../i18n/LanguageContext';
import { ui } from '../../i18n/ui';
import {
  MAX_QUESTION,
  askAssistant,
  type AskFailure,
  type AskOutcome,
  type AskTurn,
} from '../../services/ask';
import type { Command } from '../commands';
import { Cmd, TermLink } from '../outputs';
import { RunCommand } from '../pageIndex';

const L = (pt: string, en: string): Localized => ({ pt, en });

export const MAX_PER_SESSION = 20;
const MAX_TURNS = 6;

// Estado da sessão (some ao fechar a aba): contagem, aviso já mostrado, respostas e
// conversa. Nada vai para o armazenamento do navegador.
let asked = 0;
let noticeShown = false;
let sequence = 0;
const answers = new Map<number, AskOutcome>();
let turns: AskTurn[] = [];

export function resetAskSession() {
  asked = 0;
  noticeShown = false;
  sequence = 0;
  answers.clear();
  turns = [];
}

type View = { kind: 'loading' } | { kind: 'stale' } | { kind: 'done'; outcome: AskOutcome };

interface AskAnswerProps {
  id: number;
  question: string;
  persona?: PersonaId;
  history: AskTurn[];
  notice: boolean;
  replay: boolean;
}

function ContactLink({ lang }: { lang: Lang }) {
  const contact = routeById('contato');

  return contact ? (
    <>
      {' '}
      <TermLink to={contact.path}>{ui[lang].ask.contact}</TermLink>
    </>
  ) : null;
}

function errorText(error: AskFailure, lang: Lang) {
  const e = ui[lang].ask.errors;

  switch (error) {
    case 'invalid':
      return e.invalid;
    case 'too-long':
      return e.tooLong(MAX_QUESTION);
    case 'region':
      return e.region;
    case 'rate':
      return e.rate;
    case 'quota':
      return e.quota;
    case 'offline':
      return e.offline;
    default:
      return e.down;
  }
}

function AskAnswer({ id, question, persona, history, notice, replay }: AskAnswerProps) {
  const { lang } = useLanguage();
  const t = ui[lang].ask;
  const [view, setView] = useState<View>(() => {
    const kept = answers.get(id);

    if (kept) return { kind: 'done', outcome: kept };

    return replay ? { kind: 'stale' } : { kind: 'loading' };
  });

  // A função é um sistema externo: chamar a rede é a reação a "esta saída apareceu".
  useEffect(() => {
    if (view.kind !== 'loading') return;

    const controller = new AbortController();

    askAssistant({ question, lang, persona, history, signal: controller.signal }).then(
      (outcome) => {
        // Saída que saiu da tela (outro comando) ou nova montagem: descarta sem gravar.
        if (controller.signal.aborted || (outcome.ok === false && outcome.error === 'aborted'))
          return;

        answers.set(id, outcome);
        if (outcome.ok) turns = [...turns, { q: question, a: outcome.answer }].slice(-MAX_TURNS);
        setView({ kind: 'done', outcome });
      },
    );

    return () => controller.abort();
    // Uma chamada por saída: mudar o idioma depois não refaz a pergunta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="t-ask" aria-busy={view.kind === 'loading' || undefined}>
      {notice && <p className="t-dim">{t.notice}</p>}

      {view.kind === 'loading' && <p className="t-dim">{t.thinking}</p>}
      {view.kind === 'stale' && <p className="t-dim">{t.stale}</p>}

      {view.kind === 'done' && view.outcome.ok && (
        <>
          {view.outcome.answer.split(/\n+/).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {view.outcome.sources.length > 0 && (
            <p className="t-dim">
              {t.sources}{' '}
              {view.outcome.sources.map((s) => (
                <span key={s.id}>
                  <TermLink to={s.path}>{s.label}</TermLink>{' '}
                </span>
              ))}
            </p>
          )}
        </>
      )}

      {view.kind === 'done' && !view.outcome.ok && (
        <p className="t-err">
          {errorText(view.outcome.error, lang)}
          {view.outcome.error !== 'invalid' &&
            view.outcome.error !== 'too-long' &&
            view.outcome.error !== 'offline' && <ContactLink lang={lang} />}
        </p>
      )}
    </div>
  );
}

function Usage({ lang }: { lang: Lang }) {
  const t = ui[lang].ask;
  const name = lang === 'pt' ? 'pergunte' : 'ask';

  return (
    <div>
      <p>
        <Cmd>{name} "…"</Cmd> <span className="t-dim">{t.usage}</span>
      </p>
      <p className="t-dim">
        {t.tryAsking}{' '}
        {t.examples.map((example) => (
          <span key={example}>
            <RunCommand command={`${name} "${example}"`}>{example}</RunCommand>{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

export const pergunte: Command = {
  names: ['pergunte', 'ask'],
  aliases: ['perguntar'],
  usage: L('<pergunta>', '<question>'),
  desc: L(
    'pergunte sobre a Duda; responde só com o conteúdo do site',
    'ask about Duda; answers only from the site content',
  ),
  run: (args, ctx) => {
    const question = args.join(' ').trim();

    if (!question) return { output: (lang) => <Usage lang={lang} /> };

    if (question.length > MAX_QUESTION)
      return {
        output: (lang) => <p className="t-err">{ui[lang].ask.errors.tooLong(MAX_QUESTION)}</p>,
      };

    // Replay: sem efeito nenhum (nem contagem, nem rede).
    if (ctx.replay) {
      const id = sequence;

      return {
        output: () => (
          <AskAnswer key={id} id={id} question={question} history={[]} notice={false} replay />
        ),
      };
    }

    if (asked >= MAX_PER_SESSION)
      return {
        output: (lang) => (
          <p className="t-err">
            {ui[lang].ask.errors.session(MAX_PER_SESSION)}
            <ContactLink lang={lang} />
          </p>
        ),
      };

    asked += 1;
    sequence += 1;

    const id = sequence;
    const notice = !noticeShown;

    noticeShown = true;

    const history = turns;
    const persona = ctx.persona?.id;

    return {
      output: () => (
        <AskAnswer
          key={id}
          id={id}
          question={question}
          persona={persona}
          history={history}
          notice={notice}
          replay={false}
        />
      ),
    };
  },
};
