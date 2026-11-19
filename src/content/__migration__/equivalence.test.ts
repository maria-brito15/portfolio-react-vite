import { compareFacts, formatDifferences } from './compare';
import { countProblem } from './coverage';
import { DOMAINS, legacyCounts, legacyFacts, legacyGuards } from './legacyFacts';
import { newCounts, newFacts } from './newFacts';

// Um domínio sem projetor aparece como `todo` (não como passou): a T4.x do domínio o liga.
describe('equivalência antigo × novo', () => {
  for (const domain of DOMAINS) {
    const legacy = legacyFacts[domain];
    const next = newFacts[domain];

    if (!legacy || !next) {
      it.todo(`${domain}: sem projetor ainda (ligado na T4.x do domínio)`);
      continue;
    }

    it(`${domain}: a trava de cobertura não acha chave nova nem PT/EN desparelhado`, () => {
      expect(legacyGuards[domain]?.() ?? []).toEqual([]);
    });

    it(`${domain}: a contagem do novo é a do antigo`, () => {
      const oldCount = legacyCounts[domain]?.();
      const newCount = newCounts[domain]?.();

      expect(oldCount, `${domain}: sem contagem do lado antigo`).toBeDefined();
      expect(countProblem(domain, oldCount ?? -1, newCount ?? -2)).toBeNull();
    });

    it(`${domain}: o conteúdo novo diz o mesmo que o antigo`, () => {
      const oldFacts = legacy();

      expect(oldFacts.length, `${domain}: o lado antigo não pode ser vazio`).toBeGreaterThan(0);
      expect(formatDifferences(compareFacts(oldFacts, next()))).toBe('');
    });
  }
});
