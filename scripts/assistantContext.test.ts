import { createElement } from 'react';
import {
  MAX_CHARS_PER_LANG,
  assertContextFits,
  buildContext,
  contextSize,
  lines,
  toText,
} from './assistantContext';
import { academics } from '../src/data/academics';
import { experienceGroups } from '../src/data/experiences';
import { projects } from '../src/data/projects';
import { routeById } from '../src/data/routes';
import { profile } from '../src/data/profile';
import { resume } from '../src/data/resume';
import { services } from '../src/data/services';
import type { Lang } from '../src/types';

const LANGS: Lang[] = ['pt', 'en'];
const context = buildContext();
const section = (id: string) => context.sections.find((s) => s.id === id)!;

describe('toText e lines (JSX e dados viram texto)', () => {
  it('tira tags, junta <br> com espaço e decodifica entidades', () => {
    const node = createElement(
      'p',
      null,
      'Sistemas',
      createElement('br'),
      'e ',
      createElement('em', null, 'arquitetura'),
      ' & “IA”',
    );

    expect(toText(node)).toBe('Sistemas e arquitetura & “IA”');
  });

  it('escolhe o idioma, ignora funções, vazios e booleanos', () => {
    const data = {
      title: { pt: 'Olá', en: 'Hello' },
      fn: () => 'ui',
      nothing: null,
      flag: true,
      list: [
        { pt: 'um', en: 'one' },
        { pt: 'dois', en: 'two' },
      ],
      pair: ['Rótulo', 'texto'],
    };

    expect(lines(data, 'pt')).toEqual([
      'title: Olá',
      'list:',
      '  um',
      '  dois',
      'pair: Rótulo: texto',
    ]);
    expect(lines(data, 'en').join('|')).toContain('title: Hello');
  });
});

describe('contexto do assistente (IA-08)', () => {
  it('toda seção aponta para uma página real e tem texto nos dois idiomas', () => {
    expect(context.sections.length).toBeGreaterThan(8);

    for (const s of context.sections) {
      expect(s.path.startsWith('/'), s.id).toBe(true);
      for (const lang of LANGS) expect(s.text[lang].length, `${s.id}/${lang}`).toBeGreaterThan(20);
    }

    for (const s of context.sections.filter((s) => !s.id.startsWith('projeto-')))
      expect(routeById(s.id)?.path, s.id).toBe(s.path);
  });

  it('ids únicos', () => {
    const ids = context.sections.map((s) => s.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo projeto aparece, com stack e repositório quando existe', () => {
    for (const p of projects) {
      const s = section(`projeto-${p.id}`);

      for (const lang of LANGS) {
        expect(s.text[lang], `${p.id}/${lang}`).toContain(p.name);
        for (const tech of p.tech) expect(s.text[lang], `${p.id}/${tech}`).toContain(tech);
        if (p.repo) expect(s.text[lang]).toContain(p.repo);
      }
      if (p.caseStudy) expect(s.path).toBe(p.caseStudy);
    }
  });

  it('toda experiência, instituição, curso, nota e contato do site aparece', () => {
    for (const group of experienceGroups)
      for (const item of group.items) {
        const org = typeof item.org === 'string' ? item.org : item.org.pt;

        expect(section('experiencias').text.pt, item.id).toContain(org);
      }

    for (const program of academics.programs)
      expect(section('academico').text.pt).toContain(program.institution);

    for (const semester of academics.semesters)
      for (const course of semester.courses) {
        expect(section('academico').text.pt).toContain(course.name.pt);
        if (course.grade !== null)
          expect(section('academico').text.pt).toContain(String(course.grade));
      }

    for (const value of [profile.email, profile.github, profile.linkedin])
      expect(section('contato').text.pt).toContain(value);

    expect(section('curriculo').text.pt).toContain(resume.pt.name);
    expect(section('servicos').text.pt).toContain(services.pt.faq.items[0].q);
    expect(section('servicos').text.en).toContain(services.en.faq.items[0].q);
  });

  it('não sobra marcação nem texto de interface (botões, impressão)', () => {
    for (const s of context.sections)
      for (const lang of LANGS) {
        expect(s.text[lang], `${s.id}/${lang}`).not.toMatch(/<\/?[a-z][^>]*>/i);
        expect(s.text[lang]).not.toContain('Imprimir / salvar em PDF');
        expect(s.text[lang]).not.toContain('[object Object]');
      }
  });

  it('cabe no teto e o build falha com aviso quando passa dele', () => {
    for (const lang of LANGS) expect(contextSize(context, lang)).toBeLessThan(MAX_CHARS_PER_LANG);
    expect(() => assertContextFits(context)).not.toThrow();

    const huge = {
      sections: [
        { ...context.sections[0], text: { pt: 'x'.repeat(MAX_CHARS_PER_LANG + 1), en: 'x' } },
      ],
    };

    expect(() => assertContextFits(huge)).toThrow(/teto/);
  });
});
