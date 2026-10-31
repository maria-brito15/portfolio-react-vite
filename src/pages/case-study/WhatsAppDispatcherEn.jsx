import { Link } from '../../router';

// Conteúdo original convertido de HTML para JSX (texto preservado sem alterações).
export default function WhatsAppDispatcherEn() {
  return (
    <div className="case-shell">
      <aside className="case-toc">
        <div className="case-toc-label">In this case study</div>
        <ol>
          <li>
            <a href="#context">Context and Scope</a>
          </li>
          <li>
            <a href="#problem">The Real Problem</a>
          </li>
          <li>
            <a href="#language">Domain Language</a>
          </li>
          <li>
            <a href="#modeling">Campaign vs. Flow</a>
          </li>
          <li>
            <a href="#state-machine">How an Execution Behaves</a>
          </li>
          <li>
            <a href="#layers">Why Layered Separation</a>
          </li>
          <li>
            <a href="#queues">Async Processing</a>
          </li>
          <li>
            <a href="#workers">The Three Workers</a>
          </li>
          <li>
            <a href="#idempotency">Idempotency and Delivery</a>
          </li>
          <li>
            <a href="#cache-lock">Redis: Cache and Lock</a>
          </li>
          <li>
            <a href="#persistence">Persistence and Auditing</a>
          </li>
          <li>
            <a href="#trade-offs">Trade-offs Accepted</a>
          </li>
          <li>
            <a href="#production">Toward Real Production</a>
          </li>
          <li>
            <a href="#glossary">Glossary</a>
          </li>
        </ol>
      </aside>
      <div>
        <Link to="/#projetos" className="case-back">
          ← Back to projects
        </Link>
        <div className="case-meta">
          <span className="proj-bdg case">Case Study · Internship Technical Challenge</span>
        </div>
        <h1 className="case-title">WhatsApp Dispatcher</h1>
        <p className="case-sub">
          Record of the architectural reasoning behind a WhatsApp message dispatch system, campaigns
          and automated flows. The focus is on decisions: why each part of the system exists, the
          specific problem it solves, and what was deliberately left out, not on the implementation
          itself, which is partial. Each section pairs a plain-language explanation with a technical
          block covering the formal terms and patterns behind the decision.
        </p>
        <aside className="case-scope" aria-labelledby="scope-title">
          <h2 id="scope-title">Scope of this material</h2>
          <dl>
            <dt>Original implementation</dt>
            <dd>
              A response to an internship technical challenge. The implementation is partial and is
              the only part that exists as code.
            </dd>
            <dt>Later analyses</dt>
            <dd>
              The architectural reasoning documented on this page was written afterwards, about what
              was built and what was left out.
            </dd>
            <dt>Possible evolutions</dt>
            <dd>
              Spec-Driven Development, agentic development or n8n are paths that{' '}
              <strong>could</strong> be explored. None of them has been implemented.
            </dd>
          </dl>
        </aside>
        <div className="case-body">
          <h2 id="context">Context and scope</h2>
          <p>
            The project starts from a deliberately small problem: a WhatsApp message dispatcher, the
            kind used for marketing campaigns or automatic message sequences, such as a payment
            reminder or a "we miss you" message a few days after a customer goes quiet. The reduced
            scope makes it possible to design the entire architecture carefully, without the volume
            of product detail getting in the way of the structural decisions.
          </p>
          <p>
            Despite the small size, the domain concentrates real complexity: many messages going out
            at once, partial failures expected as a normal part of operation, and the requirement
            that the system stay consistent even when some part of it fails along the way. These are
            the same kinds of challenges present in larger-scale messaging systems, concentrated
            into a surface small enough to justify each decision in writing.
          </p>
          <div className="case-callout">
            The goal of this document is to record architectural decisions: which problems each one
            solves, which alternatives were discarded and why, and where the scope was deliberately
            limited. It is not a demonstration of a system working end to end.
          </div>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> Planning followed a nine-phase plan inspired by strategic and tactical{' '}
            <strong>
              <em>Domain-Driven Design*</em>
            </strong>
            :{' '}
            <strong>
              <em>event storming*</em>
            </strong>{' '}
            and{' '}
            <strong>
              <em>bounded context*</em>
            </strong>{' '}
            definition before any code, followed by entity modeling, contract definition between
            layers (<code>ports</code> and <code>adapters</code>, in the spirit of{' '}
            <strong>
              <em>hexagonal architecture*</em>
            </strong>
            ), and only then infrastructure implementation. The scope cutoff happened at the point
            where the domain, the data schema (Prisma/PostgreSQL) and the port contracts were
            already designed and mostly implemented, before closing the external integration with
            the WhatsApp API.
          </div>
          <h2 id="problem">The real problem</h2>
          <p>
            A WhatsApp dispatch system sounds simple at first: a list of contacts, a message, sent
            to everyone. In practice, that statement hides four distinct problems that each require
            their own solution.
          </p>
          <p>
            The first is send-rate limiting. A number sending thousands of messages within a few
            minutes can be read as suspicious behavior and get blocked by the platform itself, the
            same way a credit card gets flagged and blocked after registering too many purchases in
            rapid succession. That requires spacing sends out with variable pauses between messages,
            rather than firing everything at once.
          </p>
          <p>
            The second is the existence of automatic sequences, called flows here: a welcome
            sequence with a message on day one, a tip on day three, an offer on day seven. That
            requires the system to track, for each person, the exact point in the sequence they are
            at, in a way that's resilient to restarts and instability along the way.
          </p>
          <p>
            The third is partial failure as expected behavior, not an exception. A campaign sent to
            a thousand contacts has a predictable fraction of failures (a nonexistent number, a
            momentary network hiccup) while the rest gets delivered without issue. The system needs
            to isolate those failures without stalling what's working normally.
          </p>
          <p>
            The fourth is the risk of tasks getting stuck halfway: a message marked "processing" at
            the exact moment the responsible process crashes or restarts, left stuck in that state
            with nobody actually processing it.
          </p>
          <p>
            The core of the challenge is keeping the system consistent in the face of partial
            failures, restarts, and external limits imposed by the messaging platform, not the act
            of sending a message itself.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> The four problems described correspond to classic concerns in distributed
            systems:{' '}
            <strong>
              <em>rate limiting*</em>
            </strong>{' '}
            (to avoid the number getting blocked by the platform itself),{' '}
            <strong>long-running state management</strong> in asynchronous processes with multi-day
            delays between steps, <strong>partial failure tolerance</strong> in batch processing,
            and <strong>orphaned job recovery</strong> (tasks stuck in an intermediate state due to
            process crashes). None of these problems is solved by the WhatsApp integration itself;
            all of them are the responsibility of the orchestration layer.
          </div>
          <h2 id="language">Domain language</h2>
          <p>
            Before any technical decision, domain terms were defined precisely. The goal is to
            prevent the same word from meaning different things in different parts of the system,
            which creates structural ambiguity and bugs that are hard to trace.
          </p>
          <div className="case-table-wrap">
            <table className="case-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>What it means here</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Contact</strong>
                  </td>
                  <td>
                    The person receiving messages, identified by phone number. Removing a contact
                    does not delete it from the system; it gets marked as removed, preserving the
                    history of what was already sent.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Campaign</strong>
                  </td>
                  <td>
                    A single dispatch of the same message to a group of contacts, like a promotion
                    sent once. After sending, the campaign is closed and doesn't repeat
                    automatically.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Flow</strong>
                  </td>
                  <td>
                    A sequence of scheduled messages, each with its own wait time, like a welcome
                    sequence. Unlike a campaign, a flow doesn't happen all at once; each person
                    moves through it at their own pace.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Flow execution</strong>
                  </td>
                  <td>
                    The record of a specific person going through a specific flow, tracking which
                    message in the sequence they're on and whether it's active, paused, or already
                    completed.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Delivery</strong>
                  </td>
                  <td>
                    The record of an attempt to send a campaign message to a specific person, with
                    the result, the number of attempts, and the failure reason, when applicable.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            The separation between campaign and flow matters more than it looks. Both send messages,
            which would make it tempting to treat them as the same structure under the hood. The
            behavior, however, is distinct: a campaign happens and ends; a flow is ongoing and
            traversed individually by each person. Merging both concepts into a single structure
            would be a classic modeling mistake, forcing two different concepts into the same box
            because they look similar at first glance.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> This step corresponds to building the domain's{' '}
            <strong>
              <em>ubiquitous language*</em>
            </strong>
            , in Eric Evans's vocabulary: terms that hold both in code and in conversation with
            business stakeholders, with no translation in between. <code>Contact</code>,{' '}
            <code>Campaign</code>, <code>Flow</code>, <code>FlowExecution</code>, and{' '}
            <code>CampaignDelivery</code> are the core domain entities, each with its own
            invariants. <code>Contact</code> and <code>Flow</code> use{' '}
            <strong>
              <em>soft delete*</em>
            </strong>{' '}
            via a <code>deleted_at</code> field, preserving referential integrity with history.
          </div>
          <h2 id="modeling">Campaign vs. Flow, in practice</h2>
          <div className="case-example">
            <span className="case-example-label">Campaign example</span>
            <p>
              Notifying a thousand contacts about a promotion ending the same day. The campaign is
              created, sending starts with pauses between dispatches, and it ends within a few
              hours. It doesn't run again unless a new campaign is created from scratch.
            </p>
          </div>
          <div className="case-example">
            <span className="case-example-label">Flow example</span>
            <p>
              Every new customer receives, over a week, three messages: welcome the same day, a
              usage tip on day three, a coupon on day seven. Each customer starts that journey at
              their own moment. Two customers can be in the same flow, at different points in it,
              and the system needs to track that individually for each one.
            </p>
          </div>
          <p>
            The central modeling detail is the separation between the flow (the script, the general
            instructions) and the flow execution (a specific person's progress through that script).
            Without that separation, it would be impossible to have a hundred people in the same
            welcome sequence, each at a different point, which is exactly the expected behavior in
            practice.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> In the relational model, <code>Contact</code> has a one-to-many cardinality with{' '}
            <code>CampaignDelivery</code> and with <code>FlowExecution</code>. <code>Flow</code>{' '}
            contains an ordered collection of <code>FlowStep</code> (<code>order</code> field), and
            each <code>FlowExecution</code> references a <code>Flow</code> and a{' '}
            <code>Contact</code>, storing <code>current_step</code> as a position pointer. That
            separation between definition (<code>Flow</code>) and execution instance (
            <code>FlowExecution</code>) follows the same principle behind distinguishing a class
            from its instances, or a process template from a concrete execution of it (BPMN would
            call this process definition vs. process instance).
          </div>
          <h2 id="state-machine">How an execution behaves</h2>
          <p>
            Tracking a flow execution's progress is the most central part of the system. At any
            moment, it needs to answer: is the execution advancing normally? If it stopped, why? Can
            it resume on its own, or does it depend on manual intervention?
          </p>
          <p>
            This was modeled as three possible states. An execution can be <strong>active</strong>,
            advancing normally from one message to the next as time passes; <strong>paused</strong>,
            when a message failed to send or when an operator paused that person manually, for
            example at the contact's own request; or <strong>completed</strong>, once every message
            in the sequence has been delivered.
          </p>
          <p>
            The critical point is the reason recorded alongside the pause: technical failure during
            sending, abandonment detected by the system itself, or a manual pause requested by an
            operator. That distinction determines what can happen next. A pause due to a passing
            technical failure allows automatic reactivation after a wait period. A manual pause
            should not be reverted automatically, at the risk of overriding an operator's explicit
            decision.
          </p>
          <p>
            That rule was placed at the core of the flow execution definition itself, not in a
            separate, distant layer. In practice, that makes it structurally impossible for an
            execution to exist "paused" without a recorded reason, and impossible to automatically
            reactivate something that was paused manually. The constraint is embedded in the data
            model, rather than depending on the discipline of whoever writes the code.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> <code>FlowExecution</code> is a{' '}
            <strong>
              <em>finite state machine*</em>
            </strong>{' '}
            with three states (<code>ACTIVE</code>, <code>PAUSED</code>, <code>COMPLETED</code>) and
            transitions controlled by domain methods (<code>pause</code>, <code>reactivate</code>,{' '}
            <code>advance_step</code>, <code>complete</code>), not by direct field assignment. The{' '}
            <code>pause_reason</code> field (<code>failure</code>, <code>manual</code>,{' '}
            <code>abandoned</code>) is required whenever <code>status = PAUSED</code>, an invariant
            validated in the entity's constructor and transition methods, not in an external
            validation layer: the entity refuses to exist in an inconsistent state, in the spirit of
            "always-valid domain model" (Vaughn Vernon).
          </div>
          <h2 id="layers">Why split the system into layers</h2>
          <p>
            One of the most important structural decisions in the project was organizing the code
            into clearly separated parts, following a simple rule: the business rules layer should
            not depend on how the system is technically connected to the outside world.
          </p>
          <p>
            The analogy is a company defining a customer service policy (business rule) without
            worrying whether the channel is phone, WhatsApp, or email (infrastructure). The rule is
            defined at one level; its concrete execution, at another. In the system, the decision of
            when a campaign should start, how a flow advances, and what to do when a send fails does
            not depend on knowing whether, underneath, there's WhatsApp, another messaging tool, or
            a different database.
          </p>
          <p>The concrete reasons for paying that complexity cost:</p>
          <ul>
            <li>
              <strong>Isolated testability.</strong> Business rules can be verified without sending
              a real message, making tests fast and independent of unstable external services.
            </li>
            <li>
              <strong>Infrastructure swaps without rule rework.</strong> Changing the messaging
              provider or the database stays contained in a specific layer, with no change required
              in business logic.
            </li>
            <li>
              <strong>Cost proportional to the problem.</strong> For a simple system, this
              separation would be unnecessary complication. It's justified when there's business
              logic that needs to be reliable and testable in isolation, which is the case here.
            </li>
          </ul>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> The structure follows{' '}
            <strong>
              <em>Clean Architecture*</em>
            </strong>{' '}
            / <strong>hexagonal architecture</strong>, with a single dependency rule: inner layers
            never import from outer layers. The <code>application</code> layer defines{' '}
            <strong>
              <em>output ports*</em>
            </strong>{' '}
            (<code>WhatsAppPort</code>, <code>QueuePort</code>, <code>CachePort</code>,{' '}
            <code>DatabasePort</code>) as interfaces; the <code>infrastructure</code> layer
            implements them via{' '}
            <strong>
              <em>dependency injection*</em>
            </strong>
            , never the other way around. The work plan included an automated architectural test
            (dependency-cruiser or equivalent) verifying that the use-case layer imports no symbol
            from an HTTP framework or database driver, making the dependency rule enforceable in CI
            rather than just a documented convention.
          </div>
          <h2 id="queues">Why use a processing queue</h2>
          <p>
            The simplest alternative would be checking periodically what needs to be sent and
            processing everything in sequence inside the same program. That approach fails on three
            points: there's no guarantee of knowing which messages already went out if the process
            restarts mid-check; external instability would require its own retry logic with
            increasing wait times, built from scratch; and mixing "deciding when to send" with
            "actually sending" in the same block of code makes it harder to test each part in
            isolation.
          </p>
          <p>
            A{' '}
            <strong>
              <em>processing queue*</em>
            </strong>{' '}
            solves all three points at once. Each pending message enters a waiting queue, and a
            group of{' '}
            <strong>
              <em>workers*</em>
            </strong>{' '}
            consumes that queue item by item, each one acting like a bank teller serving customers
            in order, so having several workers running at once is what lets the system serve more
            people per minute instead of stacking everything behind a single person. If a worker
            fails, the message stays in the queue to be picked up by another, instead of getting
            lost, the same way the person holding ticket 42 still gets called by a different teller
            if the first one has to step away mid-service.
          </p>
          <p>
            Two other pieces make that machinery run without accidents. The{' '}
            <strong>
              <em>concurrency*</em>
            </strong>{' '}
            of several workers running at the same time creates the risk of two of them calling the
            same ticket number by accident and serving the same person twice, a risk only eliminated
            by the{' '}
            <strong>
              <em>distributed lock*</em>
            </strong>{' '}
            explained further below. And{' '}
            <strong>
              <em>exponential backoff*</em>
            </strong>{' '}
            is the logic behind retrying after a failure, increasing the wait time with each
            unsuccessful attempt instead of hammering away nonstop, the same instinct as someone
            calling a busy number who waits longer and longer between redials instead of trying
            every second, so as not to make a possibly temporary problem worse.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> The queue is implemented with <strong>BullMQ over Redis</strong>, chosen for
            offering per-job configurable retry with native <strong>exponential backoff</strong>, an
            attempt limit, and queue-state persistence outside the process consuming it. That solves
            the three problems above: concurrency wouldn't be guaranteed in a simple{' '}
            <code>setInterval</code> loop, backoff would require manual implementation, and the
            separation between producer (scheduler) and consumer (worker) decouples the scheduling
            decision from send execution, allowing each side to scale and be tested independently.
          </div>
          <h2 id="workers">The three processes doing the heavy lifting</h2>
          <p>
            Processing was split into three single-responsibility processes, following the{' '}
            <strong>
              <em>separation of concerns*</em>
            </strong>{' '}
            principle.
          </p>
          <h3>The organizer (scheduler)</h3>
          <p>
            Responsible for periodically checking what's ready to send: campaigns to start, people
            in flows who've reached the point of their next message. It processes a limited batch at
            a time, avoiding overloading the queue all at once, and marks each item as "processing"
            before enqueuing it.
          </p>
          <p>
            Concurrency across multiple organizer instances is controlled by a{' '}
            <strong>distributed lock</strong>: only whoever holds the lock processes a given batch
            at that moment, preventing two instances from picking up the same task and creating
            duplicates, the same way a single shared bathroom key guarantees only one person has
            access at a time, even if several people try the door at once.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> The scheduler runs in a continuous loop with a{' '}
            <strong>Redis-based distributed lock</strong> (a pattern similar to{' '}
            <strong>
              <em>Redlock*</em>
            </strong>
            ), guaranteeing mutual exclusion across multiple worker instances. It respects a maximum{' '}
            <code>BATCH_SIZE</code> per cycle and marks selected items as <code>processing</code>{' '}
            before enqueuing them, creating an intermediate state window that the reconciliation
            worker later audits.
          </div>
          <h3>The sender</h3>
          <p>
            Consumes the queue and performs the actual send through WhatsApp. Post-send behavior
            differs by type: for a campaign, it just marks the delivery as completed; for a flow, it
            also advances the execution to the next step and schedules the next send.
          </p>
          <p>
            To avoid scattering "if it's a campaign do this, if it's a flow do that" across the
            codebase, the sender uses the{' '}
            <strong>
              <em>Strategy Pattern*</em>
            </strong>
            : there's a single point that triggers "what to do after sending", and what actually
            happens depends on which behavior was plugged in for that type of task, similar to a
            universal power outlet whose socket shape is always the same, while the appliance
            plugged into it decides what happens once the power flows.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> The sender uses the <strong>Strategy Pattern</strong> to differentiate the{' '}
            <code>Campaign</code> handler from the <code>Flow</code> handler: the same execution
            interface, with different post-send behavior injected at runtime, avoiding conditionals
            scattered across the worker's code.
          </div>
          <h3>The reconciler</h3>
          <p>
            Runs periodically looking for silent failures: tasks stuck "processing" longer than
            expected, a sign something got stuck along the way, which get put back into a retryable
            state. It also identifies apparently abandoned flow executions, pausing them, and
            automatically reactivates only the ones paused due to a technical failure, never the
            manually paused ones, after a wait interval. Running at fixed intervals like this, known
            as{' '}
            <strong>
              <em>periodic polling*</em>
            </strong>
            , is quite different from reacting to a real-time alert: it's the difference between
            someone walking by every hour to check if a pot was left on the stove and a kitchen with
            an alarm that goes off the moment something burns (that second case is what's called
            event-driven); the second option reacts faster but requires installing and maintaining
            the alarm, while the first is simpler to set up at the cost of a delay between the
            problem happening and someone noticing.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> Reconciliation via <strong>periodic polling</strong> (not event-driven), scanning
            by <code>updated_at</code> older than a configurable <code>TIMEOUT_THRESHOLD</code>.
            It's a deliberately simple choice: an event-driven listener would react faster, but
            would require additional infrastructure such as a{' '}
            <strong>
              <em>dead letter exchange*</em>
            </strong>{' '}
            (a kind of "sorting center" that the message broker itself uses to automatically
            redirect problematic messages, without manual intervention) and a{' '}
            <strong>
              <em>queue TTL*</em>
            </strong>{' '}
            (an automatic expiration date: if an item sits there too long, it expires and gets
            removed or redirected on its own, the same way an expired product gets pulled off a
            store shelf), infrastructure that wasn't justified at this stage of the project.
          </div>
          <div className="case-callout">
            The reconciler exists because, in systems processing tasks at volume, it's naive to
            assume every operation finishes cleanly, with either success or an explicit error.
            Processes crash, networks drop, servers restart mid-operation. The reconciler is the
            system's self-correction mechanism for that kind of silent failure.
          </div>
          <h2 id="idempotency">Making sure nobody gets the same message twice</h2>
          <p>
            <strong>
              <em>Idempotency*</em>
            </strong>{' '}
            in delivery is treated as non-negotiable, resolved through two complementary layers.
          </p>
          <p>
            The first is a constraint in the database itself: the existence of two delivery records
            for the same campaign-and-contact combination is structurally impossible, guaranteed by
            the data model, not by code discipline.
          </p>
          <p>
            The second happens at send time: before sending, the sender checks whether that delivery
            was already marked as sent, discarding the attempt as a duplicate if so. That covers the
            scenario of the same task entering the queue twice due to a technical failure.
          </p>
          <p>
            Every send attempt also records how many times it's been tried and the failure reason,
            allowing permanent failures (a nonexistent number) to be distinguished from transient
            ones (network instability), avoiding wasted retries on cases that clearly won't resolve.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> Idempotency is guaranteed at two layers: a{' '}
            <code>@@unique([campaign_id, contact_id])</code> constraint in the schema (and
            equivalent for <code>FlowExecution</code>), making duplication structurally impossible
            at the database level, and a status check in the worker before processing (an
            application-level <strong>idempotency check</strong>) to cover duplicate messages in the
            queue under retry scenarios. The <code>attempts</code> and <code>last_error</code>{' '}
            fields on <code>CampaignDelivery</code> allow distinguishing permanent from transient
            failure, avoiding blind retries.
          </div>
          <h2 id="cache-lock">Two different jobs for the same tool</h2>
          <p>
            Redis fills two distinct roles in the system, worth explaining separately so it doesn't
            come across as a single magic solution.
          </p>
          <p>
            The first is a read cache for numbers that are expensive to recalculate on every query,
            such as counts of sent and failed messages per campaign. Without caching, a monitoring
            dashboard would generate repeated database queries on every screen refresh. The value
            stays cached for a short period and is invalidated when something actually changes, like
            doing a tricky mental calculation once and writing the answer on a sticky note: next
            time someone asks, you just glance at the sticky note instead of redoing the whole
            calculation, and the note only gets thrown out and redone when something actually
            changes.
          </p>
          <p>
            The second is the <strong>distributed lock</strong> used by the organizer, guaranteeing
            that only one instance processes each batch of tasks at a time, even with multiple
            instances running simultaneously, the same idea as the single shared bathroom key
            mentioned earlier: only whoever holds the key can act, and everyone else waits for it to
            be returned before trying. Without this mechanism, scaling the system horizontally would
            introduce a real risk of duplicate processing, exactly the problem the idempotency
            guarantee tries to eliminate.
          </p>
          <p>
            These are two independent uses of the same tool, like a single knife used both to chop
            vegetables and to open a box: Redis here isn't a single magic solution, it's just a
            database fast enough to serve two different purposes within the system.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> Read cache with <strong>explicit invalidation</strong> (not blind TTL) via a
            dedicated endpoint, for aggregated status counts per campaign. The distributed lock is a{' '}
            <strong>
              <em>Redis-based mutex*</em>
            </strong>{' '}
            with a safety TTL; a simple implementation, without{' '}
            <strong>
              <em>fencing tokens*</em>
            </strong>
            , a known limitation documented in the production section below.
          </div>
          <h2 id="persistence">How data is stored and history is kept</h2>
          <p>
            Removing a contact or a flow is implemented as <strong>soft delete</strong>: the record
            is marked removed, not physically deleted. The justification is the need to keep history
            of past campaigns and completed sequences; physical deletion would break the ability to
            audit what was sent to a contact in the past. Specific actions handle marking something
            removed and restoring it later if needed, instead of leaving that check scattered
            implicitly across different parts of the system.
          </p>
          <p>
            There's also an{' '}
            <strong>
              <em>audit log*</em>
            </strong>
            , recording every relevant state change (a send, a campaign starting, a flow being
            paused) along with the details of that moment. The design decision was to keep a single
            record format for every kind of event, instead of a separate logging system per type of
            information. Event volume, at the current stage of the project, doesn't justify that
            additional complexity.
          </p>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> Soft delete via a <code>deleted_at</code> field (nullable datetime), with
            explicit domain methods <code>soft_delete()</code> and <code>restore()</code> on the
            entity, instead of an implicit <code>WHERE deleted_at IS NULL</code> filter scattered
            across queries. The <code>AuditLog</code> table is{' '}
            <strong>
              <em>append-only*</em>
            </strong>
            , with a generic <code>JSON</code> payload per event, a deliberate choice not to
            normalize into per-entity log tables at this stage, prioritizing schema simplicity over
            audit query performance.
          </div>
          <h2 id="trade-offs">What was gained and what was given up in each choice</h2>
          <p>
            No architectural decision is free: every choice solves one problem and introduces
            another, usually smaller one. Recording that trade-off alongside the decision matters
            just as much as recording the decision itself.
          </p>
          <div className="case-table-wrap">
            <table className="case-table">
              <thead>
                <tr>
                  <th>Decision</th>
                  <th>Gain</th>
                  <th>Cost accepted</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Splitting the system into layers</td>
                  <td>
                    Isolated testability of business rules and swapping technical tools without
                    affecting them
                  </td>
                  <td>More parts and more organization than a simple system would need</td>
                </tr>
                <tr>
                  <td>The three processes run together, in the same project</td>
                  <td>Lower cost and maintenance complexity at this stage</td>
                  <td>Each process can't yet scale fully independently of the others</td>
                </tr>
                <tr>
                  <td>The reconciler checks for problems at intervals, not in real time</td>
                  <td>Simpler to build and to understand</td>
                  <td>A problem may take a while to be noticed and fixed, instead of instantly</td>
                </tr>
                <tr>
                  <td>Single audit-log format for every kind of event</td>
                  <td>Less structure to maintain</td>
                  <td>Querying the history of a specific event type is slightly less optimized</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h2 id="production">What would change for a real production scenario</h2>
          <p>
            Recording what would change in real production matters just as much as recording what's
            already been decided: it shows the current scope was deliberately limited for a study
            project, not confused with a system ready to serve thousands of real customers.
          </p>
          <ul>
            <li>
              <strong>Full independence between the three processes.</strong> The organizer, sender,
              and reconciler currently run together, on purpose, inside the same project, avoiding
              unnecessary complexity. In production, each process would scale according to its own
              demand: if campaign volume grows a lot, it becomes possible to run more copies of the
              sender without needing to duplicate the organizer or reconciler alongside it, similar
              to a kitchen adding more line cooks for plating during a rush without needing to hire
              more staff to take orders.
            </li>
            <li>
              <strong>A more resilient distributed lock.</strong> There's a rare scenario where
              prolonged network instability allows a lock to be improperly "stolen": a process takes
              so long to respond that the system assumes it crashed, releases the lock to another
              process, and then the first process "wakes up" still believing it holds it. It's like
              two people both thinking they hold the only key to the same safe. Techniques like{' '}
              <strong>fencing tokens</strong> would address that before real-world use, by adding a
              sequential number that invalidates any action from whoever lost lock ownership without
              realizing it.
            </li>
            <li>
              <strong>
                <em>Circuit breaker*</em>
              </strong>{' '}
              for prolonged WhatsApp unavailability. Currently, each message exhausts its attempts
              individually, with the system never noticing a larger pattern behind the failures. If
              WhatsApp went down entirely, the system would keep trying to send thousands of
              messages that, individually, have zero chance of success, wasting time and resources.
              A more mature version would detect that kind of systemic unavailability, similar to an
              electrical circuit breaker that shuts down an entire circuit upon sensing overload,
              and pause new attempts for a while, occasionally testing whether the service is back
              before resuming the normal flow.
            </li>
            <li>
              <strong>
                Manual review queue (<em>dead-letter queue*</em>).
              </strong>{' '}
              Currently, a message that exhausts its attempts is just marked "failed" in the
              database, mixed in with the rest of the history. A more mature version would have a
              separate queue dedicated solely to those terminal failures, working like undeliverable
              mail returned by the post office: instead of throwing the letter away, it goes to a
              specific place where someone can open it, understand why, and decide whether to resend
              it manually or not.
            </li>
          </ul>
          <div className="case-tech">
            <span className="case-tech-label">In technical terms</span>
            <br /> In order: <strong>fencing tokens</strong> on the distributed lock (a monotonic
            counter validated at write time, not just key possession), a{' '}
            <strong>circuit breaker</strong> on the WhatsApp API integration (open/half-open/closed
            pattern, avoiding exhausting individual retries when the provider is systemically
            unavailable), and an explicit <strong>dead-letter queue</strong> in BullMQ for jobs
            exceeding <code>maxAttempts</code>, with a separate review queue instead of a silent
            terminal status in the database.
          </div>
          <h2 id="glossary">Glossary</h2>
          <p>
            Technical terms referenced throughout the document, with a practical example for each.
          </p>
          <div className="case-table-wrap">
            <table className="case-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Definition and example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Event Storming</strong>
                  </td>
                  <td>
                    A collaborative modeling technique where domain events (relevant facts happening
                    in the system) are mapped out to discover processes, rules, and boundaries
                    before any code is written. Example: gathering sticky notes with phrases like
                    "Campaign was created", "Message failed to send", "Flow was paused" on a
                    timeline, to see the entire lifecycle of a campaign before designing a single
                    database table.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Ubiquitous language</strong>
                  </td>
                  <td>
                    A common, precise vocabulary shared between code and business, used to eliminate
                    ambiguity about the meaning of each domain term. Example: if the business team
                    calls something a "blast" while the code calls it a "job", every conversation
                    requires mental translation; adopting "Campaign" and "Flow" as single terms
                    means a business meeting and a code review end up speaking exactly the same
                    language.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Bounded Context</strong>
                  </td>
                  <td>
                    An explicit boundary within which a domain model and its language are valid and
                    consistent. Outside it, the same term can mean something different. Example: the
                    word "Customer" in a message-dispatch context means just a phone number with
                    contact preferences; in a billing context, the same word "Customer" would carry
                    a tax ID, an address, and payment history, an entirely different model.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Domain-Driven Design (DDD)</strong>
                  </td>
                  <td>
                    A design approach that structures software around the business domain and its
                    language, prioritizing careful modeling over implementation-level technical
                    details. Example: before deciding which database to use, effort goes into
                    correctly understanding and naming what a "Campaign", a "Flow", and a "Flow
                    Execution" are, and only after that are tables and endpoints designed.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Hexagonal architecture</strong>
                  </td>
                  <td>
                    An architecture style where the core business rules sit in the center, isolated,
                    and communicate with the outside world (database, APIs, queue) only through
                    well-defined ports and adapters, close in spirit to Clean Architecture. Example:
                    the core of the system doesn't know whether it's talking to the real WhatsApp or
                    a test double; it only knows a generic "send message" port, and whatever's
                    plugged into that port can be swapped out without the core noticing.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Output ports</strong>
                  </td>
                  <td>
                    Interfaces that the business-rules layer defines to describe what it needs from
                    the outside world, without saying how that's done. Whoever implements the
                    interface lives in a separate infrastructure layer. Example: the business rule
                    defines a port called "send message", like a wall outlet waiting for a standard
                    plug; it doesn't matter whether the real WhatsApp or a fake test version is on
                    the other end, as long as the plug shape is respected.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Dependency injection</strong>
                  </td>
                  <td>
                    A technique where a component receives what it depends on from the outside,
                    instead of creating that dependency internally, making it easy to swap the piece
                    out (including for a test version). Example: instead of someone brewing their
                    own cup of coffee from scratch every time, someone else hands them a ready cup
                    at the table; if tomorrow the coffee gets swapped for tea, the person doesn't
                    even need to know, they just get handed whatever's delivered.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Redlock</strong>
                  </td>
                  <td>
                    A specific algorithm for implementing a distributed lock using multiple
                    independent Redis instances at once, reducing the risk of the lock failing
                    because a single Redis instance went down. Example: instead of trusting a single
                    physical key to a shared bathroom, the system asks several independent copies of
                    the lock for ownership of the key at the same time, and only considers the key
                    valid if the majority agree.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Mutex</strong>
                  </td>
                  <td>
                    Short for "mutual exclusion": a mechanism that guarantees only one process at a
                    time executes a specific piece of code or accesses a specific resource. Example:
                    the distributed lock mentioned above is itself a type of mutex; the single
                    shared bathroom key guarantees mutual exclusion among the stores competing for
                    it.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Clean Architecture</strong>
                  </td>
                  <td>
                    A layered architecture style where business rules are isolated from
                    infrastructure details (databases, frameworks, external APIs), allowing each
                    part to be tested and replaced independently. Example: swapping WhatsApp for
                    another messaging provider, or swapping PostgreSQL for another database, without
                    touching a single line of the rule "a campaign can't start without at least one
                    contact".
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Rate limiting</strong>
                  </td>
                  <td>
                    Controlling the rate of operations allowed within a time window, used here to
                    avoid the messaging platform blocking a number under high-volume sending.
                    Example: instead of sending a thousand messages in one second, the system caps
                    sending at, say, one message every two or three seconds per number, the same way
                    a tollbooth lets one car through at a time instead of letting them all pass at
                    once.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Job / Worker</strong>
                  </td>
                  <td>
                    A job is a unit of work to be processed (for example, "send this message"). A
                    worker is the process that consumes jobs from a queue and executes them.
                    Example: a job is the order slip for one specific dish in a kitchen; the worker
                    is the cook who picks up that slip and prepares the dish described on it.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Processing queue (message queue)</strong>
                  </td>
                  <td>
                    A structure that stores pending tasks in order, allowing them to be processed
                    asynchronously and resiliently to failure, without requiring whoever created the
                    task to wait for processing to finish. Example: a bank line where each customer
                    takes a number and goes about their business, knowing they'll be served in
                    order, instead of standing right in front of the counter waiting.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Concurrency</strong>
                  </td>
                  <td>
                    A situation where multiple processes or instances run at the same time and,
                    without proper control, could access or change the same resource simultaneously.
                    Example: two bank tellers calling the same ticket number at once without
                    noticing and serving the same person twice, for lack of a control guaranteeing
                    only one teller handles that ticket at a time.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Exponential backoff</strong>
                  </td>
                  <td>
                    A retry strategy where the wait time between attempts grows with each failed
                    try, instead of retrying immediately and endlessly. Example: someone calling a
                    busy number doesn't redial every second; they wait a bit, try again, and if it's
                    still busy, wait even longer on the next attempt.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Strategy Pattern</strong>
                  </td>
                  <td>
                    A design pattern where a single execution point triggers different behaviors
                    depending on what's been plugged into it, without needing conditionals scattered
                    throughout the code. Example: a universal power outlet whose socket shape is
                    always the same, while the appliance plugged into it decides what happens once
                    the power flows.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Periodic polling</strong>
                  </td>
                  <td>
                    A checking technique that runs at fixed time intervals, instead of reacting to a
                    real-time alert the moment something happens. Example: someone walking by every
                    hour to check if a pot was left on the stove, instead of waiting for an alarm to
                    go off the exact moment the pot burns.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Queue TTL</strong>
                  </td>
                  <td>
                    An automatic expiration date set on a queue or queue item; once that time
                    passes, the item expires and gets removed or redirected on its own, with no
                    manual intervention. Example: an expired product being pulled off a store shelf
                    automatically, without someone having to check every item by hand every day.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Dead letter exchange</strong>
                  </td>
                  <td>
                    A mechanism built into the message broker itself that automatically redirects
                    problematic messages to a separate destination, without the application needing
                    to implement that logic manually. Example: a postal sorting center that already
                    separates out letters with invalid addresses automatically, instead of leaving
                    it up to each mail carrier to decide what to do with them.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Idempotency</strong>
                  </td>
                  <td>
                    A property of an operation that produces the same final result even if executed
                    more than once, used here to guarantee that reprocessing a task doesn't cause a
                    duplicate delivery. Example: pressing an elevator button that's already lit
                    doesn't call the elevator twice; pressing it again doesn't change the final
                    outcome.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Distributed lock</strong>
                  </td>
                  <td>
                    A mutual exclusion mechanism across multiple processes or instances,
                    guaranteeing only one of them executes a given operation at a time. Example: the
                    single key to a bathroom shared by several stores; whoever holds the physical
                    key is the only one who can use the bathroom at that moment, and everyone else
                    waits for the key to be returned.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Fencing token</strong>
                  </td>
                  <td>
                    A monotonic counter used alongside a distributed lock to invalidate actions from
                    a process that lost lock ownership without noticing, preventing improper
                    execution even under network failure scenarios. Example: a sequential ticket
                    number issued along with lock ownership; if someone shows up trying to act with
                    ticket "12" after ticket "13" has already been issued to someone else, the
                    system knows that old ownership no longer counts.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Circuit breaker</strong>
                  </td>
                  <td>
                    A pattern that temporarily stops calls to an external service detected as
                    unavailable, avoiding wasted attempts and allowing gradual recovery once the
                    service returns to normal. Example: a home's electrical circuit breaker that
                    trips on its own when it senses an overload, cutting off the circuit before the
                    problem spreads, instead of letting the entire wiring burn out.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Dead-letter queue</strong>
                  </td>
                  <td>
                    A secondary queue where tasks that failed repeatedly and exhausted their
                    automatic attempts get routed, allowing manual review instead of silent discard.
                    Example: a letter the post office can't deliver after several attempts isn't
                    thrown away, it ends up in an undeliverable-mail facility for someone to decide
                    what to do with it.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Soft delete</strong>
                  </td>
                  <td>
                    A logical deletion strategy where a record is marked removed without physical
                    deletion from the database, preserving history and auditability. Example:
                    archiving an email instead of deleting it, the email disappears from the inbox
                    but still exists and can be recovered later if needed.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Audit log</strong>
                  </td>
                  <td>
                    An immutable historical record of relevant system events, used for history
                    reconstruction and auditing. Example: a bank account statement, showing every
                    deposit and withdrawal in chronological order, where no old line can be erased
                    or rewritten afterward.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Append-only</strong>
                  </td>
                  <td>
                    A property of a data structure or table that only allows new rows to be added at
                    the end, never altering or deleting existing ones. Example: a physical diary
                    where you only ever write new pages going forward; nobody tears out or rewrites
                    an old page, even if what was written there turns out to be wrong, the
                    correction becomes a new entry instead.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Separation of concerns</strong>
                  </td>
                  <td>
                    A design principle that distributes distinct responsibilities across different
                    parts of a system, reducing coupling and easing maintenance and testing.
                    Example: in a professional kitchen, the person cutting ingredients isn't the
                    same person finishing the dish on the stove; each station has a clear
                    responsibility, and a problem at one station doesn't stall the others.
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Finite state machine</strong>
                  </td>
                  <td>
                    A computational model made up of a finite set of states and transition rules
                    between them, used to guarantee that an entity only assumes valid combinations
                    of state and context. Example: a traffic light can only be red, yellow, or
                    green, never two at once, and it always transitions in the same order, never
                    jumping straight from red to yellow without passing through green first.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="case-ctas">
          <Link to="/#projetos" className="btn-o">
            ← Back to projects
          </Link>{' '}
          <Link to="/#contato" className="btn">
            Let's talk about it →
          </Link>
        </div>
      </div>
    </div>
  );
}
