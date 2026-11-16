// EXEMPLOS: dados inventados só para testar o validador. Nada aqui é conteúdo da Duda e este
// arquivo não é registrado (o sufixo é `.fixture.ts`, não `.content.ts`).
import { z } from 'zod';
import {
  ContentDateSchema,
  ImageSchema,
  LinkSchema,
  LocalizedTextSchema,
  RatingSchema,
  TagSetSchema,
} from '../schema';

export const EXAMPLE_IMAGE_PATH = '/assets/exemplo.png';

export const ExampleItemSchema = z.strictObject({
  titulo: LocalizedTextSchema,
  data: ContentDateSchema,
  link: LinkSchema,
  capa: ImageSchema,
  tags: TagSetSchema,
  rating: RatingSchema,
});

export const ExampleListSchema = z.object({ itens: z.array(ExampleItemSchema) });

export function makeExampleItem(index: number) {
  return {
    titulo: { pt: `EXEMPLO ${index}`, en: `EXAMPLE ${index}` },
    data: index % 2 === 0 ? { year: 2025, month: (index % 12) + 1 } : { year: 2025 },
    link: `/exemplo/${index}`,
    capa: {
      path: EXAMPLE_IMAGE_PATH,
      alt: { pt: `Imagem de exemplo ${index}`, en: `Example image ${index}` },
      width: 800,
      height: 600,
    },
    tags: [
      { id: 'exemplo', label: { pt: 'Exemplo', en: 'Example' } },
      { id: `item-${index}`, label: { pt: `Item ${index}`, en: `Item ${index}` } },
    ],
    rating: (index % 10) / 2 + 0.5,
  };
}

/** `count` itens válidos de exemplo (o teste de carga usa 200). */
export function makeExampleItems(count: number) {
  return Array.from({ length: count }, (_, i) => makeExampleItem(i));
}
