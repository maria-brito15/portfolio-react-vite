import { z } from 'zod';
import type { Localized } from '../../types';
import { LocalizedTextSchema, typeNameInPt } from './localized';

export interface ContentImage {
  path: string;
  alt: Localized;
  width: number;
  height: number;
}

export const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'svg'] as const;

// eslint-disable-next-line no-control-regex
const SPACE_OR_CONTROL = /[\u0000- \u007F-\u009F]/;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const LOCAL_RULE = 'caminho inválido: deve ser local, começar com "/" e não conter ".."';

/**
 * Forma do caminho (design §5.3). Que o arquivo exista em `public/` precisa de disco e é
 * conferido pelo validador (`scripts/contentValidator.ts`).
 */
export function imagePathProblem(value: unknown): string | null {
  if (value === undefined) return 'caminho ausente';
  if (typeof value !== 'string') return `esperado texto, recebido ${typeNameInPt(value)}`;
  if (value === '') return 'caminho vazio';
  if (HAS_SCHEME.test(value) || value.startsWith('//')) {
    return 'imagem externa não é aceita (sem hotlink)';
  }
  if (SPACE_OR_CONTROL.test(value)) return 'caminho com espaço ou caractere de controle';
  if (!value.startsWith('/') || value.includes('..') || value.includes('\\')) return LOCAL_RULE;

  const extension = value.split('.').pop()?.toLowerCase() ?? '';

  if (!(IMAGE_EXTENSIONS as readonly string[]).includes(extension) || !value.includes('.')) {
    return `extensão não aceita (aceitas: ${IMAGE_EXTENSIONS.join(', ')})`;
  }

  return null;
}

const dimensionSchema = (name: 'largura' | 'altura') =>
  z.unknown().superRefine((value, ctx) => {
    if (value === undefined) {
      ctx.addIssue({ code: 'custom', message: `${name} ausente` });
    } else if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
      const received = typeof value === 'number' ? String(value) : typeNameInPt(value);

      ctx.addIssue({
        code: 'custom',
        message: `${name} não é inteiro positivo (recebido ${received})`,
      });
    }
  });

const ImagePathSchema = z.unknown().superRefine((value, ctx) => {
  const problem = imagePathProblem(value);

  if (problem) ctx.addIssue({ code: 'custom', message: problem });
});

// `alt` é obrigatório em PT e EN: imagem decorativa não usa esta primitiva (FR-009, NFR-003).
export const ImageSchema = z.strictObject({
  path: ImagePathSchema,
  alt: LocalizedTextSchema,
  width: dimensionSchema('largura'),
  height: dimensionSchema('altura'),
}) as unknown as z.ZodType<ContentImage>;
