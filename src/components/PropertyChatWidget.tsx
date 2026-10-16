import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Bot, Check, ChevronDown, Home, LoaderCircle, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { seedProperties, type Property } from '../data/properties';
import { getWhatsAppNumber, isSupabaseConfigured, supabase } from '../lib/supabase';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  propertyIds?: string[];
};

type ContactDetails = {
  name: string;
  phone: string;
  email: string;
  budget: string;
  timeline: string;
  consent: boolean;
};

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hello — welcome to Trikan Properties. I can help you explore homes, narrow down options by location and budget, and arrange a conversation with the team. What are you looking for?',
};

const quickPrompts = [
  'Show me 3 BHK homes',
  'Properties in Kochi',
  'I want to speak to an advisor',
];

const whatsappUrl = (message: string) =>
  'https://wa.me/' + getWhatsAppNumber() + '?text=' + encodeURIComponent(message);

function idForMessage() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function propertyMatches(query: string, properties: Property[]): Property[] {
  const q = query.toLowerCase();
  const bedroom = q.match(/\b([1-9])\s*(?:bhk|bed(?:room)?s?)\b/i);
  const locationTerms = ['kochi', 'ernakulam', 'marine drive', 'mg road', 'm.g. road', 'thrikkakara', 'edappally', 'elamakkara', 'thrissur', 'feroke', 'kozhikode'];
  const location = locationTerms.find(term => q.includes(term));
  const budgetMatch = q.match(/(?:under|below|budget(?: is)?|upto|up to)\s*(?:₹|rs\.?\s*)?(\d+(?:\.\d+)?)\s*(cr|crore|l|lakh|lakhs)?/i);
  let candidates = properties.filter(p => p.status !== 'sold');

  if (bedroom) candidates = candidates.filter(p => p.bedrooms === Number(bedroom[1]) || p.title.toLowerCase().includes(bedroom[1] + ' bhk'));
  if (location) candidates = candidates.filter(p => (p.location + ' ' + p.title + ' ' + p.description).toLowerCase().includes(location));
  if (q.includes('penthouse')) candidates = candidates.filter(p => p.category.toLowerCase() === 'penthouse' || p.title.toLowerCase().includes('penthouse'));
  if (q.includes('villa')) candidates = candidates.filter(p => p.category.toLowerCase() === 'villa' || p.title.toLowerCase().includes('villa'));

  if (budgetMatch) {
    const amount = Number(budgetMatch[1]);
    const unit = (budgetMatch[2] || '').toLowerCase();
    const maxRupees = unit.startsWith('cr') ? amount * 10000000 : unit.startsWith('l') ? amount * 100000 : amount * 10000000;
    const priced = candidates.filter(p => {
      const price = p.priceLabel.match(/₹\s*([\d.]+)\s*(Cr\+?|cr\+?|lakh|lakhs)?/i);
      if (!price) return true;
      const value = Number(price[1]) * (/cr/i.test(price[2] || '') ? 10000000 : /lakh/i.test(price[2] || '') ? 100000 : 10000000);
      return value <= maxRupees;
    });
    if (priced.length) candidates = priced;
  }

  if (candidates.length === properties.filter(p => p.status !== 'sold').length && q.trim()) {
    const words = q.split(/[^a-z0-9]+/).filter(w => w.length > 2);
    const scored = properties.filter(p => p.status !== 'sold').map(p => ({
      property: p,
      score: words.reduce((score, word) => score + ((p.title + ' ' + p.location + ' ' + p.description).toLowerCase().includes(word) ? 1 : 0), 0),
    })).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
    if (scored.length) candidates = scored.map(item => item.property);
  }

  return candidates.slice(0, 3);
}

function localAnswer(query: string, properties: Property[]): { content: string; propertyIds: string[] } {
  const q = query.toLowerCase();
  const matches = propertyMatches(query, properties);

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(q.trim())) {
    return { content: 'Hi! I can help you compare property references, understand what to verify, or connect you with Trikan. Which city, budget, and bedroom count do you have in mind?', propertyIds: [] };
  }
  if (/advisor|agent|human|call me|callback|call back|contact|viewing|visit|schedule|book a/i.test(q)) {
    return { content: 'Of course. Share your contact details using “Talk to an advisor” and I’ll prepare a concise enquiry for the Trikan team. You can also continue directly on WhatsApp.', propertyIds: matches.slice(0, 2).map(p => p.id) };
  }
  if (/price|cost|available|availability|inventory|still there|current listing|rera|legal|document/i.test(q)) {
    return { content: 'I can share what appears in Trikan’s public listing references, but I can’t verify live inventory, current prices, RERA status, or documents from this chat. Treat each price as historical where labelled and confirm every detail with the Trikan team before making a decision.' + (matches.length ? ' Here are the closest catalogue references:' : ' Tell me the location or project name and I’ll narrow the catalogue.') , propertyIds: matches.slice(0, 3).map(p => p.id) };
  }
  if (matches.length > 0 && (/bhk|bed|property|home|house|apartment|villa|penthouse|kochi|ernakulam|thrissur|edappally|elamakkara|feroke|budget|investment|looking|show|find|recommend/i.test(q))) {
    return { content: 'Based on your message, these are the closest matches in the current catalogue. These are references to past public posts, not confirmation of live availability. Would you like to ask about one, adjust your budget, or talk to an advisor?', propertyIds: matches.map(p => p.id) };
  }
  if (/help|what can you do|options|start/i.test(q)) {
    return { content: 'I can match listings by bedrooms and location, explain the details currently shown on the site, help prepare questions for a viewing, and collect your enquiry for the team. Tell me your preferred area, bedroom count, and approximate budget to begin.', propertyIds: [] };
  }
  return {
    content: 'I can help narrow the options. What location do you prefer, how many bedrooms do you need, and what is your approximate budget? I’ll use the published catalogue as a starting point and flag anything that needs direct confirmation.',
    propertyIds: matches.slice(0, 2).map(p => p.id),
  };
}

export default function PropertyChatWidget() {
  const [properties, setProperties] = useState<Property[]>(seedProperties);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadSending, setLeadSending] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [leadNotice, setLeadNotice] = useState('');
  const [contact, setContact] = useState<ContactDetails>({
    name: '', phone: '', email: '', budget: '', timeline: 'Exploring options', consent: false,
  });
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.from('properties').select('*').neq('status', 'sold').order('featured', { ascending: false }).limit(30)
      .then(({ data, error }) => {
        if (!active || error || !data?.length) return;
        setProperties(data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          title: String(row.title ?? 'Property'),
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
        })));
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: 'smooth' });
    inputRef.current?.focus();
  }, [isOpen, messages, sending, leadOpen]);

  const propertyById = useMemo(() => new Map(properties.map(property => [property.id, property])), [properties]);

  async function sendMessage(raw: string) {
    const text = raw.trim();
    if (!text || sending) return;
    const userMessage: ChatMessage = { id: idForMessage(), role: 'user', content: text };
    setInput('');
    setSending(true);

    // API-free mode: all chat replies are generated locally from deterministic
    // property matching and response rules. No LLM/provider endpoint is called.
    const local = localAnswer(text, properties);
    const assistantMessage: ChatMessage = {
      id: idForMessage(),
      role: 'assistant',
      content: local.content,
      propertyIds: local.propertyIds,
    };
    setMessages(previous => [...previous, userMessage, assistantMessage]);
    setSending(false);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  async function handleLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadError('');
    setLeadNotice('');
    setLeadSending(true);

    const transcript = messages.slice(-8).map(message => (message.role === 'user' ? 'Visitor' : 'Assistant') + ': ' + message.content).join('\n');
    const latestUserText = [...messages].reverse().find(message => message.role === 'user')?.content ?? 'General property enquiry';
    const summary = [
      'WEBSITE CHAT LEAD',
      'Budget: ' + (contact.budget || 'Not provided'),
      'Timeline: ' + contact.timeline,
      'Consent to contact: yes',
      'Conversation summary:',
      transcript.slice(-2500),
    ].join('\n');
    const linkedProperty = [...messages].reverse().flatMap(message => message.propertyIds ?? []).map(id => propertyById.get(id)).find(Boolean);
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const waMessage = [
      'Hello Trikan Properties, I came through your website AI assistant.',
      'Name: ' + contact.name.trim(),
      'Phone: ' + contact.phone.trim(),
      contact.email.trim() ? 'Email: ' + contact.email.trim() : '',
      'Budget: ' + (contact.budget || 'Not specified'),
      'Timeline: ' + contact.timeline,
      'Interest: ' + (linkedProperty ? linkedProperty.title + ' — ' + linkedProperty.location : latestUserText),
      'Request: ' + latestUserText,
      'Please confirm current price, availability and next steps.',
    ].filter(Boolean).join('\n');

    const popup = window.open('about:blank', '_blank');
    let saved = false;
    if (supabase && isSupabaseConfigured) {
      const { error } = await supabase.from('enquiries').insert({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: contact.email.trim() || null,
        message: summary,
        property_id: linkedProperty && uuidPattern.test(linkedProperty.id) ? linkedProperty.id : null,
        source: 'website_chat',
      });
      saved = !error;
      if (error) setLeadError('The enquiry could not be saved to the inbox. WhatsApp is still available so the visitor can send the request directly.');
    }

    setLeadSending(false);
    setLeadOpen(false);
    setLeadNotice(saved ? 'Enquiry saved. WhatsApp is opening for a direct handoff.' : 'Your enquiry is ready for WhatsApp. Press Send there to reach the Trikan team.');
    setMessages(previous => [...previous, {
      id: idForMessage(),
      role: 'assistant',
      content: saved
        ? 'Thanks, ' + contact.name.trim() + '. Your details have been added to the Trikan enquiry inbox. WhatsApp is opening so you can also send the request directly.'
        : 'Thanks, ' + contact.name.trim() + '. Your message is prepared for WhatsApp. Please press Send in WhatsApp to reach the Trikan team.',
    }]);
    if (popup) {
      popup.opener = null;
      popup.location.href = whatsappUrl(waMessage);
    } else {
      setLeadNotice('Your enquiry is ready. Pop-ups were blocked, so use the WhatsApp button below to send it.');
    }
  }

  const latestLeadMessage = useMemo(() => [...messages].reverse().find(message => message.role === 'user')?.content ?? '', [messages]);

  return (
    <div className="tcw-root">
      {isOpen && (
        <section className="tcw-panel" role="dialog" aria-modal="false" aria-labelledby="tcw-title">
          <header className="tcw-header">
            <div className="tcw-brand-icon"><Bot size={20} /></div>
            <div className="tcw-header-copy">
              <strong id="tcw-title">Trikan Concierge</strong>
              <span><i /> Property assistant · typically replies instantly</span>
            </div>
            <button className="tcw-icon-button" onClick={() => setIsOpen(false)} aria-label="Close chat"><X size={19} /></button>
          </header>

          <div className="tcw-assurance"><Sparkles size={13} /> Ask about properties, locations, budgets or viewings</div>

          <div className="tcw-transcript" ref={transcriptRef} aria-live="polite">
            {messages.map(message => (
              <div className={'tcw-message-row ' + (message.role === 'user' ? 'tcw-user-row' : 'tcw-assistant-row')} key={message.id}>
                {message.role === 'assistant' && <span className="tcw-message-avatar"><Bot size={14} /></span>}
                <div className={'tcw-bubble ' + (message.role === 'user' ? 'tcw-user-bubble' : 'tcw-assistant-bubble')}>
                  <p>{message.content}</p>
                  {message.propertyIds && message.propertyIds.length > 0 && (
                    <div className="tcw-suggestions">
                      {message.propertyIds.map(id => propertyById.get(id)).filter((property): property is Property => Boolean(property)).map(property => (
                        <article className="tcw-property-mini" key={property.id}>
                          <div className="tcw-mini-icon"><Home size={16} /></div>
                          <div className="tcw-mini-copy">
                            <strong>{property.title}</strong>
                            <span>{property.location}</span>
                            <small>{property.bedrooms !== null ? property.bedrooms + ' BHK · ' : ''}{property.areaSqft !== null ? property.areaSqft.toLocaleString('en-IN') + ' sq ft · ' : ''}{property.priceLabel}</small>
                          </div>
                          {property.sourceUrl && <a href={property.sourceUrl} target="_blank" rel="noreferrer" aria-label={'Open original source for ' + property.title}><ArrowUpRight size={14} /></a>}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && <div className="tcw-message-row tcw-assistant-row"><span className="tcw-message-avatar"><Bot size={14} /></span><div className="tcw-bubble tcw-assistant-bubble tcw-thinking"><span /><span /><span /></div></div>}
            {leadNotice && <div className="tcw-notice"><Check size={14} /> {leadNotice}</div>}
          </div>

          {leadOpen ? (
            <form className="tcw-lead-form" onSubmit={handleLeadSubmit}>
              <div className="tcw-lead-heading"><div><strong>Talk to a Trikan advisor</strong><span>Share your details and property preferences.</span></div><button type="button" className="tcw-icon-button" onClick={() => setLeadOpen(false)} aria-label="Close contact form"><X size={17} /></button></div>
              <label>Name<input required autoComplete="name" value={contact.name} onChange={event => setContact({ ...contact, name: event.target.value })} placeholder="Your full name" maxLength={120} /></label>
              <label>Phone number<input required type="tel" autoComplete="tel" value={contact.phone} onChange={event => setContact({ ...contact, phone: event.target.value })} placeholder="+91 9XXXXXXXXX" minLength={7} maxLength={40} /></label>
              <label>Email <span>(optional)</span><input type="email" autoComplete="email" value={contact.email} onChange={event => setContact({ ...contact, email: event.target.value })} placeholder="you@example.com" maxLength={254} /></label>
              <div className="tcw-form-grid">
                <label>Approx. budget<select value={contact.budget} onChange={event => setContact({ ...contact, budget: event.target.value })}><option value="">Not decided</option><option>Under ₹75 lakh</option><option>₹75 lakh–₹1.5 Cr</option><option>₹1.5–₹3 Cr</option><option>₹3 Cr+</option></select></label>
                <label>When are you looking?<select value={contact.timeline} onChange={event => setContact({ ...contact, timeline: event.target.value })}><option>Immediately</option><option>Within 1 month</option><option>Within 3 months</option><option>Exploring options</option></select></label>
              </div>
              <label className="tcw-consent"><input type="checkbox" checked={contact.consent} onChange={event => setContact({ ...contact, consent: event.target.checked })} required /><span>I agree that Trikan may contact me about this enquiry.</span></label>
              {leadError && <p className="tcw-error">{leadError}</p>}
              <button className="tcw-primary-button" type="submit" disabled={leadSending || !contact.consent}>{leadSending ? <><LoaderCircle size={16} className="tcw-spin" /> Sending…</> : <>Prepare enquiry <ArrowUpRight size={15} /></>}</button>
              <small className="tcw-privacy">Your details are used to respond to this request. Do not share identity or payment credentials.</small>
            </form>
          ) : (
            <div className="tcw-composer-wrap">
              {messages.length === 1 && <div className="tcw-quick-prompts">{quickPrompts.map(prompt => <button type="button" key={prompt} onClick={() => {
                if (/advisor/i.test(prompt)) setLeadOpen(true);
                else void sendMessage(prompt);
              }}>{prompt}<ChevronDown size={12} /></button>)}</div>}
              <div className="tcw-composer">
                <textarea ref={inputRef} rows={1} value={input} onChange={event => setInput(event.target.value)} onKeyDown={handleInputKeyDown} placeholder="Ask about a property…" aria-label="Message Trikan Concierge" maxLength={1000} />
                <button type="button" onClick={() => void sendMessage(input)} disabled={sending || !input.trim()} aria-label="Send message"><Send size={17} /></button>
              </div>
              <div className="tcw-composer-footer"><span>Enter to send · Shift + Enter for new line</span><button type="button" onClick={() => { setLeadOpen(true); setLeadError(''); }}><MessageCircle size={13} /> Talk to an advisor</button></div>
              {leadNotice && <a className="tcw-whatsapp-link" href={whatsappUrl('Hello Trikan Properties, ' + latestLeadMessage)} target="_blank" rel="noreferrer"><MessageCircle size={14} /> Continue to WhatsApp <ArrowUpRight size={13} /></a>}
              <div className="tcw-footer-note">Listing details and availability must be confirmed by Trikan.</div>
            </div>
          )}
        </section>
      )}

      <button className={'tcw-launcher ' + (isOpen ? 'tcw-launcher-open' : '')} onClick={() => setIsOpen(value => !value)} aria-expanded={isOpen} aria-controls="tcw-title" aria-label={isOpen ? 'Close Trikan Concierge' : 'Open Trikan Concierge'}>
        {isOpen ? <X size={22} /> : <><span className="tcw-launcher-spark"><Sparkles size={12} /></span><MessageCircle size={22} /><span className="tcw-launcher-text">Ask Trikan</span></>}
      </button>
    </div>
  );
}
