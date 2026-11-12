import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { projects } from '../data/projects';
import SiteShell from '../components/shell/SiteShell';
import GithubStats from '../components/GithubStats';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import SectionTitle from '../components/ui/SectionTitle';

// Detalhe do GitHub: os números ao vivo (mesmo painel da página Sobre) e os
// repositórios públicos dos projetos do portfólio. Tudo vem de dados reais:
// a API do GitHub e `data/projects.tsx`.
export default function GithubPage() {
  const { lang, t } = useLanguage();
  const g = t.ws.github;
  const withRepo = projects.filter((p) => p.repo);

  useDocumentMeta('github');

  return (
    <SiteShell routeId="github">
      <section className="sec github-page" aria-labelledby="gh-page-title">
        <h1 id="gh-page-title" className="sr-only">
          GitHub
        </h1>
        <GithubStats />
        <SectionTitle as="h2" id="gh-repos-title" size="md">
          {g.repos}
        </SectionTitle>
        <p className="t-dim">{g.reposLead}</p>
        <ul className="repo-list" aria-labelledby="gh-repos-title">
          {withRepo.map((p) => (
            <li key={p.id}>
              <Card as="article" className="repo-card">
                <h3>{p.name}</h3>
                <p className="repo-badge t-dim">{p[lang].badge}</p>
                <p className="repo-tech">
                  {p.tech.map((tech) => (
                    <Chip key={tech}>{tech}</Chip>
                  ))}
                </p>
                <a href={p.repo ?? undefined} target="_blank" rel="noopener noreferrer">
                  {g.open}
                </a>
              </Card>
            </li>
          ))}
        </ul>
        <p className="t-dim">{g.note}</p>
      </section>
    </SiteShell>
  );
}
