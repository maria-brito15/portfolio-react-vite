import { filterItems, matchRanges, paletteItems } from '../components/paletteItems';
import { PERSONA_IDS } from './personas';
import { intentsFor, intentOrder, intents } from './intents';
import { routeById } from './routes';
import { personaTopics } from './searchRanking';
import { suggestionsFor } from './nextActions';

const items = paletteItems('pt');
const ids = (query: string, persona?: (typeof PERSONA_IDS)[number], list = items) =>
  filterItems(list, query, persona).map((i) => i.id);

describe('itens da paleta', () => {
  it.each(['pt', 'en'] as const)('todo item tem rótulo e destino ou comando em %s', (lang) => {
    for (const item of paletteItems(lang)) {
      expect(item.label.trim(), item.id).not.toBe('');
      expect(Boolean(item.to || item.run), item.id).toBe(true);
    }
  });
});

describe('busca por persona: só ordena, nunca esconde', () => {
  it.each(['curriculo', 'projetos', 'servico', 'github', 'e', 'java', 'academic', ''])(
    'mesmo conjunto de resultados com e sem persona para "%s"',
    (query) => {
      const plain = ids(query).sort();

      for (const persona of PERSONA_IDS) expect(ids(query, persona).sort()).toEqual(plain);
    },
  );

  it('sem persona a ordem é a de sempre', () => {
    expect(filterItems(items, 'e', undefined)).toEqual(filterItems(items, 'e'));
  });

  it('a mesma busca sobe coisas diferentes para cada persona', () => {
    const first = (persona: (typeof PERSONA_IDS)[number], q: string) =>
      filterItems(items, q, persona)[0];

    // "backend" acha projetos pelas tecnologias que eles declaram; tech vê projeto/estudo de caso.
    expect(ids('backend')).toEqual(expect.arrayContaining(['project:whatsapp-dispatcher']));
    expect(['project', 'case']).toContain(first('tech', 'backend').topic);

    // "experiencia" (RH) vem do currículo/experiências; "academic" (professor) do acadêmico.
    expect(['curriculo', 'experiencias']).toContain(first('rh', 'experience').topic);
    expect(first('professor', 'academic').topic).toBe('academico');
    expect(first('cliente', 'services').topic).toBe('servicos');
    expect(['sobre', 'project', 'jogos', 'game']).toContain(first('amigo', 'personal').topic);
  });

  it('consultas pedidas: cada persona encontra o que o roadmap descreve, em PT e EN', () => {
    const en = paletteItems('en');

    expect(ids('arquitetura', 'tech')).toContain('case:whatsapp-dispatcher');
    expect(ids('architecture', 'tech', en)).toContain('case:whatsapp-dispatcher');
    expect(ids('experience', 'rh', en)).toContain('page:experiencias');
    expect(ids('competencias', 'rh')).toContain('section:curriculo:competencias');
    expect(ids('disciplinas', 'professor')).toContain('section:academico:disciplinas');
    expect(ids('faq', 'cliente')).toContain('section:servicos:faq');
    expect(ids('jogos', 'amigo')).toContain('page:jogos');
  });

  it('sem busca, a persona reordena os grupos sem tirar nada', () => {
    const plain = ids('').sort();

    expect(ids('', 'tech').sort()).toEqual(plain);
  });

  it('as listas de prioridade só citam páginas ou temas que existem', () => {
    const generic = ['project', 'case', 'game', 'skill', 'command'];

    for (const persona of PERSONA_IDS)
      for (const topic of personaTopics[persona])
        expect(generic.includes(topic) || routeById(topic), `${persona}/${topic}`).toBeTruthy();
  });

  it('destaque ignora acento e caixa e devolve os trechos casados', () => {
    expect(matchRanges('Currículo', 'CURRICULO')).toEqual([[0, 9]]);
    expect(matchRanges('Estudo de caso', 'caso de')).toEqual(
      [
        [10, 14],
        [7, 9],
      ].sort((a, b) => a[0] - b[0]),
    );
    expect(matchRanges('abc', 'zzz')).toEqual([]);
  });
});

describe('atalhos por intenção', () => {
  it('toda persona (e nenhuma) vê todas as intenções, e os destinos existem', () => {
    for (const persona of [undefined, ...PERSONA_IDS]) {
      const list = intentsFor(persona);

      expect(list.map((l) => l.intent.id).sort(), String(persona)).toEqual(
        intents.map((i) => i.id).sort(),
      );

      for (const { to } of list)
        expect(routeById(to.route), `${persona}/${to.route}`).toBeDefined();
    }
  });

  it('a primeira intenção muda com a persona', () => {
    expect(intentsFor('tech')[0].intent.id).toBe('projetos');
    expect(intentsFor('professor')[0].intent.id).toBe('academico');
    expect(intentsFor('cliente')[0].intent.id).toBe('servicos');
    expect(intentsFor('tech')[0].to.route).toBe('whatsapp-dispatcher');
    expect(Object.keys(intentOrder)).toEqual(expect.arrayContaining([...PERSONA_IDS]));
  });
});

describe('sugestões sem repetição', () => {
  it('sem histórico, são as da regra (principal e secundária)', () => {
    const list = suggestionsFor('rh', 'curriculo', new Set());

    expect(list.map((a) => a.route)).toEqual(['experiencias', 'contato']);
  });

  it('no máximo duas, sem a página atual nem as já visitadas, e completa com páginas da persona', () => {
    const list = suggestionsFor('rh', 'curriculo', new Set(['experiencias', 'contato']));

    expect(list.length).toBeLessThanOrEqual(2);
    expect(list.length).toBeGreaterThan(0);

    for (const a of list) {
      expect(['curriculo', 'experiencias', 'contato']).not.toContain(a.route);
      expect(routeById(a.route)).toBeDefined();
    }

    expect(new Set(list.map((a) => a.route)).size).toBe(list.length);
  });

  it('ação com âncora continua valendo mesmo com a página visitada', () => {
    const list = suggestionsFor('cliente', 'servicos', new Set(['servicos']));

    expect(list[0]).toMatchObject({ route: 'servicos', anchor: 'cases' });
  });

  it('sem persona ou sem regra: nada', () => {
    expect(suggestionsFor(undefined, 'curriculo', new Set())).toEqual([]);
    expect(suggestionsFor('rh', 'jogos', new Set())).toEqual([]);
  });
});
