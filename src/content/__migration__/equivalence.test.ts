import { compareFacts, formatDifferences } from './compare';
import { DOMAINS, legacyFacts } from './legacyFacts';
import { newFacts } from './newFacts';

// Um domínio sem projetor aparece como `todo` (não como passou): a T4.x do domínio o liga.
describe('equivalência antigo × novo', () => {
  for (const domain of DOMAINS) {
    const legacy = legacyFacts[domain];
    const next = newFacts[domain];

    if (!legacy || !next) {
      it.todo(`${domain}: sem projetor ainda (ligado na T4.x do domínio)`);
      continue;
    }

    it(`${domain}: o conteúdo novo diz o mesmo que o antigo`, () => {
      const oldFacts = legacy();
      const newList = next();

      expect(oldFacts.length, `${domain}: o lado antigo não pode ser vazio`).toBeGreaterThan(0);
      expect(formatDifferences(compareFacts(oldFacts, newList))).toBe('');
    });
  }
});
