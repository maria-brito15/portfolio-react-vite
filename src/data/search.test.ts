import { filterItems, matchRanges, paletteItems } from '../components/paletteItems';

const items = paletteItems('pt');
const ids = (query: string, list = items) => filterItems(list, query).map((i) => i.id);

describe('itens da paleta', () => {
  it.each(['pt', 'en'] as const)('todo item tem rótulo e destino ou comando em %s', (lang) => {
    for (const item of paletteItems(lang)) {
      expect(item.label.trim(), item.id).not.toBe('');
      expect(Boolean(item.to || item.run), item.id).toBe(true);
    }
  });
});

describe('busca', () => {
  it('"backend" acha projetos pelas tecnologias que eles declaram', () => {
    expect(ids('backend')).toEqual(expect.arrayContaining(['project:whatsapp-dispatcher']));
  });

  it('consultas pedidas: acham o que o roadmap descreve, em PT e EN', () => {
    const en = paletteItems('en');

    expect(ids('arquitetura')).toContain('case:whatsapp-dispatcher');
    expect(ids('architecture', en)).toContain('case:whatsapp-dispatcher');
    expect(ids('experience', en)).toContain('page:experiencias');
    expect(ids('competencias')).toContain('section:curriculo:competencias');
    expect(ids('disciplinas')).toContain('section:academico:disciplinas');
    expect(ids('faq')).toContain('section:servicos:faq');
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
