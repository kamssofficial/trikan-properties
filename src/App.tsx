import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BedDouble, Check, ChevronDown, ExternalLink, Instagram, MapPin, Menu, MoveUpRight, Search, ShieldCheck, SlidersHorizontal, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import AdminPanel from './components/AdminPanel';
import PropertyChatWidget from './components/PropertyChatWidget';
import { seedProperties, trikanBusinessProfile, type Property } from './data/properties';
import { getWhatsAppNumber, isSupabaseConfigured, supabase } from './lib/supabase';

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
    relatedSourceUrl: typeof row.related_source_url === 'string' && row.related_source_url ? row.related_source_url : undefined,
    relatedSourceLabel: typeof row.related_source_label === 'string' && row.related_source_label ? row.related_source_label : undefined,
    officialSourceUrl: typeof row.official_source_url === 'string' && row.official_source_url ? row.official_source_url : undefined,
    inventorySourceUrl: typeof row.inventory_source_url === 'string' && row.inventory_source_url ? row.inventory_source_url : undefined,
    reraSourceUrl: typeof row.rera_source_url === 'string' && row.rera_source_url ? row.rera_source_url : undefined,
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

function isOfficialProjectImage(property: Property) {
  return /(?:^|\/\/)(?:www\.)?(?:varmahomes\.com|sobha\.com|marinaone\.in)\//i.test(property.imageUrl);
}

export default function App() {
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [activeCategory, setActiveCategory] = useState('All homes');
  const [searchText, setSearchText] = useState('');
  const [selected, setSelected] = useState<Property | null>(null);
  const [adminOpen, setAdminOpen] = useState(() => new URLSearchParams(window.location.search).get('admin') === '1');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        const target = event.target;
        const typing = target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
        if (adminOpen || contactOpen || privacyOpen || selected || typing) return;
        event.preventDefault();
        jumpTo('collection');
        window.setTimeout(() => searchInputRef.current?.focus(), 250);
      }
      if (event.key === 'Escape') {
        setContactOpen(false);
        setPrivacyOpen(false);
        setSelected(null);
        setMobileMenu(false);
      }
    }
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [adminOpen, contactOpen, privacyOpen, selected]);

  const categories = useMemo(() => ['All homes', ...Array.from(new Set(properties.filter(property => property.status !== 'sold').map(property => property.category).filter(Boolean)))], [properties]);
  const searchShortcut = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘ K' : 'Ctrl K';

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
  const anyDialogOpen = Boolean(selected || contactOpen || privacyOpen);

  useEffect(() => {
    if (!anyDialogOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const animationFrame = window.requestAnimationFrame(() => {
      const dialog = document.querySelector<HTMLElement>('.modal-backdrop [role="dialog"]');
      dialog?.querySelector<HTMLElement>('.modal-close, input, textarea, select, button, a[href]')?.focus({ preventScroll: true });
    });
    function trapFocus(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const dialog = document.querySelector<HTMLElement>('.modal-backdrop [role="dialog"]');
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(element => element.offsetParent !== null);
      if (!focusable.length) { event.preventDefault(); dialog.focus(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', trapFocus, true);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('keydown', trapFocus, true);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [selected, contactOpen, privacyOpen]);

  useEffect(() => {
    if (!contactOpen) setContactConsent(false);
  }, [contactOpen]);

  const jumpTo = (id: string) => {
    setMobileMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  async function submitEnquiry(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true); setFormError('');
    const fullMessage = message.trim();
    const recordedMessage = fullMessage + '\n\nConsent to contact: yes';
    const text = 'Hello Trikan Properties. ' + fullMessage + (name.trim() ? ' My name: ' + name.trim() + '.' : '') + (phone.trim() ? ' My phone: ' + phone.trim() + '.' : '') + (email.trim() ? ' My email: ' + email.trim() + '.' : '');
    const whatsappWindow = window.open('about:blank', '_blank');
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('enquiries').insert({
          name: name.trim() || null,
          email: email.trim() || null,
          phone: phone.trim() || null,
          message: recordedMessage,
          property_id: selected?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selected.id) ? selected.id : null,
          source: 'website',
        });
        if (error) throw error;
      } catch {
        if (whatsappWindow) whatsappWindow.close();
        setSubmitting(false);
        setFormError('We could not save your enquiry. Please try again, or contact Trikan directly on WhatsApp.');
        return;
      }
    }
    setNotice(isSupabaseConfigured ? 'Your enquiry has been recorded and WhatsApp is opening.' : 'WhatsApp is opening with your enquiry ready to send.');
    setSubmitting(false);
    if (whatsappWindow) {
      whatsappWindow.opener = null;
      whatsappWindow.location.href = whatsappBase + '?text=' + encodeURIComponent(text);
    } else {
      setFormError('Your browser blocked the WhatsApp window. Use the WhatsApp button in the lower-right corner to contact Trikan.');
    }
    setContactOpen(false);
    setSelected(null);
  }

  if (adminOpen) {
    return <AdminPanel
      properties={properties}
      session={session}
      onClose={() => {
        setAdminOpen(false);
        const url = new URL(window.location.href);
        if (url.searchParams.has('admin')) {
          url.searchParams.delete('admin');
          window.history.replaceState({}, '', url.toString());
        }
      }}
      onSignIn={setSession}
      onRefresh={refreshProperties}
    />;
  }

  return (
    <div className="site-shell">
      <div className="announcement"><span className="announcement-dot" /> Curated property introductions across Kerala <button onClick={() => jumpTo('collection')}>Explore the collection <ArrowUpRight size={13} /></button></div>
      <header className="site-header">
        <button className="brand-lockup" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Trikan Properties home">
          <span className="brand-mark">T<span>.</span></span><span className="brand-wording"><strong>TRIKAN</strong><small>REALTORS</small></span>
        </button>
        <nav id="main-menu" className={mobileMenu ? 'main-nav open' : 'main-nav'}>
          <button onClick={() => jumpTo('collection')}>The collection</button>
          <button onClick={() => jumpTo('approach')}>Our approach</button>
          <button onClick={() => jumpTo('social-proof')}>From Trikan</button>
          <button onClick={() => jumpTo('about-trikan')}>About & contact</button>
          <button className="mobile-admin" onClick={() => setAdminOpen(true)}>Admin access</button>
        </nav>
        <div className="header-actions">
          <button className="header-admin" onClick={() => setAdminOpen(true)}>Admin <ShieldCheck size={14} /></button>
          <a className="button button-header" href={whatsappBase + '?text=' + encodeURIComponent('Hello Trikan Properties, I would like to discuss a property.')} target="_blank" rel="noreferrer">Speak to an advisor <ArrowUpRight size={15} /></a>
          <button className="menu-trigger" onClick={() => setMobileMenu(v => !v)} aria-label={mobileMenu ? 'Close navigation menu' : 'Open navigation menu'} aria-controls="main-menu" aria-expanded={mobileMenu}>{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      {notice && <div className="site-notice"><Check size={15} /> {notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14} /></button></div>}

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> TRIKAN REALTORS · PROPERTY DISCOVERY</div>
            <h1>Discover property.<br />Invest with <em>clarity.</em></h1>
            <p className="hero-subtitle">Explore homes and investment properties through clear source references, thoughtful guidance and direct conversations with Trikan.</p>
            <div className="hero-actions">
              <button className="button button-gold" onClick={() => jumpTo('collection')}>Explore properties <ArrowDownRight size={16} /></button>
              <button className="text-link" onClick={() => setContactOpen(true)}>Talk to our team <ArrowUpRight size={15} /></button>
            </div>
            <div className="hero-footnote"><span className="hero-footnote-mark">✳</span><span>PROPERTY DISCOVERY <b>·</b> INVESTMENT OPTIONS <b>·</b> DIRECT ENQUIRIES</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrap"><img src={featured?.imageUrl ?? seedProperties[0].imageUrl} alt="Illustrative architecture; not a verified photograph of the listed property" /><span className="media-disclosure">Illustrative image · not the advertised unit</span></div>
            <div className="image-caption"><span className="caption-index">01 / THE COLLECTION</span><span>Considered spaces. Clear decisions.</span><ArrowUpRight size={17} /></div>
            <div className="hero-stamp"><span>THE ART OF</span><strong>Coming<br />home.</strong><i>TRIKAN REALTORS</i></div>
            <div className="hero-vertical">KERALA&nbsp; / &nbsp;PROPERTY&nbsp; / &nbsp;YOUR NEXT CHAPTER</div>
          </div>
          <div className="hero-bottom"><span>INDEPENDENT REAL ESTATE GUIDANCE</span><span>01 — {String(properties.length).padStart(2, '0')} / SOURCED POST REFERENCES</span></div>
        </section>

        <section className="trust-strip" aria-label="Our service principles">
          <div><span className="trust-number">01</span><span><strong>Thoughtful selection</strong><small>Spaces worth considering</small></span></div>
          <div><span className="trust-number">02</span><span><strong>Clarity at every step</strong><small>Ask. Understand. Decide.</small></span></div>
          <div><span className="trust-number">03</span><span><strong>A human connection</strong><small>Direct contact with Trikan</small></span></div>
        </section>

        <section className="collection-section section-pad" id="collection">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> THE PROPERTY EDIT</div><h2>Spaces with a <em>story.</em></h2></div>
            <div className="heading-aside"><p>Explore property offers mentioned in Trikan’s public posts. Every listing is marked for direct verification before any decision.</p><span className="listing-count">{String(properties.length).padStart(2, '0')} <i>SOURCED REFERENCES</i></span></div>
          </div>

          <div className="catalog-toolbar">
            <div className="category-tabs" role="group" aria-label="Filter property category">
              {categories.map(category => <button key={category} type="button" aria-pressed={activeCategory === category} className={activeCategory === category ? 'category-tab active' : 'category-tab'} onClick={() => { setActiveCategory(category); setShowAll(false); }}>{category}</button>)}
            </div>
            <div className="catalog-tools">
              <label className="search-control"><Search size={16} /><input ref={searchInputRef} aria-label="Search properties by location, type or keyword" value={searchText} onChange={e => { setSearchText(e.target.value); setShowAll(false); }} placeholder="Location, type, keyword" /><span>{searchShortcut}</span></label>
              <button type="button" aria-pressed={onlyFeatured} className={onlyFeatured ? 'filter-button active' : 'filter-button'} onClick={() => { setOnlyFeatured(v => !v); setShowAll(false); }}><SlidersHorizontal size={15} /> <span>Featured</span></button>
            </div>
          </div>

          <div className="results-note" role="status" aria-live="polite"><span>{filtered.length} property {filtered.length === 1 ? 'reference' : 'references'}</span><span><span className="status-dot" /> Availability is unconfirmed unless explicitly marked</span></div>

          {visibleProperties.length > 0 ? (
            <div className="property-grid">
              {visibleProperties.map((property, index) => (
                <article className="property-card" key={property.id}>
                  <button className="property-image" onClick={() => setSelected(property)} aria-label={'View '+property.title}>
                    <img loading={index > 2 ? 'lazy' : 'eager'} src={property.imageUrl} alt={(isOfficialProjectImage(property) ? 'Official project render for ' : 'Illustrative architecture for ') + property.title} />
                    <span className="image-chip">{property.category}</span>
                    <span className="image-disclosure">{isOfficialProjectImage(property) ? 'Official project render · not the specific unit' : 'Illustrative photo · not the advertised unit'}</span>
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

          {filtered.length > 6 && <div className="show-more-wrap"><button className="button button-outline" onClick={() => { setShowAll(value => !value); if (showAll) document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{showAll ? 'Show fewer references' : `View all ${filtered.length} references`} {showAll ? <ChevronDown size={16} className="show-less-icon" /> : <ChevronDown size={16} />}</button></div>}
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
          <p className="social-intro">The catalogue is transcribed from public posts by @trikan__properties and @anseen_trikan. Unnamed projects stay unnamed; posts from unrelated accounts are excluded. Open each source post and contact Trikan to confirm current details.</p>
          <div className="source-list">
            {properties.map((property, index) => <a key={property.id} className="source-row" href={property.sourceUrl} target="_blank" rel="noreferrer"><span className="source-number">{String(index + 1).padStart(2, '0')}</span><span className="source-title"><strong>{property.title}</strong><small>{property.location} · {property.sourceLabel}</small></span><span className="source-tag">Original source <ExternalLink size={13} /></span><ArrowUpRight className="source-arrow" size={18} /></a>)}
          </div>
        </section>

        <section className="business-profile-section section-pad" id="about-trikan">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-line" /> THE BUSINESS BEHIND THE POSTS</div><h2>Trikan <em>Realtors.</em></h2></div>
            <div className="heading-aside"><p>Public business details are shown below with their source basis. No office address or company website was found in the reviewed public profiles.</p></div>
          </div>
          <div className="business-profile-grid">
            <div className="business-profile-intro">
              <p className="business-profile-bio">{trikanBusinessProfile.officialBio}</p>
              <p>Property references on this website come from Trikan’s public Instagram posts and public posts on the listed agent profile. Where a post leaves out the project name, price or unit size, the catalogue says so instead of filling in the gaps.</p>
              <div className="business-social-links">
                <a href={trikanBusinessProfile.instagram} target="_blank" rel="noreferrer"><Instagram size={16} /> @trikan__properties <ExternalLink size={13} /></a>
                <a href={trikanBusinessProfile.agentInstagram} target="_blank" rel="noreferrer"><Instagram size={16} /> Anseen Anil <ExternalLink size={13} /></a>
                <a href={trikanBusinessProfile.facebook} target="_blank" rel="noreferrer"><MoveUpRight size={16} /> Facebook page <ExternalLink size={13} /></a>
              </div>
            </div>
            <div className="business-detail-grid">
              <article className="business-detail-card">
                <span className="business-detail-label">CALL / WHATSAPP</span>
                <a className="business-detail-value" href={'https://wa.me/' + trikanBusinessProfile.phoneDigits + '?text=' + encodeURIComponent('Hello Trikan Realtors, I am enquiring through your website.')}>{trikanBusinessProfile.phoneDisplay} <ArrowUpRight size={15} /></a>
                <p>Number repeatedly published on Trikan property posts and in the K-RERA agent register.</p>
              </article>
              <article className="business-detail-card">
                <span className="business-detail-label">EMAIL ON PUBLIC K-RERA RECORD</span>
                <a className="business-detail-value" href={'mailto:' + trikanBusinessProfile.publicEmail}>{trikanBusinessProfile.publicEmail} <ArrowUpRight size={15} /></a>
                <p>The registry lists this address for the named individual agent; it is not separately confirmed as a general office inbox.</p>
              </article>
              <article className="business-detail-card">
                <span className="business-detail-label">DIRECT AGENT CONTACT · PUBLIC PROFILE</span>
                <a className="business-detail-value" href={'https://wa.me/' + trikanBusinessProfile.agentPhoneDigits + '?text=' + encodeURIComponent('Hello Anseen, I am enquiring about a property listed by Trikan Realtors.')}>{trikanBusinessProfile.agentPhoneDisplay} <ArrowUpRight size={15} /></a>
                <p>This second number is published in Anseen Anil’s Instagram bio. Confirm which number is preferred before relying on it.</p>
                <a className="business-source-link" href={trikanBusinessProfile.agentPhoneSource} target="_blank" rel="noreferrer">Source: agent profile <ExternalLink size={13} /></a>
              </article>
              <article className="business-detail-card business-rera-card">
                <span className="business-detail-label">KERALA RERA · AGENT REGISTER</span>
                <strong className="business-detail-value">{trikanBusinessProfile.agentName}</strong>
                <p>Individual agent · {trikanBusinessProfile.agentRegistration}</p>
                <a className="business-source-link" href={trikanBusinessProfile.reraSource} target="_blank" rel="noreferrer">Check the official agent register <ExternalLink size={13} /></a>
              </article>
            </div>
          </div>
          <p className="business-transparency-note"><ShieldCheck size={16} /> <span>Research checked 16 October 2026. The K-RERA record identifies the named individual as an agent; it does not by itself establish a formal job title within Trikan. Trikan posts/K-RERA publish one phone number; the agent profile publishes another, so both are shown with their source context. No office address was presented as a business location. Unit-level prices and availability must be confirmed.</span></p>
        </section>

        <section className="contact-band">
          <div className="contact-band-orb" />
          <div className="contact-band-copy"><div className="eyebrow"><span className="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</div><h2>Let’s find your <em>place.</em></h2><p>Tell us what you are looking for. We’ll help you take the next step with clarity.</p></div>
          <button className="button button-gold" onClick={() => setContactOpen(true)}>Speak to Trikan <ArrowUpRight size={16} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main"><button className="brand-lockup footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><span className="brand-mark">T<span>.</span></span><span className="brand-wording"><strong>TRIKAN</strong><small>REALTORS</small></span></button><p>{trikanBusinessProfile.officialBio}</p><a href={whatsappBase} target="_blank" rel="noreferrer" className="footer-contact">Connect with the team <ArrowUpRight size={14} /></a></div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} TRIKAN REALTORS</span><span>PUBLIC LISTING REFERENCES · VERIFY BEFORE RELYING</span><div><a href="#privacy" onClick={e => { e.preventDefault(); setPrivacyOpen(true); }}>Privacy & data use</a><a href="https://www.instagram.com/trikan__properties/" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={15} /></a><a href="https://www.facebook.com/p/Trikan-Realtors-61560009638447/" target="_blank" rel="noreferrer" aria-label="Facebook"><MoveUpRight size={15} /></a></div></div>
      </footer>


      {selected && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section className="property-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description" tabIndex={-1}>
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={19} /></button>
        <div className="modal-image"><img src={selected.imageUrl} alt={'Illustrative architecture, not a verified photograph of '+selected.title} /><span className="image-chip">{selected.category}</span><span className="image-disclosure">{isOfficialProjectImage(selected) ? 'Official project render · not the specific unit' : 'Illustrative photo · not the advertised unit'}</span></div>
        <div className="modal-body"><div className="eyebrow"><span className="eyebrow-line" /> {selected.location.toUpperCase()}</div><h2 id="modal-title">{selected.title}</h2><div className="modal-facts">{selected.bedrooms !== null && <span><BedDouble size={15} /> {selected.bedrooms} bedrooms</span>}{selected.areaSqft !== null && <span>{selected.areaSqft.toLocaleString('en-IN')} sq ft</span>}</div><h3>{selected.priceLabel}</h3><p id="modal-description">{selected.description}</p><div className="modal-status"><span className="status-dot" /> {statusLabel(selected)}</div><div className="modal-actions"><a className="button button-gold" href={waLink(selected)} target="_blank" rel="noreferrer">Ask about this property <ArrowUpRight size={15} /></a>{selected.sourceUrl && <a className="button button-outline" href={selected.sourceUrl} target="_blank" rel="noreferrer">Original post <ExternalLink size={14} /></a>}{selected.relatedSourceUrl && <a className="button button-outline" href={selected.relatedSourceUrl} target="_blank" rel="noreferrer">{selected.relatedSourceLabel ?? 'Related source'} <ExternalLink size={14} /></a>}{selected.officialSourceUrl && <a className="button button-outline" href={selected.officialSourceUrl} target="_blank" rel="noreferrer">Official project page <ExternalLink size={14} /></a>}{selected.inventorySourceUrl && <a className="button button-outline" href={selected.inventorySourceUrl} target="_blank" rel="noreferrer">Official inventory snapshot <ExternalLink size={14} /></a>}{selected.reraSourceUrl && <a className="button button-outline" href={selected.reraSourceUrl} target="_blank" rel="noreferrer">Official K-RERA record <ExternalLink size={14} /></a>}</div><p className="modal-disclaimer">The photo is illustrative and may not depict the advertised unit. Confirm live availability, price, unit details and documentation with Trikan before relying on this listing.</p></div>
      </section></div>}

      {contactOpen && !privacyOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setContactOpen(false); }}><section className="contact-modal panel" role="dialog" aria-modal="true" aria-labelledby="contact-title" aria-describedby="contact-description" tabIndex={-1}><button className="modal-close" onClick={() => setContactOpen(false)} aria-label="Close"><X size={19} /></button><div className="eyebrow"><span className="eyebrow-line" /> LET’S TALK PROPERTY</div><h2 id="contact-title">What are you looking for?</h2><p id="contact-description">Share a few details and continue directly to WhatsApp to speak with Trikan.</p><form onSubmit={submitEnquiry}><label>Your name<input value={name} onChange={e => setName(e.target.value)} placeholder="How should we address you?" autoComplete="name" /></label><label>Phone number<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your mobile number" required minLength={7} autoComplete="tel" /></label><label>Email <span className="optional">(optional)</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label><label>How can we help?<textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required minLength={5} maxLength={3800} placeholder="Tell us what property or information you are looking for." /></label><label className="contact-consent"><input type="checkbox" checked={contactConsent} onChange={e => setContactConsent(e.target.checked)} required /><span>I agree that Trikan may contact me about this enquiry.</span></label>{formError && <p className="error-message" role="alert">{formError}</p>}<button className="button button-gold full-button" disabled={submitting || !contactConsent}>{submitting ? 'Saving enquiry…' : 'Continue to WhatsApp'} <ArrowUpRight size={15} /></button><small className="form-privacy">Your information is used to respond to this enquiry. <a href="#privacy" onClick={e => { e.preventDefault(); setPrivacyOpen(true); }}>Read the privacy notice</a>. Do not include sensitive financial or identity details.</small></form></section></div>}

      {privacyOpen && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setPrivacyOpen(false); }}><section className="contact-modal panel privacy-modal" role="dialog" aria-modal="true" aria-labelledby="privacy-title" aria-describedby="privacy-description" tabIndex={-1}><button className="modal-close" onClick={() => setPrivacyOpen(false)} aria-label="Close privacy notice"><X size={19} /></button><div className="eyebrow"><span className="eyebrow-line" /> PRIVACY · UPDATED 16 OCTOBER 2026</div><h2 id="privacy-title">Privacy & data use</h2><p id="privacy-description">Trikan Realtors uses information submitted through this website to respond to property enquiries and help coordinate next steps. Please share only details needed for your enquiry.</p><h3>Information you may provide</h3><ul><li>Your name, phone number, and optional email address.</li><li>Your message, selected property reference, and any preferences such as budget or buying timeline that you choose to submit through the chat lead form.</li><li>Basic enquiry details used to manage your request. The website chat generates replies locally and does not send chat messages to a third-party generative AI service.</li></ul><h3>How information is used and shared</h3><p>Website enquiries are stored in the site’s Supabase database so the Trikan team can review and respond. The chat lead form stores contact details and a recent excerpt of the conversation (up to 2,500 characters) with the enquiry, rather than a full chat history. If you choose to continue via WhatsApp, your prepared message is opened in WhatsApp and is sent only when you press Send. WhatsApp then handles that message under its own privacy terms.</p><p>Your enquiry details are not intentionally sold or used to build an unrelated marketing list. The website relies on hosting and database service providers to operate. The site owner is responsible for managing enquiry retention, access, and deletion in line with applicable requirements.</p><h3>Your choices and requests</h3><p>You can choose not to submit this form and contact Trikan directly. For a request about access to, correction of, or deletion of enquiry information, contact the team using the public number <a className="privacy-contact" href="https://wa.me/918921536717">+91 89215 36717</a> or the agent email listed on the public K-RERA record, <a className="privacy-contact" href="mailto:anseen1995@gmail.com">anseen1995@gmail.com</a>.</p><p>Please do not submit identity documents, bank details, passwords, or other sensitive information through the enquiry form. Although reasonable safeguards are used, no online transmission or storage method can be guaranteed completely secure.</p><button className="button button-gold full-button" onClick={() => setPrivacyOpen(false)}>Close notice</button></section></div>}

      <div className="build-disclosure">Public social-post research reviewed 16 October 2026 · Confirm current prices and availability with Trikan</div>
      <PropertyChatWidget />
    </div>
  );
}