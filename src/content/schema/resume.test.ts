import { formatPath } from './errors';
import { ResumeSchema } from './index';

const loc = (pt: string, en = pt) => ({ pt, en });

// Currículo de EXEMPLO para teste (não é conteúdo real).
const resume = (over: Record<string, unknown> = {}) => ({
  name: 'Nome Exemplo',
  headline: loc('Título'),
  location: loc('Cidade'),
  languages: loc('Português'),
  summary: [loc('Primeiro parágrafo'), loc('Segundo parágrafo')],
  skillAreas: [{ label: loc('Área'), text: loc('Texto') }],
  featuredProjects: [{ project: 'exemplo', subtitle: loc('Sub'), points: [loc('Ponto')] }],
  ...over,
});

function problems(value: unknown): string[] {
  const result = ResumeSchema.safeParse(value);

  return result.success
    ? []
    : result.error.issues.map((i) => `${formatPath(i.path)}: ${i.message}`);
}

describe('ResumeSchema', () => {
  it('currículo completo passa, com prêmio opcional', () => {
    const full = resume({
      featuredProjects: [
        { project: 'exemplo', subtitle: loc('Sub'), award: loc('Prêmio'), points: [loc('Ponto')] },
      ],
    });

    expect(problems(full)).toEqual([]);
  });

  it('projeto em destaque sem `project` falha', () => {
    const bad = resume({ featuredProjects: [{ subtitle: loc('Sub'), points: [loc('Ponto')] }] });

    expect(problems(bad)).toContain('featuredProjects[0].project: identificador ausente');
  });

  it('points vazio falha', () => {
    const bad = resume({
      featuredProjects: [{ project: 'exemplo', subtitle: loc('S'), points: [] }],
    });

    expect(problems(bad).join('\n')).toContain('featuredProjects[0].points');
  });

  it('texto de interface (print) é recusado como campo desconhecido', () => {
    expect(problems(resume({ print: 'Imprimir' })).join('\n')).toContain('print');
  });

  it('nome e links do projeto não têm lugar no currículo (campo desconhecido)', () => {
    const bad = resume({
      featuredProjects: [
        {
          project: 'exemplo',
          subtitle: loc('S'),
          points: [loc('P')],
          name: 'copiado',
          github: 'https://x',
        },
      ],
    });

    expect(problems(bad).join('\n')).toMatch(/name|github/);
  });

  it('EN ausente em um parágrafo do resumo falha nomeando o índice', () => {
    const bad = resume({ summary: [loc('ok'), { pt: 'só PT' }] });

    expect(problems(bad)).toContain('summary[1].en: texto ausente');
  });

  it('resumo vazio falha', () => {
    expect(problems(resume({ summary: [] })).join('\n')).toContain('summary');
  });
});
