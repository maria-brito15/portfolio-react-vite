import { formatSince, skillTimeline } from './skillTimeline';
import { projects } from './projects';
import { experienceGroups } from './experiences';

describe('competências com tempo', () => {
  it('formata o tempo a partir do ano, sem inventar quando não há ano', () => {
    const today = new Date(2026, 10, 6);

    expect(formatSince(2025, 'pt', today)).toBe('1+ ano');
    expect(formatSince(2023, 'en', today)).toBe('3+ yrs');
    expect(formatSince(2026, 'pt', today)).toBe('< 1 ano');
    expect(formatSince(null, 'pt', today)).toBeNull();
  });

  it('cada ano informado bate com a data do projeto citado como origem', () => {
    const year = { 'EcoShop v1': 2025, 'EcoShop v2': 2026 };

    for (const p of projects) year[p.name] = p.date.year;

    for (const g of experienceGroups)
      for (const e of g.items)
        year[typeof e.org === 'string' ? e.org : e.org.pt] ??= Number(e.period.pt.slice(-4));

    for (const group of skillTimeline) {
      for (const item of group.items) {
        if (typeof item.source === 'string') expect(item.since).toBe(year[item.source]);
        else if (item.source) expect(item.since).toBe(year.Alura);
      }
    }
  });
});
