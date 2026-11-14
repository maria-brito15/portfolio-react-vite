// Comando `pessoal` (personal): a visão em terminal do espaço cultural (docs/specs/personal/,
// CL-05). Sem argumento lista as quatro seções; `pessoal livros|filmes|musica|teatro` mostra as
// primeiras linhas de cada uma e leva à página própria. As seções saem das rotas filhas de
// `pessoal` em `routes.ts`: nenhum nome ou caminho é escrito aqui. Dado fictício (Fase 1) ganha o
// mesmo selo das páginas. Só a definição do comando fica no JS inicial; a visão (`personalView`)
// é carregada quando o comando roda.
import { lazy, Suspense } from 'react';
import type { Localized } from '../../types';
import { fold, routes } from '../../data/routes';
import type { Command } from '../commands';

const L = (pt: string, en: string): Localized => ({ pt, en });

const PersonalView = lazy(() => import('./personalView'));

// A seção pedida, por nome em PT ou EN (sem acento e sem caixa).
const findSection = (arg: string) =>
  routes
    .filter((r) => r.parent === 'pessoal')
    .find((r) => [r.segment?.pt, r.segment?.en].some((s) => s && fold(s) === fold(arg)));

export const pessoal: Command = {
  names: ['pessoal', 'personal'],
  usage: L('[livros|filmes|musica|teatro]', '[books|films|music|theater]'),
  // Para o Tab depois do comando (`pessoal li` → `pessoal livros`).
  args: [L('livros', 'books'), L('filmes', 'films'), L('musica', 'music'), L('teatro', 'theater')],
  desc: L('livros, filmes, música e teatro', 'books, films, music and theater'),
  run: (args) => {
    const route = args.length === 1 ? findSection(args[0]) : undefined;
    // Seção desconhecida: a visão reimprime o índice com o erro (erro que reensina).
    const unknown = args.length > 0 && !route ? args.join(' ') : undefined;

    return {
      output: (lang) => (
        <Suspense fallback={null}>
          <PersonalView lang={lang} routeId={route?.id} unknown={unknown} />
        </Suspense>
      ),
    };
  },
};
