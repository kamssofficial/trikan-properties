import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BedDouble, Check, ChevronDown, ExternalLink, Instagram, MapPin, Menu, MessageCircle, MoveUpRight, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import AdminPanel from './components/AdminPanel';
import { seedProperties, type Property } from './data/properties';
import { getWhatsAppNumber, isSupabaseConfigured, supabase } from './lib/supabase';

const categories = ['All homes', 'Apartment', 'Penthouse', 'Villa', 'Land'];
const whatsappBase = 'https://wa.me/' + getWhatsAppNumber();

function mapRow(row: Record<string, unknown>): Property {
  return {
    id: String(row.id),
    title: String(row.title ?? 'Untitled property'),
    category: String(row.category ?? 'Apartment'),
    bedrooms: row.bedrooms == null ? null : Number(row.bedrooms),
    areaSqft: row.area_sqft == null ? null : Number(row.area_sqft),
    location: String(row.location ?? ''),
    priceLabel: String(row.price_label ?? 'Price on enquiry'),
    status: (row.status as Property['status']) ?? 'verify',
    description: String(row.description ?? ''),
    imageUrl: String(row.image_url ?? ''),
    sourceUrl: String(row.source_url ?? ''),
    featured: Boolean(row.featured),
    sourceLabel: String(row.source_label ?? 'Trikan listing'),
  };
}

function statusLabel(property: Property) {
  if (property.status === 'available') return 'Availability confirmed';
  if (property.status === 'under_offer') return 'Under offer';
  if (property.status === 'sold') return 'Sold';
  return 'Enquire to verify';
}

function waLink(property: Property) {
  return whatsappBase + '?text=' + encodeURIComponent('Hi Trikan Properties, I would like details about: ' + property.title + ' in ' + property.location + '. Please confirm current availability, price and viewing options.');
}

export default function App() {
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [activeCategory, setActiveCategory] = useState('All homes');
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<Property | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('I would like to know more about your properties.');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showAll, setShowAll] = useState(false);

  const refreshProperties = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('properties').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false });
    if (!error && data && data.length) setProperties(data.map((row: Record<string, unknown>) => mapRow(row)));
    else if (!error && data?.length === 0) setProperties(seedProperties);
  }, []);

  useEffect(() => {
    void refreshProperties();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [refreshProperties]);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return properties.filter(p => {
      const matchesCategory = activeCategory === 'All homes' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesText = !q || [p.title, p.location, p.category, p.description].join(' ').toLowerCase().includes(q);
      const matchesFeatured = !onlyFeatured || p.featured;
      return matchesCategory && matchesText && matchesFeatured && p.status !== 'sold';
    });
  }, [activeCategory, searchText, properties, onlyFeatured]);
  const visibleProperties = showAll ? filtered : filtered.slice(0, 6);
  const featured = properties.find(p => p.featured && p.status !== 'sold') ?? properties[0];

  const jumpTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  async function submitEnquiry(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true); setFormError('');
    const fullMessage = message.trim();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('enquiries').insert({
        name: 'Website visitor',
        email: email.trim() || null,
        phone: phone.trim(),
        message: fullMessage,
        property_id: selected?.id && selected.id.length > 20 ? selected.id : null,
        source: 'website',
      });
      if (error) {
        setSubmitting(false);
        setFormError('We could not save this enquiry right now. You can continue directly on WhatsApp below.');
        return;
      }
    }
    const text = 'Hello Trikan Properties. ' + fullMessage + (phone.trim() ? ' My phone: ' + phone.trim() + '.' : '') + (email.trim() ? ' My email: ' + email.trim() + '.' : '');
    setNotice(isSupabaseConfigured ? 'Your enquiry has been recorded. Continue to WhatsApp to speak with the team.' : 'Your message is ready. Continue to WhatsApp to send it directly.');
    setSubmitting(false);
    window.open(whatsappBase + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
    setContactOpen(false);
    setSelected(null);
  }

  if (adminOpen) {
    return <AdminPanel properties={properties} session={session} onClose={() => setAdminOpen(false)} onSignIn={setSession} onRefresh={refreshProperties} />;
  }

  return (
    <div className="site-shell">
      <div className="announcement"><span className="announcement-dot" /> Curated property introductions across Kerala <button onClick={() => jumpTo('collection')}>Explore the collection <ArrowUpRight size={13} /></button></div>
      <header className="site-header">
        <button className="brand-lockup" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Trikan Properties home">
          <span className="brand-mark">T<span>.</span></span><span className="brand-wording"><strong>TRIKAN</strong><small>PROPERTIES & REALTY</small></span>
        </button>
        <nav className={mobileMenu ? 'main-nav open' : 'main-nav'}>
          <button onClick={() => jumpTo('collection')}>The collection</button>
          <button onClick={() => jumpTo('approach')}>Our approach</button>
          <button onClick={() => jumpTo('social-proof')}>From Trikan</button>
          <button className="mobile-admin" onClick={() => setAdminOpen(true)}>Admin access</button>
        </nav>
        <div className="header-actions">
          <button className="header-admin" onClick={() => setAdminOpen(true)}>Admin <ShieldCheck size={14} /></button>
          <a className="button button-header" href={whatsappBase + '?text=' + encodeURIComponent('Hello Trikan Properties, I would like to discuss a property.')} target="_blank" rel="noreferrer">Speak to an advisor <ArrowUpRight size={15} /></a>
          <button className="menu-trigger" onClick={() => setMobileMenu(v => !v)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      {notice && <div className="site-notice"><Check size={15} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> REAL ESTATE, CONSIDERED</div>
            <h1>Find a place<br />that feels like <em>you.</em></h1>
            <p className="hero-subtitle">A more considered way to discover homes, make confident property decisions and move into your next chapter.</p>
            <div className="hero-actions">
              <button className="button button-gold" onClick={() => jumpTo('collection')}>Explore properties <ArrowDownRight size={16} /></button>
              <button className="text-link" onClick={() => setContactOpen(true)}>Talk to our team <ArrowUpRight size={15} /></button>
            </div>
            <div className="hero-footnote"><span className="hero-footnote-mark">✳</span><span>PERSONAL GUIDANCE <b>·</b> VERIFIED DETAILS <b>·</b> DIRECT CONNECTION</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrap"><img src={featured?.imageUrl ?? seedProperties[0].imageUrl} alt="Illustrative modern residential architecture" /></div>
            <div className="image-caption"><span className="caption-index">01 / THE COLLECTION</span><span>Considered spaces. Clear decisions.</span><ArrowUpRight size={17} /></div>
            <div className="hero-stamp"><span>THE ART OF</span><strong>Coming<br />home.</strong><i>TRIKAN REALTY</i></div>
            <div className="hero-vertical">KOCHI&nbsp; / &nbsp;KERALA&nbsp; / &nbsp;YOUR NEXT CHAPTER</div>
          </div>
          <div className="hero-bottom"><span>INDEPENDENT REAL ESTATE GUIDANCE</span><span>01 — 08 / RESEARCHED OFFER REFERENCES</span></div>
        </section>

        <section className="trust-strip" aria-label="Our service principles">
          <div><span className="trust-number">01</span><span><strong>Thoughtful selection</strong><small>Spaces worth considering</small></span></div>
          <div><span className="trust-number">02</span><span><strong>Clarity at every step</strong><small>Ask. Understand. Decide.</small></span></div>
          <div><span className="trust-number">03</span><span><strong>A human connection</strong><small>Direct contact with Trikan</small></span></div>
        </section>

        <section className="collection-section section-pad" id="collection">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> THE PROPERTY EDIT</div><h2>Spaces with a <em>story.</em></h2></div>
            <div className="heading-aside"><p>Explore property offers mentioned in Trikan’s public posts. Every listing is marked for direct verification before any decision.</p><span className="listing-count">0{properties.length} <i>REFERENCES IN THE EDIT</i></span></div>
          </div>

          <div className="catalog-toolbar">
            <div className="category-tabs" role="group" aria-label="Filter property category">
              {categories.map(category => <button key={category} className={activeCategory === category ? 'category-tab active' : 'category-tab'} onClick={() => { setActiveCategory(category); setShowAll(false); }}>{category}</button>)}
            </div>
            <div className="catalog-tools">
              <label className="search-control"><Search size={16} /><input value={searchText} onChange={e => { setSearchText(e.target.value); setShowAll(false); }} placeholder="Location, type, keyword" /><span>⌘ K</span></label>
              <button className={onlyFeatured ? 'filter-button active' : 'filter-button'} onClick={() => setOnlyFeatured(v => !v)}><SlidersHorizontal size={15} /> <span>Featured</span></button>
            </div>
          </div>

          <div className="results-note"><span>{filtered.length} property {filtered.length === 1 ? 'reference' : 'references'}</span><span><span className="status-dot" /> Availability is unconfirmed unless explicitly marked</span></div>

          {visibleProperties.length > 0 ? (
            <div className="property-grid">
              {visibleProperties.map((property, index) => (
                <article className="property-card" key={property.id}>
                  <button className="property-image" onClick={() => setSelected(property)} aria-label={'View '+property.title}>
                    <img loading={index > 2 ? 'lazy' : 'eager'} src={property.imageUrl} alt={'Illustrative architecture for '+property.title} />
                    <span className="image-chip">{property.category}</span>
                    <span className="image-index">T / {String(index + 1).padStart(2, '0')}</span>
                    <span className="image-open"><ArrowUpRight size={18} /></span>
                  </button>
                  <div className="property-card-content">
                    <div className="property-card-location"><MapPin size={13} /> {property.location}</div>
                    <button className="property-title" onClick={() => setSelected(property)}>{property.title}</button>
                    <div className="property-facts">
                      {property.bedrooms !== null && <span><BedDouble size={15} /> {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>}
                      {property.areaSqft !== null && <span>{property.areaSqft.toLocaleString('en-IN')} sq ft</span>}
                    </div>
                    <div className="property-card-bottom"><div><small>PRICE / AVAILABILITY</small><strong>{property.priceLabel}</strong></div><button className="card-arrow" onClick={() => setSelected(property)} aria-label={'View details for '+property.title}><ArrowUpRight size={18} /></button></div>
                    <div className="verification-label"><span className="status-dot" /> {statusLabel(property)}</div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><Search size={25} /><h3>No matching property references</h3><p>Try another location or category.</p><button className="text-link" onClick={() => { setSearchText(''); setActiveCategory('All homes'); setOnlyFeatured(false); }}>Clear filters <ArrowRight size={14} /></button></div>}

          {filtered.length > visibleProperties.length && <div className="show-more-wrap"><button className="button button-outline" onClick={() => setShowAll(true)}>View all {filtered.length} references <ChevronDown size={16} /></button></div>}
          <div className="catalog-disclaimer"><ShieldCheck size={17} /><p><strong>Details matter.</strong> Public posts may be older than current inventory. Availability, project details, pricing, taxes and terms must be verified with Trikan directly. Images are illustrative references, not verified original property photographs.</p></div>
        </section>

        <section className="manifesto-section" id="approach">
          <div className="manifesto-image"><img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85" alt="Illustrative calm modern living space" loading="lazy" /><span className="manifesto-image-label">A BETTER WAY TO BEGIN</span></div>
          <div className="manifesto-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> OUR APPROACH</div>
            <h2>Good property decisions begin with <em>good conversations.</em></h2>
            <p>Buying a home or making a real estate investment should feel informed, not overwhelming. Start with what matters to you. We help you ask the right questions, understand the details and connect with the team.</p>
            <div className="approach-points">
              <div><span>01</span><span><strong>Start with your priorities</strong><small>Location, lifestyle, budget and intent.</small></span></div>
              <div><span>02</span><span><strong>Confirm every detail</strong><small>Current price, inventory and documentation.</small></span></div>
              <div><span>03</span><span><strong>Take the next step clearly</strong><small>Arrange a viewing or request more information.</small></span></div>
            </div>
            <button className="button button-dark" onClick={() => setContactOpen(true)}>Start a conversation <ArrowUpRight size={15} /></button>
          </div>
        </section>

        <section className="from-trikan-section section-pad" id="social-proof">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> DIRECT FROM THE SOURCE</div><h2>Find it on <em>Trikan.</em></h2></div>
            <a className="text-link" href="https://www.instagram.com/trikan__properties/" target="_blank" rel="noreferrer">Visit Instagram <ExternalLink size={14} /></a>
          </div>
          <p className="social-intro">The properties in this catalogue are tied back to public Trikan posts wherever a direct post link was found. Use the original post to review context, then contact the team for a current update.</p>
          <div className="source-list">
            {properties.slice(0, 6).map((property, index) => <a key={property.id} className="source-row" href={property.sourceUrl} target="_blank" rel="noreferrer"><span className="source-number">0{index + 1}</span><span className="source-title"><strong>{property.title}</strong><small>{property.location} · {property.sourceLabel}</small></span><span className="source-tag">Original source <ExternalLink size={13} /></span><ArrowUpRight className="source-arrow" size={18} /></a>)}
          </div>
        </section>

        <section className="contact-band">
          <div className="contact-band-orb" />
          <div className="contact-band-copy"><div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</div><h2>Let’s find your <em>place.</em></h2><p>Tell us what you are looking for. We’ll help you take the next step with clarity.</p></div>
          <button className="button button-gold" onClick={() => setContactOpen(true)}>Speak to Trikan <ArrowUpRight size={16} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main"><button className="brand-lockup footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span className="brand-mark">T<span>.</span></span><span className="brand-wording"><strong>TRIKAN</strong><small>PROPERTIES & REALTY</small></span></button><p>Spaces to live in.<br />Decisions to feel good about.</p><a href={whatsappBase} target="_blank" rel="noreferrer" className="footer-contact">Connect with the team <ArrowUpRight size={14} /></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} TRIKAN PROPERTIES</span><span>PUBLIC LISTING REFERENCES · VERIFY BEFORE RELYING</span><div><a href="https://www.instagram.com/trikan__properties/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a><a href="https://www.facebook.com/p/Trikan-Realtors-61560009638447/" target="_blank" rel="noreferrer" aria-label="Facebook"><MoveUpRight size={15} /></a></div></div>
      </footer>

      <a className="floating-whatsapp" href={whatsappBase + '?text=' + encodeURIComponent('Hello Trikan Properties, I would like to enquire about a property.')} target="_blank" rel="noreferrer" aria-label="Message Trikan on WhatsApp"><MessageCircle size={20} /><span>Let’s talk</span></a>

      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section className="property-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={19} /></button>
        <div className="modal-image"><img src={selected.imageUrl} alt={'Illustrative architecture for '+selected.title} /><span className="image-chip">{selected.category}</span></div>
        <div className="modal-body"><div className="eyebrow"><span className="eyebrow-line" /> {selected.location.toUpperCase()}</div><h2 id="modal-title">{selected.title}</h2><div className="modal-facts">{selected.bedrooms !== null && <span><BedDouble size={15} /> {selected.bedrooms} bedrooms</span>}{selected.areaSqft !== null && <span>{selected.areaSqft.toLocaleString('en-IN')} sq ft</span>}</div><h3>{selected.priceLabel}</h3><p>{selected.description}</p><div className="modal-status"><span className="status-dot" /> {statusLabel(selected)}</div><div className="modal-actions"><a className="button button-gold" href={waLink(selected)} target="_blank" rel="noreferrer">Ask about this property <ArrowUpRight size={15} /></a>{selected.sourceUrl && <a className="button button-outline" href={selected.sourceUrl} target="_blank" rel="noreferrer">Original post <ExternalLink size={14} /></a>}</div><p className="modal-disclaimer">The photo is illustrative and may not depict the advertised unit. Confirm live availability, price, unit details and documentation with Trikan before relying on this listing.</p></div>
      </section></div>}

      {contactOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setContactOpen(false); }}><section className="contact-modal panel" role="dialog" aria-modal="true" aria-labelledby="contact-title"><button className="modal-close" onClick={() => setContactOpen(false)} aria-label="Close"><X size={19} /></button><div className="eyebrow"><span className="eyebrow-line" /> LET’S TALK PROPERTY</div><h2 id="contact-title">What are you looking for?</h2><p>Share a few details and continue directly to WhatsApp to speak with Trikan.</p><form onSubmit={submitEnquiry}><label>Phone number<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your mobile number" required minLength={7} /></label><label>Email <span className="optional">(optional)</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>How can we help?<textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required /></label>{formError && <p className="error-message">{formError}</p>}<button className="button button-gold full-button" disabled={submitting}>{submitting ? 'Preparing enquiry…' : 'Continue to WhatsApp'} <ArrowUpRight size={15} /></button><small className="form-privacy">Your information is used to respond to this enquiry. Do not include sensitive financial or identity details.</small></form></section></div>}

      <div className="build-disclosure">Research-based starter · Confirm all content before public launch</div>
      <a className="admin-entry" href="#admin" onClick={e => { e.preventDefault(); setAdminOpen(true); }}>Admin access</a>
    </div>
  );
}