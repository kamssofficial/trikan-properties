import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, UserRound, Phone, Mail, MessageSquareText } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Enquiry = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'spam';
  created_at: string;
  property_id: string | null;
};

const statuses: Enquiry['status'][] = ['new', 'contacted', 'qualified', 'closed', 'spam'];

export default function EnquiriesPanel() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('open');

  const load = useCallback(async () => {
    if (!supabase) { setItems([]); setLoading(false); return; }
    setLoading(true); setError('');
    const { data, error: loadError } = await supabase
      .from('enquiries')
      .select('id,name,email,phone,message,source,status,created_at,property_id')
      .order('created_at', { ascending: false })
      .limit(150);
    setLoading(false);
    if (loadError) setError(loadError.message);
    else setItems((data ?? []) as Enquiry[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function updateStatus(id: string, status: Enquiry['status']) {
    if (!supabase) return;
    const { error: updateError } = await supabase.from('enquiries').update({ status }).eq('id', id);
    if (updateError) setError(updateError.message);
    else await load();
  }

  const shown = items.filter(item => filter === 'all' || (filter === 'open' ? !['closed', 'spam'].includes(item.status) : item.status === filter));
  return (
    <section className="enquiries-area">
      <div className="admin-actions enquiries-heading">
        <div><h3>Enquiry inbox</h3><p className="muted">Latest website enquiries · up to 150 records</p></div>
        <div className="button-row">
          <select aria-label="Filter enquiries" value={filter} onChange={e => setFilter(e.target.value)} className="enquiry-filter">
            <option value="open">Open enquiries</option><option value="all">All enquiries</option>
            {statuses.map(status => <option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}
          </select>
          <button className="button button-quiet" onClick={() => void load()} disabled={loading}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>
      {error && <p className="error-message">{error}. Check the Supabase migration and admin role claim.</p>}
      {loading ? <p className="muted">Loading enquiries…</p> : shown.length === 0 ? (
        <div className="enquiries-empty"><MessageSquareText size={24} /><strong>No enquiries here yet</strong><span>New web enquiries will appear here after Supabase is configured.</span></div>
      ) : (
        <div className="enquiry-list">
          {shown.map(item => (
            <article className="enquiry-card" key={item.id}>
              <div className="enquiry-card-main">
                <div className="enquiry-card-heading"><span className="enquiry-avatar"><UserRound size={16} /></span><div><strong>{item.name?.trim() || 'Website visitor'}</strong><small>{new Date(item.created_at).toLocaleString()}</small></div></div>
                <p className="enquiry-message">{item.message}</p>
                <div className="enquiry-contacts">
                  {item.phone && <a href={'tel:'+item.phone}><Phone size={13} /> {item.phone}</a>}
                  {item.email && <a href={'mailto:'+item.email}><Mail size={13} /> {item.email}</a>}
                </div>
              </div>
              <div className="enquiry-card-actions"><span className={'enquiry-status status-'+item.status}>{item.status.replace('_',' ')}</span><select value={item.status} aria-label="Change enquiry status" onChange={e => void updateStatus(item.id, e.target.value as Enquiry['status'])}>{statuses.map(status => <option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}</select></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
