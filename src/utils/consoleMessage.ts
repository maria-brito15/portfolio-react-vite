// Mensagem para quem abre o DevTools (CE-05): uma única chamada a `console.info`
// na inicialização, no idioma do navegador. Só dados já públicos do site.
import type { Lang } from '../types';
import { profile } from '../data/profile';
import { projects } from '../data/projects';

export function consoleMessage(lang: Lang): string {
  const repo = projects.find((p) => p.id === 'portfolio')?.repo;
  const code = repo ? ` ${repo}` : '';

  return lang === 'pt'
    ? `Oi! Você abriu o DevTools, então provavelmente gosta de ver como as coisas funcionam. Este site é um terminal: digite "ajuda" nele.\nCódigo:${code}\nContato: ${profile.email}`
    : `Hi! You opened DevTools, so you probably like seeing how things work. This site is a terminal: type "help" in it.\nCode:${code}\nContact: ${profile.email}`;
}

export function announceInConsole(language: string | undefined = globalThis.navigator?.language) {
  const lang: Lang = language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';

  console.info(consoleMessage(lang));
}
