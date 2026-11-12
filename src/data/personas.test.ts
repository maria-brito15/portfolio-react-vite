import { PERSONA_IDS, byPersona, findPersona, isPick, personaById, personas } from './personas';
import { routeById } from './routes';
import { findCommand } from '../terminal/commands';

describe('personas (PR-01, PR-12, PR-13)', () => {
  it('são as cinco da v1', () => {
    expect(PERSONA_IDS).toEqual(['rh', 'tech', 'professor', 'amigo', 'cliente']);
  });

  it('todo id de rota e todo comando citados existem', () => {
    for (const p of personas) {
      for (const id of [...p.order, p.cta.route])
        expect(routeById(id), `${p.id}: ${id}`).toBeDefined();

      for (const cmd of p.commands) expect(findCommand(cmd), `${p.id}: ${cmd}`).toBeDefined();
      expect(p.order).toContain(p.cta.route);
    }
  });

  it('textos de interface completos em PT e EN', () => {
    for (const p of personas) {
      for (const text of [p.label, p.desc, p.cta.label]) {
        expect(text.pt.trim()).not.toBe('');
        expect(text.en.trim()).not.toBe('');
      }
      expect(p.askHint.trim()).not.toBe('');
    }
  });

  it('aliases, ids e números não colidem', () => {
    const keys = personas.flatMap((p) => [p.id, ...p.aliases]).map((k) => k.toLowerCase());

    expect(new Set(keys).size).toBe(keys.length);
  });

  it('findPersona aceita número, id e apelido, sem acento nem caixa', () => {
    expect(findPersona('1')?.id).toBe('rh');
    expect(findPersona('5')?.id).toBe('cliente');
    expect(findPersona('6')).toBeUndefined();
    expect(findPersona('TECH')?.id).toBe('tech');
    expect(findPersona('Recrutadora')?.id).toBe('rh');
    expect(findPersona('tech-recruiter')?.id).toBe('tech');
    expect(findPersona('')).toBeUndefined();
    expect(findPersona('xyz')).toBeUndefined();
    expect(personaById('nada')).toBeUndefined();
  });

  it('byPersona põe os itens da persona primeiro e não perde nenhum', () => {
    const items = ['sobre', 'projetos', 'contato', 'github', 'jogos'];
    const out = byPersona(items, personaById('tech'), (x) => x);

    expect(out.slice(0, 2)).toEqual(['projetos', 'github']);
    expect([...out].sort()).toEqual([...items].sort());
    expect(byPersona(items, undefined, (x) => x)).toBe(items);
  });

  it('isPick marca só os itens da persona', () => {
    expect(isPick(personaById('rh'), 'curriculo')).toBe(true);
    expect(isPick(personaById('rh'), 'jogos')).toBe(false);
    expect(isPick(undefined, 'curriculo')).toBe(false);
  });
});
