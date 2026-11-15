// Interruptor do redesenho "Caderno — Vol. XI" (docs/specs/caderno-vol-xi, CD-60).
// Desligado (padrão): o site atual renderiza sem alteração. Ligado (`VITE_CADERNO_V2=true`
// no build): o shell editorial substitui o antigo. O valor é fixado no build; os testes
// trocam o módulo com `vi.mock('../config')`.
export const CADERNO_V2 = import.meta.env.VITE_CADERNO_V2 === 'true';
