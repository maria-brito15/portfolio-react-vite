import { DEFAULT_HOME, homeFor, personaHome, primaryAction } from './personaHome';
import { PERSONA_IDS } from './personas';
import { projects } from './projects';
import { routeById } from './routes';

const homes = [
  ['padrão', DEFAULT_HOME] as const,
  ...PERSONA_IDS.map((id) => [id, personaHome[id]] as const),
];

describe('composição da home por persona', () => {
  it('toda persona tem composição', () => {
    for (const id of PERSONA_IDS) expect(personaHome[id], id).toBeDefined();
    expect(homeFor(undefined)).toBe(DEFAULT_HOME);
  });

  it.each(homes)('%s: rotas e projetos citados existem', (_name, home) => {
    for (const a of [home.primary, ...home.secondary].filter(Boolean))
      expect(routeById(a!.route), a!.route).toBeDefined();

    for (const b of home.blocks)
      for (const id of b.projects ?? [])
        expect(
          projects.some((p) => p.id === id),
          id,
        ).toBe(true);
  });

  it.each(homes)(
    '%s: textos em PT e EN, blocos sem repetição e atalhos presentes',
    (_name, home) => {
      const texts = [
        home.intro,
        home.primary?.label,
        ...home.secondary.map((a) => a.label),
        ...home.blocks.flatMap((b) => [b.title, b.lead]),
      ].filter(Boolean);

      for (const text of texts) {
        expect(text!.pt.trim()).not.toBe('');
        expect(text!.en.trim()).not.toBe('');
      }

      const ids = home.blocks.map((b) => b.id);

      expect(new Set(ids).size).toBe(ids.length);
      // Nada some: o que sai da composição continua nos atalhos.
      expect(ids).toContain('quick');
    },
  );

  it('a primeira seção de cada persona é diferente', () => {
    const firsts = PERSONA_IDS.map(
      (id) => personaHome[id].blocks[0].id + personaHome[id].blocks[0].projects?.[0],
    );

    expect(new Set(firsts).size).toBe(PERSONA_IDS.length);
  });

  it('ação principal: a da composição ou o chamado da persona', () => {
    expect(primaryAction('rh').route).toBe('curriculo');
    expect(primaryAction('cliente')).toMatchObject({ route: 'servicos', anchor: 'contato' });
    expect(primaryAction(undefined).route).toBe('projetos');
  });
});
