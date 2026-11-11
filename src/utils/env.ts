// Perguntas sobre o ambiente do visitante, usadas por mais de um recurso
// (aviso de celular, boot, matrix, carregamento do terminal).

// Robôs de busca e de pré-visualização de link nunca guardam marcas de "já visto":
// avisos e animações de primeira visita não são montados para eles. O conteúdo é o mesmo.
const CRAWLER =
  /googlebot|bingbot|duckduckbot|yandex|baiduspider|slurp|applebot|facebookexternalhit|linkedinbot|twitterbot|whatsapp|discordbot|slackbot/i;

export const isCrawler = () =>
  typeof navigator !== 'undefined' && CRAWLER.test(navigator.userAgent);

// `prefers-reduced-motion: reduce`: nada de animação por temporizador.
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
