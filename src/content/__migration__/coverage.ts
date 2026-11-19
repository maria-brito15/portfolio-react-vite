// Trava de cobertura da equivalência (003, design §6.3 item 5): impede que um campo escape em silêncio.

/** (a) A contagem do módulo antigo tem de ser igual à do novo; o número esperado é lido do antigo. */
export function countProblem(label: string, oldCount: number, newCount: number): string | null {
  return oldCount === newCount
    ? null
    : `${label}: o antigo tem ${oldCount} e o novo tem ${newCount}`;
}

/**
 * (b) Toda chave de um objeto antigo precisa estar em "mapeada" ou em "excluída de propósito".
 * Chave nova no antigo faz o teste falhar até alguém decidir o que fazer com ela.
 */
export function unmappedKeys(
  label: string,
  object: object,
  mapped: readonly string[],
  excluded: readonly string[],
): string[] {
  const known = new Set([...mapped, ...excluded]);

  return Object.keys(object)
    .filter((key) => !known.has(key))
    .map((key) => `${label}: chave "${key}" do módulo antigo não está mapeada nem excluída`);
}

/** (c) PT e EN do antigo com listas de tamanhos diferentes: o formato novo pareia, então falha antes. */
export function pairedProblem(
  label: string,
  pt: readonly unknown[],
  en: readonly unknown[],
): string | null {
  return pt.length === en.length
    ? null
    : `${label}: PT tem ${pt.length} itens e EN tem ${en.length} (o formato novo pareia os dois)`;
}
