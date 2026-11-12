// `visitante` (visitor): quem está visitando. Escolher uma persona aplica a lente
// do site (ordem, destaque, sugestões); nada de conteúdo muda. A pergunta da
// primeira visita usa as mesmas peças: com ela pendente, `1`–`5` ou o nome da
// persona respondem (ver `personaAnswer`, usada por `runCommand`).
import type { Lang, Localized } from '../../types';
import { findPersona, personas, type Persona } from '../../data/personas';
import { ui } from '../../i18n/ui';
import { findCommand, type Command, type CommandContext, type CommandResult } from '../commands';
import { Cmd } from '../outputs';
import { RunCommand } from '../pageIndex';

const L = (pt: string, en: string): Localized => ({ pt, en });

// Nome do comando no idioma atual (`curriculo` → `resume`).
const commandName = (id: string, lang: Lang) => findCommand(id)?.names[lang === 'pt' ? 0 : 1] ?? id;

// As cinco opções, numeradas, cada uma clicável (essencial no celular).
export function PersonaOptions({ lang, current }: { lang: Lang; current?: Persona }) {
  const name = lang === 'pt' ? 'visitante' : 'visitor';

  return (
    <div className="t-persona">
      {personas.map((p, i) => (
        <p key={p.id}>
          <RunCommand command={`${name} ${p.id}`}>
            {i + 1}) {p.label[lang]}
          </RunCommand>{' '}
          <span className="t-dim">
            — {p.desc[lang]}
            {p.id === current?.id ? ' ✓' : ''}
          </span>
        </p>
      ))}
    </div>
  );
}

// Pergunta da primeira visita no terminal (some ao responder ou pular).
export function PersonaQuestion({ lang }: { lang: Lang }) {
  const t = ui[lang].persona;

  return (
    <section className="t-persona-ask" aria-label={t.group}>
      <p>{t.question}</p>
      <PersonaOptions lang={lang} />
      <p className="t-dim">{t.hint}</p>
    </section>
  );
}

function Picked({ persona, lang }: { persona: Persona; lang: Lang }) {
  const t = ui[lang].persona;

  return (
    <div>
      <p>{t.picked(persona.label[lang])}</p>
      <p className="t-dim">
        {t.tryThese}{' '}
        {persona.commands.map((id) => (
          <span key={id}>
            <RunCommand command={id}>{commandName(id, lang)}</RunCommand>{' '}
          </span>
        ))}
      </p>
    </div>
  );
}

// Escolhe a persona (o efeito só roda fora do replay, como os outros comandos).
export function personaPick(persona: Persona, ctx: CommandContext): CommandResult {
  if (!ctx.replay) ctx.choosePersona?.(persona.id);

  return { output: (lang) => <Picked persona={persona} lang={lang} /> };
}

// `1`–`5` ou o nome de uma persona, dito sozinho. Vale enquanto a pergunta está
// pendente; no replay, quando é a persona hoje salva (a escolha que gerou a linha).
export function personaAnswer(name: string, ctx: CommandContext): CommandResult | undefined {
  const persona = findPersona(name);

  if (!persona || ctx.context) return undefined;
  if (ctx.personaPending || (ctx.replay && ctx.persona?.id === persona.id))
    return personaPick(persona, ctx);

  return undefined;
}

const CLEAR_WORDS = ['limpar', 'clear', 'nenhum', 'nenhuma', 'none', 'padrao', 'default'];

export const visitante: Command = {
  names: ['visitante', 'visitor'],
  aliases: ['persona'],
  usage: L('[opção|limpar]', '[option|clear]'),
  desc: L(
    'quem está visitando: ajusta o destaque do site',
    'who is visiting: tunes the site focus',
  ),
  run: (args, ctx) => {
    const arg = args.join(' ').trim();

    if (!arg) {
      return {
        output: (lang) => {
          const t = ui[lang].persona;

          return (
            <div>
              <p>{ctx.persona ? t.current(ctx.persona.label[lang]) : t.none}</p>
              <p className="t-dim">{t.options}</p>
              <PersonaOptions lang={lang} current={ctx.persona} />
              <p className="t-dim">{t.usage}</p>
            </div>
          );
        },
      };
    }

    if (CLEAR_WORDS.includes(arg.toLowerCase())) {
      if (!ctx.replay) ctx.clearPersona?.();

      return { output: (lang) => <p>{ui[lang].persona.cleared}</p> };
    }

    const persona = findPersona(arg);

    if (persona) return personaPick(persona, ctx);

    return {
      output: (lang) => (
        <div>
          <p className="t-err">{ui[lang].persona.notFound(arg)}</p>
          <PersonaOptions lang={lang} current={ctx.persona} />
          <p className="t-dim">
            <Cmd>{lang === 'pt' ? 'visitante' : 'visitor'}</Cmd> {ui[lang].persona.usage}
          </p>
        </div>
      ),
    };
  },
};
