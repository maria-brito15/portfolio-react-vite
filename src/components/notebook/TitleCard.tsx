import { useLanguage } from '../../i18n/LanguageContext';
import { projects } from '../../data/projects';

// Cartão de abertura do projeto (CD-20), em estilo de crédito de filme. Ano e stack vêm dos dados
// do projeto; nada é inventado. Entra com um fade de 1 s (CSS), estático em movimento reduzido.
export default function TitleCard({ projectId }: { projectId: string }) {
  const { t } = useLanguage();
  const project = projects.find((p) => p.id === projectId);

  if (!project) return null;

  const p = t.nb.project;

  return (
    <div className="nb-titlecard" role="group" aria-label={p.cardLabel}>
      <p className="nb-titlecard-year">{p.production(project.date.year)}</p>
      <p className="nb-titlecard-dir">{p.directed}</p>
      {project.tech.length > 0 && (
        <p className="nb-titlecard-with">
          {p.with} {project.tech.join(' · ')}
        </p>
      )}
    </div>
  );
}
