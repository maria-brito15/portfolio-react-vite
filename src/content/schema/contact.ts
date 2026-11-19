import { z } from 'zod';
import { ImageSchema, type ContentImage } from './image';
import { LinkSchema } from './link';
import { withNoPlaceholders } from './placeholder';

export interface ContentContact {
  email: string;
  servicesEmail: string;
  github: string;
  linkedin: string;
  photo: ContentImage;
}

// `mailto:` sem parâmetros já é regra da `Link` da 001; aqui só se exige o formato `mailto:`.
const MailtoSchema = LinkSchema.superRefine((value, ctx) => {
  if (typeof value === 'string' && !value.startsWith('mailto:')) {
    ctx.addIssue({ code: 'custom', message: 'precisa ser um endereço mailto:' });
  }
});

// `https` e no host esperado (com ou sem `www.`). Um perfil em outro host é erro de digitação.
function profileLink(host: string) {
  return LinkSchema.superRefine((value, ctx) => {
    if (typeof value !== 'string') return;

    if (!value.startsWith('https://')) {
      ctx.addIssue({ code: 'custom', message: 'precisa de https' });

      return;
    }

    let hostname = '';

    try {
      hostname = new URL(value).hostname.replace(/^www\./, '');
    } catch {
      ctx.addIssue({ code: 'custom', message: 'endereço inválido' });

      return;
    }

    if (hostname !== host) {
      ctx.addIssue({
        code: 'custom',
        message: `o endereço precisa ser de ${host} (recebido ${hostname})`,
      });
    }
  });
}

export const ContactSchema = withNoPlaceholders(
  z.strictObject({
    email: MailtoSchema,
    servicesEmail: MailtoSchema,
    github: profileLink('github.com'),
    linkedin: profileLink('linkedin.com'),
    photo: ImageSchema,
  }),
) as unknown as z.ZodType<ContentContact>;
