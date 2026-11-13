import {
  MAX_HIGHLIGHTS,
  PERSPECTIVE_LABEL,
  perspectiveFor,
  projectPerspectives,
} from './projectPerspectives';
import { PERSONA_IDS } from './personas';
import { projects } from './projects';

// Projetos que devem ter as cinco perspectivas (os de maior destaque).
const PRIORITY = ['ecoshop', 'whatsapp-dispatcher', 'planoriza', 'portfolio'];

describe('perspectivas dos projetos', () => {
  it('só citam projetos e personas que existem', () => {
    for (const [id, set] of Object.entries(projectPerspectives)) {
      expect(
        projects.some((p) => p.id === id),
        id,
      ).toBe(true);
      for (const persona of Object.keys(set))
        expect(PERSONA_IDS, `${id}: ${persona}`).toContain(persona);
    }
  });

  it('os projetos de maior destaque têm as cinco perspectivas', () => {
    for (const id of PRIORITY)
      for (const persona of PERSONA_IDS)
        expect(perspectiveFor(id, persona), `${id}/${persona}`).toBeDefined();
  });

  it('PT e EN completos, destaques curtos e em número limitado', () => {
    for (const [id, set] of Object.entries(projectPerspectives))
      for (const [persona, lens] of Object.entries(set)) {
        const where = `${id}/${persona}`;
        const texts = [lens.summary, ...lens.highlights];

        expect(lens.highlights.length, where).toBeGreaterThan(0);
        expect(lens.highlights.length, where).toBeLessThanOrEqual(MAX_HIGHLIGHTS);

        for (const text of texts) {
          expect(text.pt.trim(), where).not.toBe('');
          expect(text.en.trim(), where).not.toBe('');
          expect(text.pt.length, where).toBeLessThan(200);
        }
      }

    for (const persona of PERSONA_IDS) {
      expect(PERSPECTIVE_LABEL[persona].pt).not.toBe('');
      expect(PERSPECTIVE_LABEL[persona].en).not.toBe('');
    }
  });

  it('a ação em destaque só aponta para um link que o projeto tem', () => {
    for (const [id, set] of Object.entries(projectPerspectives))
      for (const [persona, lens] of Object.entries(set)) {
        const project = projects.find((p) => p.id === id)!;

        if (lens.action === 'caseStudy') expect(project.caseStudy, `${id}/${persona}`).toBeTruthy();
        if (lens.action === 'repo') expect(project.repo, `${id}/${persona}`).toBeTruthy();
      }
  });

  it('sem persona ou sem perspectiva: nada (vale a apresentação padrão)', () => {
    expect(perspectiveFor('ecoshop', undefined)).toBeUndefined();
    expect(perspectiveFor('shorturl', 'tech')).toBeUndefined();
    expect(perspectiveFor('nao-existe', 'rh')).toBeUndefined();
  });

  it('as perspectivas diferem entre as personas', () => {
    for (const id of PRIORITY) {
      const summaries = PERSONA_IDS.map((p) => perspectiveFor(id, p)!.summary.pt);

      expect(new Set(summaries).size, id).toBe(PERSONA_IDS.length);
    }
  });
});
