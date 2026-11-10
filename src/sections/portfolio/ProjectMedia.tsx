import { useLanguage } from '../../i18n/LanguageContext';
import type { Project } from '../../data/projects';
import ImageGallery from '../../components/ImageGallery';

// Capturas do projeto (abrem no lightbox). Sem imagens, não renderiza nada:
// nem aviso nem placeholder que possa passar por demonstração real.
export default function ProjectMedia({ project }: { project: Project }) {
  const { t } = useLanguage();

  if (!project.gallery.length) return null;

  const images = project.gallery.map((src, i) => ({
    src,
    alt: t.timeline.screenshot(project.name, i + 1, project.gallery.length),
  }));

  return (
    <ImageGallery
      images={images}
      columns={project.gallery.length > 1 ? 3 : 1}
      className="project-gallery"
    />
  );
}
