// T3.5 (TD-025 (a), NFR-001): a sessão do terminal não entra no chunk de entrada. O `App` não a
// importa; ela só nasce em `TerminalPage`, que é carregada sob demanda.
import { readFileSync } from 'node:fs';

const read = (file: string) => readFileSync(file, 'utf8');

describe('terminal fora do primeiro acesso', () => {
  it('App.tsx não cita TerminalSession nem TerminalProvider', () => {
    const app = read('src/App.tsx');

    expect(app).not.toMatch(/TerminalSession|TerminalProvider|src\/terminal|from '\.\/terminal/);
  });

  it('TerminalPage é carregada sob demanda (lazyPages) e é quem cria a sessão', () => {
    expect(read('src/pages/lazyPages.ts')).toMatch(/TerminalPage = lazy\(/);
    expect(read('src/pages/TerminalPage.tsx')).toMatch(/<TerminalProvider>/);
  });

  it('só a página do terminal usa o RunButton (que precisa da sessão)', () => {
    expect(read('src/components/CommandCatalog.tsx')).toMatch(/RunButton/);
    expect(read('src/pages/TerminalPage.tsx')).toMatch(/CommandCatalog/);
  });
});
