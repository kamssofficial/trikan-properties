import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Check, LogOut, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { Property, ListingStatus } from '../data/properties';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import EnquiriesPanel from './EnquiriesPanel';

type Props = {
  properties: Property[];
  session: Session | null;
  onClose: () => void;
  onSignIn: (session: Session | null) => void;
  onRefresh: () => Promise<void>;
};

const OWNER_EMAIL = 'kamssofficial@gmail.com';

function hasAdminAccess(session: Session | null) {
  return Boolean(session && (
    session.user.app_metadata?.role === 'admin' ||
    session.user.email?.toLowerCase() === OWNER_EMAIL
  ));
}

const emptyForm = {
  title: '', location: '', category: 'Apartment', bedrooms: '3',
  areaSqft: '', priceLabel: 'Price on enquiry', description: '',
  imageUrl: '', sourceUrl: '', featured: false,
};

export default function AdminPanel({ properties, session, onClose, onSignIn, onRefresh }: Props) {
  const email = OWNER_EMAIL;
  const [form, setForm] = useState(emptyForm);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      onSignIn(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, [onSignIn]);

  async function sendOwnerMagicLink() {
    if (!supabase || busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: OWNER_EMAIL,
        options: {
          emailRedirectTo: 'https://trikan-properties.onrender.com/?admin=1',
          shouldCreateUser: false,
        },
      });
      if (authError) throw authError;
      setNotice('Secure sign-in link sent to ' + OWNER_EMAIL + '. Open the latest email in this browser to finish sign-in.');
    } catch {
      setError('The sign-in email could not be sent. Check your connection and try again, or request a fresh link in a minute.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (supabase) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      }
      onSignIn(null);
    } catch {
      setError('Could not sign out safely. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(id: string, status: ListingStatus) {
    if (!supabase || busy) return;
    setBusy(true); setError(''); setNotice('');
    let saved = false;
    try {
      const { error: updateError } = await supabase.from('properties').update({ status }).eq('id', id);
      if (updateError) throw updateError;
      saved = true;
    } catch {
      setError('The listing status could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
    if (saved) {
      setNotice('Listing status updated.');
      try { await onRefresh(); }
      catch { setError('The status was saved, but the list could not refresh. Use Refresh to reload it.'); }
    }
  }

  async function setFeatured(id: string, featured: boolean) {
    if (!supabase || busy) return;
    setBusy(true); setError(''); setNotice('');
    let saved = false;
    try {
      const { error: updateError } = await supabase.from('properties').update({ featured }).eq('id', id);
      if (updateError) throw updateError;
      saved = true;
    } catch {
      setError('The featured setting could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
    if (saved) {
      setNotice(featured ? 'Listing added to featured properties.' : 'Listing removed from featured properties.');
      try { await onRefresh(); }
      catch { setError('The setting was saved, but the list could not refresh. Use Refresh to reload it.'); }
    }
  }

  async function createListing(event: FormEvent) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true); setError(''); setNotice('');
    let saved = false;
    try {
      const { error: insertError } = await supabase.from('properties').insert({
        title: form.title.trim(),
        location: form.location.trim(),
        category: form.category,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        area_sqft: form.areaSqft ? Number(form.areaSqft) : null,
        price_label: form.priceLabel.trim() || 'Price on enquiry',
        description: form.description.trim(),
        image_url: form.imageUrl.trim() || null,
        source_url: form.sourceUrl.trim() || null,
        featured: form.featured,
        status: 'verify',
      });
      if (insertError) throw insertError;
      saved = true;
    } catch {
      setError('The listing could not be saved. Check the required details and try again.');
    } finally {
      setBusy(false);
    }
    if (saved) {
      setNotice('Listing created as needs verification.');
      setForm(emptyForm); setShowCreate(false);
      try { await onRefresh(); }
      catch { setError('The listing was saved, but the list could not refresh. Use Refresh to reload it.'); }
    }
  }

  async function deleteListing(id: string) {
    if (!supabase || busy || !window.confirm('Delete this listing? This cannot be undone.')) return;
    setBusy(true); setError(''); setNotice('');
    let deleted = false;
    try {
      const { error: deleteError } = await supabase.from('properties').delete().eq('id', id);
      if (deleteError) throw deleteError;
      deleted = true;
    } catch {
      setError('The listing could not be deleted. Please retry.');
    } finally {
      setBusy(false);
    }
    if (deleted) {
      setNotice('Listing deleted.');
      try { await onRefresh(); }
      catch { setError('The listing was deleted, but the list could not refresh. Use Refresh to reload it.'); }
    }
  }

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <button className="icon-button" onClick={onClose} aria-label="Back to website"><ArrowLeft size={18} /></button>
        <div className="admin-brand"><span className="eyebrow">TRIKAN / CONTROL ROOM</span><h2>Property management</h2></div>
        {session && <button type="button" className="button button-quiet" onClick={signOut} disabled={busy}><LogOut size={15} /> Sign out</button>}
      </header>

      {!isSupabaseConfigured || !supabase ? (
        <div className="admin-state">
          <ShieldCheck size={34} />
          <h3>Connect the secure admin backend</h3>
          <p>The dashboard UI is ready, but authentication and data storage are disabled until Supabase environment variables are set and the database migration is applied.</p>
          <p className="muted">See the README and <code>.env.example</code>. Do not put a Supabase service-role key in the frontend.</p>
        </div>
      ) : !session ? (
        <div className="admin-login panel">
          <span className="eyebrow">AUTHORIZED ACCESS ONLY</span>
          <h3>Sign in to manage listings</h3>
          <label>Owner email<input type="email" value={email} readOnly autoComplete="username" /></label>
          <button className="button button-gold" type="button" disabled={busy} onClick={() => void sendOwnerMagicLink()}>{busy ? 'Sending…' : 'Email me a secure sign-in link'}</button>
          {notice && <p className="notice" role="status" aria-live="polite"><Check size={16} /> {notice}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          <p className="muted">Owner access is restricted to the verified KAMSS email and uses a one-time sign-in link. No password is required.</p>
        </div>
      ) : !hasAdminAccess(session) ? (
        <div className="admin-state">
          <ShieldCheck size={34} />
          <h3>Admin access required</h3>
          <p>This account is signed in but does not have the trusted admin role. Ask the site owner to grant access, or sign out.</p>
          <button type="button" className="button button-quiet" onClick={signOut} disabled={busy}><LogOut size={15} /> Sign out</button>
        </div>
      ) : (
        <div className="admin-content">
          <div className="admin-overview">
            <div className="panel"><span className="muted">Catalogue items</span><strong>{properties.length}</strong></div>
            <div className="panel"><span className="muted">Need verification</span><strong>{properties.filter(p => p.status === 'verify').length}</strong></div>
            <div className="panel"><span className="muted">Marked available</span><strong>{properties.filter(p => p.status === 'available').length}</strong></div>
          </div>
          {notice && <p className="notice" role="status" aria-live="polite"><Check size={16} /> {notice}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="admin-actions">
            <h3>Listings</h3>
            <div className="button-row">
              <button type="button" className="button button-quiet" onClick={() => void onRefresh()} disabled={busy}><RefreshCw size={15} /> Refresh</button>
              <button type="button" className="button button-gold" aria-expanded={showCreate} aria-controls={showCreate ? "new-listing-form" : undefined} onClick={() => setShowCreate(v => !v)}><Plus size={16} /> {showCreate ? 'Close listing form' : 'Add listing'}</button>
            </div>
          </div>
          {showCreate && (
            <form className="panel listing-form" id="new-listing-form" onSubmit={createListing}>
              <h4>New listing</h4>
              <div className="form-grid">
                <label>Title<input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></label>
                <label>Location<input required value={form.location} onChange={e => setForm({...form, location: e.target.value})} /></label>
                <label>Category<select value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option>Apartment</option><option>Villa</option><option>Penthouse</option><option>Land</option><option>Commercial</option></select></label>
                <label>Bedrooms<input type="number" min="0" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} /></label>
                <label>Area (sq ft)<input type="number" min="0" value={form.areaSqft} onChange={e => setForm({...form, areaSqft: e.target.value})} /></label>
                <label>Price label<input value={form.priceLabel} onChange={e => setForm({...form, priceLabel: e.target.value})} /></label>
                <label className="full-width">Image URL<input type="url" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></label>
                <label className="full-width">Source URL<input type="url" value={form.sourceUrl} onChange={e => setForm({...form, sourceUrl: e.target.value})} /></label>
                <label className="full-width">Description<textarea rows={3} maxLength={4000} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></label>
                <label className="admin-form-checkbox full-width"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /><span>Feature this property on the public homepage</span></label>
              </div>
              <div className="button-row"><button className="button button-quiet" type="button" onClick={() => setShowCreate(false)}>Cancel</button><button className="button button-gold" disabled={busy}>Save as needs verification</button></div>
            </form>
          )}
          <div className="admin-list">
            {properties.map(property => (
              <article className="admin-listing" key={property.id}>
                <div className="admin-listing-copy"><strong>{property.title}</strong><span>{property.location}</span><small>{property.priceLabel}</small></div>
                <div className="admin-listing-actions">
                  <select aria-label={'Status for '+property.title} value={property.status} onChange={e => void setStatus(property.id, e.target.value as ListingStatus)} disabled={busy}>
                    <option value="verify">Needs verification</option><option value="available">Available (confirmed)</option><option value="under_offer">Under offer</option><option value="sold">Sold</option>
                  </select>
                  <button type="button" aria-pressed={property.featured} className={'tiny-toggle '+(property.featured?'selected':'')} onClick={() => void setFeatured(property.id, !property.featured)} disabled={busy}>{property.featured ? 'Featured' : 'Feature'}</button>
                  <button className="icon-button danger" onClick={() => void deleteListing(property.id)} aria-label={'Delete '+property.title} disabled={busy}><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
          <EnquiriesPanel />
          <p className="muted admin-footnote">Mark a listing “Available” only after direct confirmation from Trikan. Changes are persisted in Supabase.</p>
        </div>
      )}
    </div>
  );
}