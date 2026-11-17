import { z } from 'zod';
import { LANGS } from '../../types';
import { textProblem, typeNameInPt } from './localized';

// Esquema da tabela de rotas (spec 002, TD-006, Data Model). Valida a tabela inteira de uma vez,
// porque as regras mais importantes são entre rotas (endereços únicos, ordem do menu, uma só rota
// sem casca). Todos os problemas saem juntos, na mensagem do Data Model do design.
//
// Escrito à mão pelo mesmo motivo de `LocalizedTextSchema`: o zod só roda uma regra depois de a
// anterior passar, e aqui um erro não pode esconder o outro.

type Rec = Record<string, unknown>;

const isRecord = (value: unknown): value is Rec =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const EN_ROOT = '/en';
const isEnPath = (path: string) => path === EN_ROOT || path.startsWith(`${EN_ROOT}/`);

// `{ pt, en }` com os dois textos não vazios; devolve os idiomas que faltam ou estão vazios.
function missingLangs(value: unknown): string[] {
  if (!isRecord(value)) return [...LANGS];

  return LANGS.filter((lang) => textProblem(value[lang]) !== null);
}

export const RouteTableSchema = z.unknown().superRefine((table, ctx) => {
  const add = (message: string, path: (string | number)[] = []) =>
    ctx.addIssue({ code: 'custom', message, path });

  if (!Array.isArray(table)) {
    add(`esperada lista de rotas, recebido ${typeNameInPt(table)}`);

    return;
  }

  const seenPaths = new Map<string, string>();
  const seenEnPaths = new Map<string, string>();
  const seenOrders = new Map<number, string>();
  const bare: string[] = [];

  // Todos os caminhos em português primeiro, para o endereço em inglês não colidir com eles.
  const ptPaths = new Set(
    table.flatMap((route) =>
      isRecord(route) && typeof route.path === 'string' ? [route.path] : [],
    ),
  );

  table.forEach((route, index) => {
    if (!isRecord(route)) {
      add(`esperado objeto, recebido ${typeNameInPt(route)}`, [index]);

      return;
    }

    const id = typeof route.id === 'string' && route.id !== '' ? route.id : `#${index}`;
    const at = (field: string) => [index, field];

    // Endereço em português: começa com `/`, não com `/en`, e não repete.
    const path = route.path;

    if (
      typeof path !== 'string' ||
      !path.startsWith('/') ||
      isEnPath(path) ||
      seenPaths.has(path)
    ) {
      add(`rota ${id}: endereço em português ${String(path)} começa com /en ou repete`, at('path'));
    } else {
      seenPaths.set(path, id);
    }

    // Endereço em inglês: `/en` ou sob `/en/`, sem repetir e sem colidir com um endereço em PT.
    const enPath = route.enPath;

    if (
      typeof enPath !== 'string' ||
      !isEnPath(enPath) ||
      seenEnPaths.has(enPath) ||
      ptPaths.has(enPath)
    ) {
      add(`rota ${id}: endereço em inglês ${String(enPath)} repetido ou fora de /en`, at('enPath'));
    } else {
      seenEnPaths.set(enPath, id);
    }

    for (const lang of missingLangs(route.title))
      add(`rota ${id}: título sem ${lang}`, at('title'));

    for (const lang of missingLangs(route.description))
      add(`rota ${id}: descrição sem ${lang}`, at('description'));

    for (const lang of missingLangs(route.label))
      add(`rota ${id}: rótulo sem ${lang}`, at('label'));

    // A dica curta (`desc`: terminal, paleta, barra lateral) é opcional; quando existe, vale nos dois.
    if (route.desc !== undefined)
      for (const lang of missingLangs(route.desc)) add(`rota ${id}: dica sem ${lang}`, at('desc'));

    // Menu: `order` obrigatório e sem repetição.
    if (route.menu === true) {
      const order = route.order;

      if (typeof order !== 'number' || !Number.isInteger(order)) {
        add(`rota ${id}: menu sem ordem`, at('order'));
      } else if (seenOrders.has(order)) {
        add(`menu: ordem ${order} repetida`, at('order'));
      } else {
        seenOrders.set(order, id);
      }
    }

    // Rota sem casca: não entra no menu (FR-041) e só existe uma.
    if (route.bare === true) {
      bare.push(id);
      if (route.menu === true) add(`rota ${id}: bare e menu juntos`, at('bare'));
    }

    if (route.prova === true && route.menu === true)
      add(`rota ${id}: prova e menu juntos`, at('prova'));
  });

  if (bare.length > 1) add(`só uma rota pode ser bare, achei ${bare.length}: ${bare.join(', ')}`);
});

/** Problemas da tabela, na mensagem do Data Model; lista vazia quando a tabela vale. */
export function routeTableProblems(table: unknown): string[] {
  const result = RouteTableSchema.safeParse(table);

  return result.success ? [] : result.error.issues.map((issue) => issue.message);
}
