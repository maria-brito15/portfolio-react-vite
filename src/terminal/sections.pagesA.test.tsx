// Mesmo padrão nas páginas com seções, parte A.
// Parte da divisão de `sections.test.tsx` (spec 001, T6.3): nenhum caso mudou.
import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../test/helpers';
import { routes } from '../data/routes';
import { sectionsOf } from '../data/sections';
import { log, PAGES_A, PAGES_B, run } from './sectionsHelpers';

beforeEach(() => sessionStorage.clear());

describe('mesmo padrão em todas as páginas com seções (DS-12)', () => {
  const pages = routes.filter((r) => PAGES_A.includes(r.id));
  const cases = pages.flatMap((r) => [
    [r.id, 'pt'],
    [r.id, 'en'],
  ]);

  it('há páginas com seções para cobrir', () => {
    // As duas listas juntas cobrem exatamente as páginas que têm seções.
    const all = routes.filter((r) => sectionsOf(r.id).length).map((r) => r.id);

    expect([...PAGES_A, ...PAGES_B].sort()).toEqual(all.sort());
    expect(all).toEqual(
      expect.arrayContaining(['curriculo', 'academico', 'servicos', 'projetos', 'experiencias']),
    );
  });

  it.each(cases)(
    '%s (%s): índice, clique, número, proximo, erro e dicas',
    { timeout: 90000 },
    async (routeId, lang) => {
      const user = userEvent.setup();

      renderApp();

      const route = routes.find((r) => r.id === routeId);
      const total = sectionsOf(routeId).length;
      const page = (lang === 'pt' ? route!.name : route!.alias) as string;
      const nav = () => log().querySelector<HTMLElement>('.t-sectionnav')!;
      const index = () => log().querySelector<HTMLElement>('.t-index')!;

      if (lang === 'en') await run(user, 'idioma');

      // índice numerado, instrução e dicas
      await run(user, page);
      await waitFor(() => expect(index()).toBeTruthy());
      expect(index().querySelectorAll('.t-index-list li')).toHaveLength(total);
      expect(index()).toHaveTextContent('[1]');
      expect(index()).toHaveTextContent(`[${total}]`);
      expect(index()).toHaveTextContent(
        lang === 'pt' ? 'Digite o número ou o nome' : 'Type the number or the name',
      );
      expect(index()).toHaveTextContent(`cd ${page}`);
      expect(index()).toHaveTextContent(`ls ${page}`);
      expect(index()).toHaveTextContent('cd ~');

      const html = index().innerHTML;

      // ls <página> mostra exatamente o mesmo índice
      await run(user, `ls ${page}`);
      await waitFor(() => expect(index()).toBeTruthy());
      expect(index().innerHTML).toBe(html);

      // clique em [1] = `<página> 1`
      await run(user, page);
      await waitFor(() => expect(index()).toBeTruthy());
      await user.click(within(index()).getAllByRole('button')[0]);
      await waitFor(() => expect(nav()).toBeTruthy());
      expect(index()).toBeNull();
      expect(nav()).toHaveTextContent(
        lang === 'pt' ? 'anterior: esta é a primeira seção' : 'previous: this is the first section',
      );

      // conteúdo da entrada sem o eco do comando digitado/clicado
      const prompt = 'visitante@mariab.dev:~' + String.fromCharCode(36);
      const body = (typed: string) =>
        log()
          .querySelector<HTMLElement>('.term-entry')!
          .textContent!.replace(prompt + typed, '');
      const first = body(`${page} 1`);

      // número sozinho e proximo seguem a última página aberta
      await run(user, page);
      await run(user, '1');
      await waitFor(() => expect(nav()).toBeTruthy());
      expect(body('1')).toBe(first);
      if (total > 1) {
        await run(user, lang === 'pt' ? 'proximo' : 'next');
        await waitFor(() => expect(nav()).toHaveTextContent(`${page} 1`));
        await run(user, 'p');
        await waitFor(() =>
          expect(nav()).toHaveTextContent(
            lang === 'pt' ? 'esta é a primeira seção' : 'this is the first section',
          ),
        );
      }

      // erro que reensina
      await run(user, `${page} xpto`);
      await waitFor(() => expect(log().querySelector<HTMLElement>('.t-err')!).toBeTruthy());
      expect(log().querySelector<HTMLElement>('.t-err')!).toHaveTextContent('xpto');
      expect(index().querySelectorAll('.t-index-list li')).toHaveLength(total);
    },
  );
});
