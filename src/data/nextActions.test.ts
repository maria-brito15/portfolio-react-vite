import { nextActions, nextFor } from './nextActions';
import { PERSONA_IDS } from './personas';
import { routeById } from './routes';

const rules = PERSONA_IDS.flatMap((persona) =>
  Object.entries(nextActions[persona]).map(([from, rule]) => ({ persona, from, rule })),
);

describe('próximos passos por persona', () => {
  it('toda persona tem regras', () => {
    for (const id of PERSONA_IDS)
      expect(Object.keys(nextActions[id]).length, id).toBeGreaterThan(2);
  });

  it.each(rules)(
    '$persona em $from: origem e destinos existem, sem laço e sem rascunho',
    ({ persona, from, rule }) => {
      const where = `${persona}/${from}`;

      expect(routeById(from), where).toBeDefined();

      for (const action of [rule.primary, rule.secondary].filter(Boolean)) {
        const route = routeById(action!.route);

        expect(route, where).toBeDefined();
        expect(route?.draft, where).toBeFalsy();
        expect(action!.label.pt.trim(), where).not.toBe('');
        expect(action!.label.en.trim(), where).not.toBe('');
        // Ir para a própria página só faz sentido com uma âncora.
        if (action!.route === from) expect(action!.anchor, where).toBeTruthy();
      }

      if (rule.secondary)
        expect(`${rule.secondary.route}#${rule.secondary.anchor}`, where).not.toBe(
          `${rule.primary.route}#${rule.primary.anchor}`,
        );
    },
  );

  it('as âncoras usadas são as que as trilhas já conferem nas páginas', () => {
    const known = new Set(['por-ano', 'cases', 'faq', 'contato']);

    for (const { rule } of rules)
      for (const a of [rule.primary, rule.secondary])
        if (a?.anchor) expect(known.has(a.anchor)).toBe(true);
  });

  it('sem persona ou sem regra: nada', () => {
    expect(nextFor(undefined, 'curriculo')).toBeUndefined();
    expect(nextFor('rh', 'terminal')).toBeUndefined();
    expect(nextFor('rh', undefined)).toBeUndefined();
  });
});
