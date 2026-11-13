import { useState } from 'react';
import { Link } from '../../router';
import { useLanguage } from '../../i18n/LanguageContext';
import { routeById } from '../../data/routes';
import {
  archEdges,
  archNodeById,
  archNodes,
  edgesOf,
  layers,
  type ArchEdge,
} from '../../data/architecture';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import SectionTitle from '../../components/ui/SectionTitle';
import type { BlockProps } from '../../components/dashboard/blockProps';

const TEXT = {
  pt: {
    title: 'Explorador de arquitetura',
    lead: 'WhatsApp Dispatcher, o projeto com o raciocínio de arquitetura documentado. Escolha um componente para ver a responsabilidade dele, as ligações e por que foi feito assim.',
    pick: 'Escolha um componente do diagrama.',
    legend: 'Cada botão é um componente; os destacados se ligam ao selecionado.',
    role: 'Responsabilidade',
    why: 'Por que assim',
    tradeoff: 'O que foi cedido',
    production: 'O que mudaria em produção',
    sends: 'Aciona',
    receives: 'É acionado ou implementado por',
    none: 'sem ligação direta descrita no estudo',
    readCase: 'Ler esta parte no estudo de caso',
    fullCase: 'Estudo de caso completo',
    github: 'GitHub da Duda',
    noRepo:
      'O portfólio não registra um repositório público para este projeto, e a implementação original é parcial. O GitHub aponta para o perfil.',
    textual: 'Descrição em texto do diagrama',
    textualLead: 'As mesmas ligações do diagrama, em lista.',
    notice:
      'O estudo de caso não descreve front-end, API HTTP nem autenticação; por isso essas camadas não aparecem.',
  },
  en: {
    title: 'Architecture explorer',
    lead: 'WhatsApp Dispatcher, the project with its architecture reasoning documented. Pick a component to see its responsibility, its connections and why it was built that way.',
    pick: 'Pick a component from the diagram.',
    legend: 'Each button is a component; highlighted ones connect to the selected one.',
    role: 'Responsibility',
    why: 'Why it is this way',
    tradeoff: 'What was given up',
    production: 'What would change in production',
    sends: 'Calls',
    receives: 'Is called or implemented by',
    none: 'no direct connection described in the study',
    readCase: 'Read this part in the case study',
    fullCase: 'Full case study',
    github: "Duda's GitHub",
    noRepo:
      'The portfolio lists no public repository for this project, and the original implementation is partial. GitHub points to the profile.',
    textual: 'Text description of the diagram',
    textualLead: 'The same connections as the diagram, as a list.',
    notice:
      'The case study does not describe a front end, an HTTP API or authentication, so those layers are not shown.',
  },
};

export default function ArchitectureExplorer({ heading, lead }: BlockProps) {
  const { lang } = useLanguage();
  const text = TEXT[lang];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? archNodeById(selectedId) : undefined;
  const links = selectedId ? edgesOf(selectedId) : undefined;
  const related = new Set(
    links ? [...links.out.map((e) => e.to), ...links.in.map((e) => e.from)] : [],
  );
  const caseStudy = routeById('whatsapp-dispatcher')?.path ?? '/projetos';
  const name = (id: string) => archNodeById(id)?.name[lang] ?? id;

  const edgeLine = (e: ArchEdge) => (
    <>
      {name(e.from)} → {name(e.to)}: {e.label[lang]}
    </>
  );

  const connection = (e: ArchEdge, other: string) => (
    <li key={`${e.from}-${e.to}`}>
      <button type="button" className="arch-jump" onClick={() => setSelectedId(other)}>
        {name(other)}
      </button>
      <span className="t-dim"> {e.label[lang]}</span>
    </li>
  );

  return (
    <section className="dash-section exp-block" aria-labelledby="arch-title" data-tone="violet">
      <SectionTitle as="h2" id="arch-title" size="md">
        {heading ?? text.title}
      </SectionTitle>
      <p className="t-dim">{lead ?? text.lead}</p>
      <p className="t-dim arch-legend">{text.legend}</p>

      <ol className="arch-layers">
        {layers.map((layer) => (
          <li key={layer.id} className="arch-layer">
            <h3 className="arch-layer-name">{layer.label[lang]}</h3>
            <ul className="arch-nodes">
              {archNodes
                .filter((n) => n.layer === layer.id)
                .map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="arch-node"
                      aria-pressed={n.id === selectedId}
                      aria-controls="arch-detail"
                      data-related={related.has(n.id) || undefined}
                      data-pending={n.status ? true : undefined}
                      onClick={() => setSelectedId(n.id === selectedId ? null : n.id)}
                    >
                      <span className="arch-node-name">{n.name[lang]}</span>
                      {n.tech.length > 0 && (
                        <span className="arch-node-tech">{n.tech.join(' · ')}</span>
                      )}
                    </button>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>

      <Card as="div" id="arch-detail" className="arch-detail" aria-live="polite">
        {selected && links ? (
          <>
            <h3>{selected.name[lang]}</h3>
            <p className="arch-tech">
              {selected.tech.map((t) => (
                <Chip key={t} accent="violet">
                  {t}
                </Chip>
              ))}
            </p>
            {selected.status && <p className="arch-status">{selected.status[lang]}</p>}
            <dl className="arch-facts">
              <dt>{text.role}</dt>
              <dd>{selected.role[lang]}</dd>
              <dt>{text.why}</dt>
              <dd>{selected.why[lang]}</dd>
              {selected.tradeoff && (
                <>
                  <dt>{text.tradeoff}</dt>
                  <dd>{selected.tradeoff[lang]}</dd>
                </>
              )}
              {selected.production && (
                <>
                  <dt>{text.production}</dt>
                  <dd>{selected.production[lang]}</dd>
                </>
              )}
            </dl>
            <div className="dash-split">
              <div>
                <h4>{text.sends}</h4>
                {links.out.length ? (
                  <ul className="link-list">{links.out.map((e) => connection(e, e.to))}</ul>
                ) : (
                  <p className="t-dim">{text.none}</p>
                )}
              </div>
              <div>
                <h4>{text.receives}</h4>
                {links.in.length ? (
                  <ul className="link-list">{links.in.map((e) => connection(e, e.from))}</ul>
                ) : (
                  <p className="t-dim">{text.none}</p>
                )}
              </div>
            </div>
            <Link to={`${caseStudy}#${selected.anchor[lang]}`}>{text.readCase} →</Link>
          </>
        ) : (
          <p className="t-dim">{text.pick}</p>
        )}
      </Card>

      <p className="arch-links">
        <Link to={caseStudy} className="dash-btn dash-btn--primary">
          {text.fullCase}
        </Link>
        <Link to={routeById('github')?.path ?? '/github'} className="dash-btn">
          {text.github}
        </Link>
      </p>
      <p className="t-dim">{text.noRepo}</p>
      <p className="t-dim">{text.notice}</p>

      <details className="arch-textual">
        <summary>{text.textual}</summary>
        <p className="t-dim">{text.textualLead}</p>
        <ul>
          {archEdges.map((e) => (
            <li key={`${e.from}-${e.to}-${e.kind}`}>{edgeLine(e)}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
