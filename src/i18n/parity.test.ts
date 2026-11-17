import { diffKeys, parityLine } from '../../scripts/parity';
import { portfolio } from '../data/portfolio';
import { projects } from '../data/projects';
import { resume } from '../data/resume';
import { services } from '../data/services';
import { ui } from './ui';

// Lista fechada das árvores por idioma que ainda existem (design TD-004, L-010). Em conteúdo novo
// a paridade é estrutural (`LocalizedText` exige `pt` e `en`); a spec 003 esvazia esta lista.
const TREES: [file: string, pt: unknown, en: unknown][] = [
  ['src/i18n/ui.ts', ui.pt, ui.en],
  ['src/data/portfolio.tsx', portfolio.pt, portfolio.en],
  ['src/data/resume.ts', resume.pt, resume.en],
  ['src/data/services.tsx', services.pt, services.en],
  ...projects.map((p): [string, unknown, unknown] => [
    `src/data/projects.tsx › ${p.id}`,
    p.pt,
    p.en,
  ]),
];

describe('paridade PT/EN (FR-014)', () => {
  it.each(TREES)(
    '%s: toda chave existe nos dois idiomas, sem texto vazio nem tipo diferente',
    (file, pt, en) => {
      expect(diffKeys(pt, en).map((p) => parityLine(file, p))).toEqual([]);
    },
  );

  it('a lista cobre as árvores que existem: ui, portfolio, resume, services e cada projeto', () => {
    expect(TREES.map(([file]) => file)).toEqual(
      expect.arrayContaining([
        'src/i18n/ui.ts',
        'src/data/portfolio.tsx',
        'src/data/resume.ts',
        'src/data/services.tsx',
      ]),
    );
    expect(TREES.length).toBe(4 + projects.length);
    expect(projects.length).toBeGreaterThan(0);
  });

  it('remover uma tradução EN de uma chave real faz a paridade falhar com a linha do §6.3', () => {
    // Cópia rasa (o `ui` tem funções, que o `structuredClone` não copia): só o `nav` perde a chave.
    const nav = Object.fromEntries(Object.entries(ui.en.nav).filter(([key]) => key !== 'projects'));
    const broken = { ...ui.en, nav };

    expect(diffKeys(ui.pt, broken).map((p) => parityLine('src/i18n/ui.ts', p))).toEqual([
      'paridade: src/i18n/ui.ts › nav.projects — falta a tradução em "en"',
    ]);
  });
});
