# Design — Sessão do terminal (retroativo)

Descreve como a feature foi construída, a partir do código existente. Não é uma decisão prévia: registre mudanças futuras como ADR (`docs/adr/`).

## Arquivos envolvidos

- `src/terminal/TerminalSession.tsx`
- `src/terminal/useTerminal.ts`
- `src/terminal/Terminal.tsx`
- `src/terminal/CommandInput.tsx`
- `src/terminal/TerminalOutput.tsx`
- `src/terminal/redirect.test.tsx`

## Decisões observadas no código
- Ver `docs/sdd-terminal-v2/requirements.md` §2 (V-01 a V-08), que valem para todas as features.

## Pendências de design
- Itens ❌ ou ◐ em `status.md` indicam onde o desenho ainda não foi concluído.
