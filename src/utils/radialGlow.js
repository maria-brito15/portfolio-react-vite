// Efeito radial dos cards de projeto (script original): a posição do cursor vira
// as variáveis CSS --mx/--my, lidas pelo gradiente em styles/portfolio.css.
// Atualiza o estilo diretamente para não re-renderizar o card a cada movimento.
export function handleRadialGlow(event) {
  const card = event.currentTarget;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${(((event.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
  card.style.setProperty('--my', `${(((event.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
}
