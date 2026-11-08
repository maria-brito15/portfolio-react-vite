import SiteShell from '../components/shell/SiteShell';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import SectionDivider from '../components/SectionDivider';
import ContactLinks from '../components/ContactLinks';
import ImageGallery from '../components/ImageGallery';
import Faq from '../components/Faq';
import { services } from '../data/services';
import { profile } from '../data/profile';
import { useLanguage } from '../i18n/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export default function Services() {
  const { lang } = useLanguage();
  const c = services[lang];
  useDocumentMeta(c.meta);
  const mailto = `mailto:${profile.servicesEmail}`;
  return (
    <SiteShell routeId="servicos">
      <section className="hero">
        <div>
          <div className="badge">
            <span className="bdot" aria-hidden="true"></span> {c.hero.badge}
          </div>
          <h1>{c.hero.title}</h1>
          <p className="hero-sub">{c.hero.sub}</p>
          <div className="hero-ctas">
            <a href={mailto} className="btn">
              {c.hero.quote}
            </a>
            <a href="#servicos" className="btn-o">
              {c.hero.viewServices}
            </a>
          </div>
          <div className="trust-bar">
            {c.hero.trust.map((item) => (
              <span className="trust-item" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="servicos" className="sec" aria-labelledby="servicos-title">
        <SectionTitle id="servicos-title" label={c.services.label}>
          {c.services.title}
        </SectionTitle>
        <div className="services-grid">
          {c.services.items.map((item) => (
            <Card className="svc-card" key={item.title}>
              <div className="svc-icon" aria-hidden="true">
                {item.icon}
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <div className="svc-meta">
                {item.meta.map((m) => (
                  <span className="svc-meta-item" key={m}>
                    {m}
                  </span>
                ))}
              </div>
            </Card>
          ))}
          {/* Cartão que é um link: mesma classe `card`, mas a tag é <a>. */}
          <a href={mailto} className="card svc-card svc-card-custom">
            <div>
              <div className="svc-icon" aria-hidden="true">
                💬
              </div>
              <h3>{c.services.custom.title}</h3>
              <p>{c.services.custom.text}</p>
            </div>
            <span className="price-tag">{c.services.custom.cta}</span>
          </a>
        </div>
        <div className="design-disclaimer">
          <div className="design-disclaimer-icon" aria-hidden="true">
            🎨
          </div>
          <div className="design-disclaimer-body">
            <span className="design-disclaimer-label">{c.services.design.label}</span>
            <h3>{c.services.design.title}</h3>
            <p>{c.services.design.text}</p>
            <p className="design-note">{c.services.design.note}</p>
            <div className="svc-meta">
              {c.services.design.meta.map((m) => (
                <span className="svc-meta-item" key={m}>
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider label={c.cases.divider} />
      <section id="cases" className="sec" aria-labelledby="cases-title">
        <SectionTitle id="cases-title" label={c.cases.label}>
          {c.cases.title}
        </SectionTitle>
        {c.cases.items.map((item) => (
          <Card className="case-card" key={item.id}>
            <div className="case-content">
              <div className="case-badge">{item.badge}</div>
              <h3>{item.title}</h3>
              {item.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <div className="deliverables">
                {item.deliverables.map((d) => (
                  <span className="del-tag" key={d}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <ImageGallery
              columns={item.columns}
              images={item.images.map((src, i) => ({
                src,
                alt: `${item.alt} ${i + 1}/${item.images.length}`,
              }))}
            />
          </Card>
        ))}
      </section>

      <section id="faq" className="sec faq-section" aria-labelledby="faq-title">
        <div className="faq-wrap">
          <div className="faq-head">
            <span className="lbl">{c.faq.label}</span>
            <h3 id="faq-title">{c.faq.title}</h3>
          </div>
          <Faq items={c.faq.items} />
        </div>
      </section>

      <section className="contact-wrap" id="contato" aria-labelledby="svc-contato-title">
        <div className="cinner">
          <SectionTitle id="svc-contato-title" label={c.contact.label} center>
            {c.contact.title}
          </SectionTitle>
          <p className="contact-text">{c.contact.text}</p>
          <ContactLinks email={profile.servicesEmail} emailLabel={c.contact.email} />
        </div>
      </section>
    </SiteShell>
  );
}
