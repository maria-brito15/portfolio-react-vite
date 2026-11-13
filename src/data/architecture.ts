// Arquitetura do WhatsApp Dispatcher para o explorador da persona tech
// (docs/specs/experiencias-persona/). Todo fato vem do estudo de caso
// (src/pages/case-study/WhatsAppDispatcher*.tsx): componentes, ligações, decisões e trade-offs.
// Só entram camadas que o estudo descreve: ele não descreve front-end, API HTTP nem
// autenticação, então nada disso aparece. A integração com o WhatsApp está marcada como
// não concluída, porque o próprio estudo diz que o corte de escopo veio antes dela.
// `architecture.test.ts` confere que toda ligação aponta para componentes que existem.
import type { Localized } from '../types';

const L = (pt: string, en: string): Localized => ({ pt, en });

export type LayerId = 'business' | 'background' | 'infra' | 'external';

export interface Layer {
  id: LayerId;
  label: Localized;
}

export const layers: Layer[] = [
  { id: 'business', label: L('Regras de negócio', 'Business rules') },
  { id: 'background', label: L('Processamento em segundo plano', 'Background processing') },
  { id: 'infra', label: L('Infraestrutura', 'Infrastructure') },
  { id: 'external', label: L('Integração externa', 'External integration') },
];

export interface ArchNode {
  id: string;
  layer: LayerId;
  name: Localized;
  // Tecnologias e padrões citados no estudo para este componente.
  tech: string[];
  role: Localized;
  // A decisão por trás dele e o que foi cedido.
  why: Localized;
  tradeoff?: Localized;
  // O que o estudo diz que mudaria em produção.
  production?: Localized;
  // Id da seção do estudo de caso em cada idioma (os ids diferem entre PT e EN).
  anchor: Localized;
  // Marca o que não existe como código ou não foi concluído.
  status?: Localized;
}

export const archNodes: ArchNode[] = [
  {
    id: 'domain',
    layer: 'business',
    name: L('Domínio', 'Domain'),
    tech: ['Domain-Driven Design', 'Finite state machine'],
    role: L(
      'Entidades Contato, Campanha, Fluxo, ExecucaoFluxo e EntregaCampanha, cada uma com suas invariantes. A execução de um fluxo é uma máquina de estados (ativo, pausado, concluído) e a pausa exige um motivo registrado.',
      'The Contact, Campaign, Flow, FlowExecution and CampaignDelivery entities, each with its own invariants. A flow execution is a state machine (active, paused, completed) and pausing requires a recorded reason.',
    ),
    why: L(
      'Campanha acontece e termina; fluxo é contínuo e percorrido por cada pessoa. Separar o roteiro (Fluxo) do progresso de cada pessoa (ExecucaoFluxo) permite cem pessoas na mesma sequência, cada uma em um ponto. A regra do motivo da pausa fica no próprio modelo, não na disciplina de quem escreve o código.',
      'A campaign happens and ends; a flow is continuous and walked by each person. Splitting the script (Flow) from each person’s progress (FlowExecution) allows a hundred people in the same sequence, each at a different point. The pause-reason rule lives in the model itself, not in the discipline of whoever writes the code.',
    ),
    anchor: L('maquina-estados', 'state-machine'),
  },
  {
    id: 'application',
    layer: 'business',
    name: L('Casos de uso e portas', 'Use cases and ports'),
    tech: ['Clean Architecture', 'Hexagonal architecture'],
    role: L(
      'Camada de aplicação. Define as portas de saída (WhatsAppPort, QueuePort, CachePort, DatabasePort) como interfaces e não importa framework HTTP nem driver de banco; a infraestrutura as implementa por injeção de dependência.',
      'The application layer. It defines the output ports (WhatsAppPort, QueuePort, CachePort, DatabasePort) as interfaces and imports no HTTP framework or database driver; infrastructure implements them through dependency injection.',
    ),
    why: L(
      'Testar as regras sem enviar mensagem real e trocar o provedor de mensageria ou o banco sem mexer na regra. O plano previa um teste arquitetural automatizado para verificar a regra de dependência em CI.',
      'To test the rules without sending a real message and to swap the messaging provider or the database without touching the rules. The plan included an automated architecture test to check the dependency rule in CI.',
    ),
    tradeoff: L(
      'Mais partes e mais organização do que um sistema simples exigiria; compensa porque há lógica de negócio que precisa ser confiável e testável isoladamente.',
      'More parts and more organization than a simple system would need; it pays off because there is business logic that must be reliable and testable in isolation.',
    ),
    anchor: L('camadas', 'layers'),
  },
  {
    id: 'scheduler',
    layer: 'background',
    name: L('Organizador (scheduler)', 'Scheduler'),
    tech: ['Redis lock'],
    role: L(
      'Verifica periodicamente o que está pronto para envio (campanhas a iniciar e pessoas em fluxo que chegaram ao momento da próxima mensagem). Processa um lote limitado por vez, marca cada item como "processando" e o enfileira.',
      'Periodically checks what is ready to send (campaigns to start and people in flows who reached the time of the next message). It handles a limited batch at a time, marks each item as "processing" and enqueues it.',
    ),
    why: L(
      'O lock distribuído garante que só uma instância processe cada lote, evitando duplicidade ao rodar várias cópias. O lote limitado evita sobrecarregar a fila de uma vez.',
      'The distributed lock ensures only one instance handles each batch, avoiding duplicates when several copies run. The limited batch avoids flooding the queue at once.',
    ),
    tradeoff: L(
      'Os três processos rodam juntos, no mesmo projeto: menos custo e manutenção agora, mas ainda não escalam de forma independente.',
      'The three processes run together in the same project: less cost and upkeep for now, but they do not yet scale independently.',
    ),
    production: L(
      'Independência total entre os três processos, para escalar cada um conforme a própria demanda.',
      'Full independence among the three processes, so each one scales with its own demand.',
    ),
    anchor: L('workers', 'workers'),
  },
  {
    id: 'sender',
    layer: 'background',
    name: L('Remetente (sender)', 'Sender'),
    tech: ['Strategy Pattern', 'BullMQ worker'],
    role: L(
      'Consome a fila e executa o envio. Antes de enviar, confere se a entrega já foi enviada e descarta a duplicata. Em campanha, só marca a entrega como concluída; em fluxo, também avança a execução e agenda o próximo envio.',
      'Consumes the queue and performs the send. Before sending it checks whether the delivery was already sent and drops duplicates. For a campaign it only marks the delivery as done; for a flow it also advances the execution and schedules the next send.',
    ),
    why: L(
      'Um único ponto decide "o que fazer depois do envio" (Strategy Pattern), em vez de condicionais "se campanha, se fluxo" espalhados pelo worker. A checagem antes de enviar é a segunda camada da idempotência.',
      'A single point decides "what to do after sending" (Strategy Pattern), instead of "if campaign, if flow" conditionals spread through the worker. The check before sending is the second idempotency layer.',
    ),
    production: L(
      'Circuit breaker para uma queda prolongada do WhatsApp e uma dead-letter queue para mensagens que esgotam as tentativas.',
      'A circuit breaker for a prolonged WhatsApp outage and a dead-letter queue for messages that exhaust their attempts.',
    ),
    anchor: L('workers', 'workers'),
  },
  {
    id: 'reconciler',
    layer: 'background',
    name: L('Corretor (reconciliation)', 'Reconciler'),
    tech: ['Periodic polling'],
    role: L(
      'Roda periodicamente atrás de tarefas presas em "processando" além do tempo esperado e as recoloca em nova tentativa. Pausa execuções aparentemente abandonadas e reativa só as pausadas por falha técnica, nunca as pausadas manualmente.',
      'Runs periodically looking for tasks stuck in "processing" beyond the expected time and puts them back for retry. It pauses executions that look abandoned and reactivates only those paused for a technical failure, never the manually paused ones.',
    ),
    why: L(
      'É o mecanismo de autocorreção para falhas silenciosas: processos travam, redes caem, servidores reiniciam no meio de uma operação. Foi feito por polling, e não por eventos, porque um listener exigiria dead letter exchange e TTL de fila, infraestrutura que não se justificava no estágio atual.',
      'It is the self-correction mechanism for silent failures: processes hang, networks drop, servers restart mid-operation. It uses polling, not events, because a listener would need a dead letter exchange and queue TTL, infrastructure that was not justified at the current stage.',
    ),
    tradeoff: L(
      'Mais simples de construir e entender; um problema pode demorar um pouco para ser percebido e corrigido.',
      'Simpler to build and understand; a problem can take a little while to be noticed and fixed.',
    ),
    anchor: L('workers', 'workers'),
  },
  {
    id: 'queue',
    layer: 'infra',
    name: L('Fila de processamento', 'Processing queue'),
    tech: ['BullMQ', 'Redis'],
    role: L(
      'Guarda as mensagens pendentes fora do processo que as consome. Os workers consomem item por item; cada job tem retry configurável, backoff exponencial e limite de tentativas.',
      'Holds pending messages outside the process that consumes them. Workers consume item by item; each job has configurable retry, exponential backoff and an attempt limit.',
    ),
    why: L(
      'Um loop simples não garantiria saber o que já saiu depois de um reinício, exigiria retry com espera crescente escrito do zero e misturaria "decidir quando enviar" com "enviar". A fila separa o produtor (organizador) do consumidor (remetente).',
      'A simple loop would not guarantee knowing what already went out after a restart, would need retry with growing waits written from scratch, and would mix "deciding when to send" with "sending". The queue separates the producer (scheduler) from the consumer (sender).',
    ),
    anchor: L('filas', 'queues'),
  },
  {
    id: 'redis',
    layer: 'infra',
    name: L('Redis: cache e lock', 'Redis: cache and lock'),
    tech: ['Redis'],
    role: L(
      'Dois usos independentes: cache de leitura das contagens de envios e falhas por campanha, invalidado de forma explícita, e o lock distribuído (um mutex com TTL de segurança) usado pelo organizador.',
      'Two independent uses: a read cache for per-campaign sent and failed counts, invalidated explicitly, and the distributed lock (a mutex with a safety TTL) used by the scheduler.',
    ),
    why: L(
      'Sem cache, um painel de acompanhamento geraria consultas repetidas ao banco a cada atualização. Sem o lock, escalar na horizontal traria risco real de processamento duplicado.',
      'Without a cache, a tracking dashboard would hit the database repeatedly on every refresh. Without the lock, scaling horizontally would bring a real risk of duplicate processing.',
    ),
    tradeoff: L(
      'Implementação simples do lock, sem fencing tokens: é uma limitação conhecida e documentada.',
      'The lock is a simple implementation without fencing tokens: a known, documented limitation.',
    ),
    production: L(
      'Fencing tokens no lock distribuído, para impedir que quem perdeu a posse sem perceber ainda aja.',
      'Fencing tokens on the distributed lock, to stop someone who lost ownership without noticing from still acting.',
    ),
    anchor: L('cache-lock', 'cache-lock'),
  },
  {
    id: 'db',
    layer: 'infra',
    name: L('Banco de dados', 'Database'),
    tech: ['PostgreSQL', 'Prisma'],
    role: L(
      'Persiste contatos, campanhas, fluxos, execuções, entregas e a auditoria. Uma restrição única de campanha e contato torna a entrega duplicada impossível; a remoção é um soft delete (deletado_em) que preserva o histórico; a tabela de Auditoria só recebe inclusões, com um payload JSON por evento.',
      'Persists contacts, campaigns, flows, executions, deliveries and the audit log. A unique constraint on campaign and contact makes a duplicate delivery impossible; removal is a soft delete (deletado_em) that keeps history; the Audit table is append-only, with one JSON payload per event.',
    ),
    why: L(
      'A idempotência é garantida em duas camadas: a restrição no banco e a checagem do remetente. O soft delete mantém a possibilidade de auditar o que foi enviado a um contato no passado.',
      'Idempotency is guaranteed in two layers: the database constraint and the sender’s check. Soft delete keeps the ability to audit what was sent to a contact in the past.',
    ),
    tradeoff: L(
      'Um único formato de auditoria para todo tipo de evento: menos estrutura para manter, consulta de um tipo específico um pouco menos otimizada.',
      'A single audit format for every kind of event: less structure to maintain, a slightly less optimized query for one specific type.',
    ),
    anchor: L('idempotencia', 'idempotency'),
  },
  {
    id: 'whatsapp',
    layer: 'external',
    name: L('API do WhatsApp', 'WhatsApp API'),
    tech: [],
    role: L(
      'O serviço externo que o remetente aciona para entregar a mensagem. O limite de velocidade de envio é um dos problemas centrais: os envios precisam ser espaçados, com pausas variáveis, para o número não ser bloqueado.',
      'The external service the sender calls to deliver the message. The sending speed limit is one of the central problems: sends must be spaced out, with variable pauses, so the number is not blocked.',
    ),
    why: L(
      'O núcleo do desafio é manter o sistema íntegro diante de falhas parciais, reinícios e limites externos, não o envio em si.',
      'The core of the challenge is keeping the system sound under partial failures, restarts and external limits, not the sending itself.',
    ),
    status: L(
      'Integração não concluída: o corte de escopo da implementação original veio antes de fechá-la.',
      'Integration not finished: the original implementation’s scope cut came before closing it.',
    ),
    anchor: L('problema', 'problem'),
  },
];

export type EdgeKind = 'flow' | 'implements';

export interface ArchEdge {
  from: string;
  to: string;
  kind: EdgeKind;
  label: Localized;
}

export const archEdges: ArchEdge[] = [
  {
    from: 'scheduler',
    to: 'db',
    kind: 'flow',
    label: L(
      'seleciona o que está pronto e marca como "processando"',
      'selects what is ready and marks it "processing"',
    ),
  },
  {
    from: 'scheduler',
    to: 'redis',
    kind: 'flow',
    label: L(
      'obtém o lock distribuído para processar um lote',
      'takes the distributed lock to process a batch',
    ),
  },
  {
    from: 'scheduler',
    to: 'queue',
    kind: 'flow',
    label: L('enfileira os itens do lote', 'enqueues the batch items'),
  },
  {
    from: 'queue',
    to: 'sender',
    kind: 'flow',
    label: L('entrega os itens para consumo', 'hands items over for consumption'),
  },
  {
    from: 'sender',
    to: 'whatsapp',
    kind: 'flow',
    label: L('envia a mensagem', 'sends the message'),
  },
  {
    from: 'sender',
    to: 'db',
    kind: 'flow',
    label: L(
      'confere se já foi enviada, registra o resultado e avança o fluxo',
      'checks whether it was already sent, records the result and advances the flow',
    ),
  },
  {
    from: 'reconciler',
    to: 'db',
    kind: 'flow',
    label: L(
      'procura itens presos e execuções abandonadas',
      'looks for stuck items and abandoned executions',
    ),
  },
  {
    from: 'db',
    to: 'application',
    kind: 'implements',
    label: L('implementa DatabasePort', 'implements DatabasePort'),
  },
  {
    from: 'queue',
    to: 'application',
    kind: 'implements',
    label: L('implementa QueuePort', 'implements QueuePort'),
  },
  {
    from: 'redis',
    to: 'application',
    kind: 'implements',
    label: L('implementa CachePort', 'implements CachePort'),
  },
  {
    from: 'whatsapp',
    to: 'application',
    kind: 'implements',
    label: L('implementa WhatsAppPort', 'implements WhatsAppPort'),
  },
];

export const archNodeById = (id: string) => archNodes.find((n) => n.id === id);

// Ligações de um componente, nos dois sentidos.
export function edgesOf(id: string) {
  return {
    out: archEdges.filter((e) => e.from === id),
    in: archEdges.filter((e) => e.to === id),
  };
}
