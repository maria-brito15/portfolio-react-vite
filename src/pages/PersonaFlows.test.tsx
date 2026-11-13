import { screen } from '@testing-library/react';
import { renderApp } from '../test/helpers';
import { PERSONA_KEY } from '../hooks/usePersona';
import { TRAIL_KEY, resetTrailMemory } from '../trails/storage';
import { PERSONA_IDS } from '../data/personas';

// Fluxos da Fase 6: trocar de persona sem perder progresso, rota direta e armazenamento
// indisponível. O comportamento principal de cada persona tem seus testes (home, projetos,
// próximos passos, experiências e busca); aqui ficam os que cruzam várias delas.
const store = {
  trails: { rh: { step: 2, done: ['resumo', 'competencias'], finished: false, dismissed: false } },
  secrets: ['fortune'],
};

beforeEach(() => resetTrailMemory());

describe('troca de persona', () => {
  it('trocar e voltar não zera o progresso das trilhas nem os segredos achados', () => {
    localStorage.setItem(TRAIL_KEY, JSON.stringify(store));

    for (const persona of ['rh', 'tech', 'amigo', 'rh']) {
      localStorage.setItem(PERSONA_KEY, persona);
      renderApp('/').unmount();
      resetTrailMemory();
    }

    expect(JSON.parse(localStorage.getItem(TRAIL_KEY)!)).toEqual(store);
  });

  it.each(PERSONA_IDS)('/r/%s aplica a persona e a mantém ao abrir a home', (id) => {
    const view = renderApp(`/r/${id}`);

    expect(document.querySelector('.dash')).toHaveAttribute('data-persona', id);
    view.unmount();
    expect(localStorage.getItem(PERSONA_KEY)).toBe(id);
    renderApp('/');
    expect(document.querySelector('.dash')).toHaveAttribute('data-persona', id);
  });

  it('persona desconhecida na rota: página não encontrada, sem persona', () => {
    renderApp('/r/inexistente');

    expect(screen.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
    expect(document.querySelector('.dash')).toBeNull();
  });
});

describe('sem armazenamento (navegação privada)', () => {
  it('a persona vale na sessão e a navegação continua funcionando', () => {
    const blocked = () => {
      throw new DOMException('blocked', 'SecurityError');
    };
    const local = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);

    try {
      renderApp('/r/tech');
      expect(document.querySelector('.dash')).toHaveAttribute('data-persona', 'tech');
      expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(0);
    } finally {
      local.mockRestore();
      set.mockRestore();
    }
  });
});
