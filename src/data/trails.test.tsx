import { renderApp } from '../test/helpers';
import { findCommand } from '../terminal/commands';
import { PERSONA_IDS } from './personas';
import { routeById } from './routes';
import { dataNumbers, secrets, stepsOf, trailFor, trails, type Trail } from './trails';

const LANGS = ['pt', 'en'] as const;
const first = (command: string) => command.split(/\s+/)[0];

describe('trilhas como dado (TR-01, TR-02)', () => {
  it('há uma trilha por persona, e só uma', () => {
    expect(trails.map((t) => t.persona).sort()).toEqual([...PERSONA_IDS].sort());
    expect(trailFor('tech')?.persona).toBe('tech');
    expect(trailFor(undefined)).toBeUndefined();
  });

  it('de 4 a 6 passos, com ou sem o assistente, e o último é uma ação', () => {
    for (const trail of trails)
      for (const assistant of [false, true]) {
        const steps = stepsOf(trail, assistant);

        expect(steps.length, `${trail.persona}/${assistant}`).toBeGreaterThanOrEqual(4);
        expect(steps.length, `${trail.persona}/${assistant}`).toBeLessThanOrEqual(6);
        expect(steps.at(-1)?.kind, trail.persona).toBe('agir');
      }
  });

  it('o passo do assistente só entra quando ele está publicado (TR-05)', () => {
    const tech = trailFor('tech') as Trail;

    expect(stepsOf(tech, false).some((s) => s.command === 'pergunte')).toBe(false);
    expect(stepsOf(tech, true).some((s) => s.command === 'pergunte')).toBe(true);
    expect(stepsOf(tech, true).length - stepsOf(tech, false).length).toBe(1);
  });

  it('ids de passo únicos por trilha; rotas, comandos e ações existem', () => {
    for (const trail of trails) {
      const ids = trail.steps.map((s) => s.id);

      expect(new Set(ids).size, trail.persona).toBe(ids.length);

      for (const step of trail.steps) {
        const where = `${trail.persona}/${step.id}`;

        expect(routeById(step.route), where).toBeDefined();
        if (step.kind === 'fazer') {
          expect(step.command, where).toBeTruthy();
          expect(findCommand(first(step.command as string)), where).toBeDefined();
        }
        if (step.kind === 'agir') expect(step.action, where).toBeDefined();
        if (step.action?.kind === 'link') expect(routeById(step.action.route), where).toBeDefined();
      }
    }
  });

  it('textos completos em PT e EN', () => {
    for (const trail of trails) {
      for (const text of [trail.title, trail.intro])
        for (const lang of LANGS) expect(text[lang].trim()).not.toBe('');

      for (const lang of LANGS) {
        expect(trail.outro(lang, 3, 8).trim(), `${trail.persona}/outro`).not.toBe('');
        for (const step of trail.steps)
          expect(step.text(lang).trim(), `${trail.persona}/${step.id}/${lang}`).not.toBe('');
      }
    }
  });
});

describe('nada inventado (TR-03)', () => {
  it('todo número que aparece num texto sai dos dados do site', () => {
    const allowed = new Set(dataNumbers.map(String));

    for (const trail of trails)
      for (const lang of LANGS)
        for (const text of [...trail.steps.map((s) => s.text(lang)), trail.intro[lang]])
          for (const number of text.match(/\d+/g) ?? [])
            expect(
              allowed.has(number),
              `${trail.persona}/${lang}: "${text}" tem o número ${number}`,
            ).toBe(true);
  });

  it('os números calculados aparecem nos textos que os usam', () => {
    const rh = (trailFor('rh') as Trail).steps.find(
      (s) => s.id === 'experiencias',
    ) as Trail['steps'][number];
    const tech = (trailFor('tech') as Trail).steps[0];

    expect(rh.text('pt')).toMatch(/\d+ atividades desde \d{4}/);
    expect(tech.text('pt')).toMatch(/\d+ projetos, \d+ finalistas/);
  });

  it('o contador de segredos do amigo é calculado, não digitado', () => {
    expect((trailFor('amigo') as Trail).outro('pt', 3, secrets.length)).toContain(
      `3 de ${secrets.length}`,
    );
  });
});

describe('gamificação graduada (TR-19)', () => {
  it('cada persona tem o estilo combinado', () => {
    const style = Object.fromEntries(trails.map((t) => [t.persona, t.style]));

    expect(style).toEqual({
      rh: 'checklist',
      tech: 'checklist',
      professor: 'bar',
      cliente: 'bar',
      amigo: 'achievements',
    });
  });
});

describe('segredos do amigo (TR-20)', () => {
  it('são 8, únicos, e todo comando citado existe', () => {
    expect(secrets).toHaveLength(8);
    expect(new Set(secrets.map((s) => s.id)).size).toBe(8);

    for (const secret of secrets) {
      for (const lang of LANGS) expect(secret.label[lang].trim()).not.toBe('');
      if (secret.trigger.kind === 'command')
        expect(findCommand(secret.trigger.name), secret.id).toBeDefined();
    }
  });
});

describe('alvos nas páginas (TR-13)', () => {
  const targets = trails.flatMap((trail) =>
    trail.steps.flatMap((step) => [
      ...(step.anchor
        ? [{ where: `${trail.persona}/${step.id}`, route: step.route, anchor: step.anchor }]
        : []),
      ...(step.action?.kind === 'link' && step.action.anchor
        ? [
            {
              where: `${trail.persona}/${step.id} (ação)`,
              route: step.action.route,
              anchor: step.action.anchor,
            },
          ]
        : []),
    ]),
  );

  it('toda âncora citada existe na página renderizada', () => {
    expect(targets.length).toBeGreaterThan(10);

    for (const { where, route, anchor } of targets) {
      const { unmount } = renderApp(routeById(route)?.path);

      expect(document.getElementById(anchor), `${where}: #${anchor} em ${route}`).not.toBeNull();
      unmount();
    }
  });

  it('passos sem âncora têm um h1 na página (o destaque cai nele)', () => {
    for (const trail of trails)
      for (const step of trail.steps.filter((s) => !s.anchor && s.kind === 'ver')) {
        const { unmount } = renderApp(routeById(step.route)?.path);

        expect(document.querySelector('h1'), `${trail.persona}/${step.id}`).not.toBeNull();
        unmount();
      }
  });
});
