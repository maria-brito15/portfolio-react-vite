import { projects, sortProjectsChronologically } from './projects';
import { experienceGroups } from './experiences';

describe('dados dos projetos', () => {
  it('ordena do mais antigo ao mais recente: Planoriza, EcoShop, depois os de 2026', () => {
    const ids = sortProjectsChronologically(projects).map((p) => p.id);
    expect(ids.slice(0, 2)).toEqual(['planoriza', 'ecoshop']);
    expect([...ids.slice(2)].sort()).toEqual(
      ['file-name-standardizer', 'shorturl', 'whatsapp-dispatcher'].sort(),
    );
  });
  it('usa só as datas confirmadas e não inventa meses', () => {
    const date = Object.fromEntries(projects.map((p) => [p.id, p.date]));
    expect(date.planoriza).toEqual({ year: 2025, month: 1 });
    expect(date.ecoshop).toEqual({ year: 2025, month: 2 });
    for (const id of ['shorturl', 'file-name-standardizer', 'whatsapp-dispatcher']) {
      expect(date[id], id).toEqual({ year: 2026 });
    }
  });
  it('EcoShop é um único projeto com v1 (02/2025) e v2 (01/2026), sem marcação de status', () => {
    const eco = projects.filter((p) => p.id === 'ecoshop');
    expect(eco).toHaveLength(1);
    for (const lang of ['pt', 'en']) {
      const versions = eco[0][lang].versions;
      expect(versions.map((v) => [v.label, v.date])).toEqual([
        ['v1', { year: 2025, month: 2 }],
        ['v2', { year: 2026, month: 1 }],
      ]);
      expect(versions.some((v) => 'current' in v)).toBe(false);
    }
  });
  it('não perde nem duplica projetos', () => {
    const ids = sortProjectsChronologically(projects).map((p) => p.id);
    expect(ids).toHaveLength(5);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('todo projeto tem texto nos dois idiomas, tecnologias e galeria como lista', () => {
    for (const p of projects) {
      expect(p.pt.description, p.id).toBeTruthy();
      expect(p.en.description, p.id).toBeTruthy();
      expect(p.tech.length, p.id).toBeGreaterThan(0);
      expect(Array.isArray(p.gallery), p.id).toBe(true);
    }
  });
  it('só repositórios confirmados: Planoriza e WhatsApp Dispatcher não têm link', () => {
    const repo = Object.fromEntries(projects.map((p) => [p.id, p.repo]));
    expect(repo.planoriza).toBeNull();
    expect(repo['whatsapp-dispatcher']).toBeNull();
    expect(repo.ecoshop).toBe('https://github.com/maria-brito15/ecoshop-nextjs');
    expect(repo.shorturl).toBe('https://github.com/maria-brito15/shorturl-express');
    expect(repo['file-name-standardizer']).toBe(
      'https://github.com/maria-brito15/file-name-standardizer',
    );
  });
});

describe('experiência WebTech', () => {
  const webtech = experienceGroups.flatMap((g) => g.items).find((i) => i.id === 'webtech');
  it('indica início no 2º semestre de 2026, em andamento, nos dois idiomas', () => {
    expect(webtech.period.pt).toMatch(/2º semestre de 2026.*em andamento/);
    expect(webtech.period.en).toMatch(/2nd half of 2026.*ongoing/);
  });
  it('cita workshop e laboratório de SDD e não cria cargo formal', () => {
    expect(webtech.description.pt).toMatch(/workshop.*laboratório.*Spec-Driven Development/);
    expect(webtech.description.en).toMatch(/workshop and lab/);
    expect(webtech.description.pt).toMatch(/futura aplicação de monitorias/);
    expect(webtech.role.pt).toBe('Projeto de Extensão');
  });
});
