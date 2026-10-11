import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API } from '../utils/cart';

const SIZE_LABELS = { SZ_01: 'Small', SZ_02: 'Regular', SZ_03: 'Large' };

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Preparing: 'bg-blue-100 text-blue-800',
  Dispatched: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-700'
};

const isoDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const pad = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function recipeLines(item, names) {
  const nm = (id) => names[id] || id;
  const lines = [['Size', SIZE_LABELS[item.sizeId] || item.sizeId]];
  const shells = Object.entries(item.selectedShells || {});
  if (shells.length) lines.push(['Shells', shells.map(([id, q]) => `${q}× ${nm(id)}`).join(', ')]);
  if ((item.selectedPantryIngredients || []).length) lines.push(['Fillings', item.selectedPantryIngredients.map(nm).join(', ')]);
  if ((item.selectedMealCompanions || []).length) lines.push(['Meal extras', item.selectedMealCompanions.map(nm).join(', ')]);
  const packets = Object.entries(item.selectedPackets || {});
  if (packets.length) lines.push(['Packets', packets.map(([id, q]) => `${q}× ${nm(id)}`).join(', ')]);
  return lines;
}

const EMPTY_FILTERS = { q: '', status: 'All', from: '', to: '', min: '', max: '', sort: 'newest' };

export default function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem('activeUser_id');
  const flagMember = localStorage.getItem('is_member') === 'true';
  const highlight = location.state?.orderno;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [names, setNames] = useState({});
  const [isMember, setIsMember] = useState(flagMember);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const set = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  useEffect(() => {
    fetch(`${API}/menu/names`).then((r) => r.json()).then(setNames).catch(() => {});
  }, []);

  // Re-query the Order + OrderItem tables whenever a filter changes (search text is debounced)
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== 'All') params.set(k, v); });
      try {
        const res = await fetch(`${API}/orders/${userId}?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load orders');
        setOrders(data.orders);
        setStatuses(data.statuses || []);
        setIsMember(data.isMember);
        setError('');
      } catch (e) {
        setError(e.message === 'Failed to fetch' ? 'Cannot reach the server. Is the backend running?' : e.message);
      } finally {
        setLoading(false);
      }
    }, filters.q ? 300 : 0);
    return () => clearTimeout(timer);
  }, [filters, userId]);

  const money = (n) => `₹${n}`;
  const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const Header = (
    <div className="flex flex-col space-y-1 border-b border-stone-200/60 pb-4">
      <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">My Orders</h1>
      <div className="w-12 h-1 bg-amber-600 rounded-full"></div>
    </div>
  );

  if (!userId) {
    return (
      <div className="space-y-8 pb-12 font-sans">
        {Header}
        <div className="flex flex-col items-center py-16 text-center space-y-4 max-w-sm mx-auto">
          <div className="text-5xl">🔐</div>
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">Sign in to see your orders</h2>
          <p className="text-xs text-stone-500 font-medium">Your order history is saved to your account.</p>
          <button onClick={() => navigate('/auth')} className="px-6 py-3 bg-neutral-900 hover:bg-amber-600 text-white font-black text-xs tracking-widest uppercase rounded-full cursor-pointer transition-colors">Sign in</button>
        </div>
      </div>
    );
  }

  const inputCls = 'px-3 py-2 text-xs font-semibold border border-stone-300 rounded-lg outline-none focus:border-amber-600 bg-white';
  const labelCls = 'text-[9px] font-black uppercase tracking-widest text-stone-400 block mb-1';
  const statusOptions = ['All', ...statuses];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {Header}

      {/* ---------- member-only search & filters ---------- */}
      {isMember ? (
        <section className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-500">🔎 Search your past orders</h2>
            {filtersActive && (
              <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-[10px] font-black uppercase tracking-wider text-amber-700 hover:text-amber-900 cursor-pointer">Clear all</button>
            )}
          </div>

          <input
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Search by order number or dish name (e.g. ORD-123456, Paneer)"
            className={`${inputCls} w-full`}
          />

          <div className="flex flex-wrap gap-2">
            {[['Last 7 days', 7], ['Last 30 days', 30], ['Last 90 days', 90]].map(([label, days]) => (
              <button
                key={label}
                onClick={() => setFilters((f) => ({ ...f, from: isoDaysAgo(days), to: '' }))}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full border cursor-pointer transition ${filters.from === isoDaysAgo(days) && !filters.to ? 'bg-neutral-900 text-white border-neutral-900' : 'bg-white text-stone-600 border-stone-300 hover:border-amber-600'}`}
              >{label}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <div>
              <label className={labelCls}>Status</label>
              <select value={filters.status} onChange={(e) => set('status', e.target.value)} className={`${inputCls} w-full`}>
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>From</label>
              <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => set('from', e.target.value)} className={`${inputCls} w-full`} />
            </div>
            <div>
              <label className={labelCls}>To</label>
              <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => set('to', e.target.value)} className={`${inputCls} w-full`} />
            </div>
            <div>
              <label className={labelCls}>Min ₹</label>
              <input type="number" min="0" value={filters.min} onChange={(e) => set('min', e.target.value)} className={`${inputCls} w-full`} />
            </div>
            <div>
              <label className={labelCls}>Max ₹</label>
              <input type="number" min="0" value={filters.max} onChange={(e) => set('max', e.target.value)} className={`${inputCls} w-full`} />
            </div>
            <div>
              <label className={labelCls}>Sort by</label>
              <select value={filters.sort} onChange={(e) => set('sort', e.target.value)} className={`${inputCls} w-full`}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="high">Highest total</option>
                <option value="low">Lowest total</option>
              </select>
            </div>
          </div>
        </section>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs font-semibold text-amber-800">
          🔒 Searching and filtering past orders is a Taco Club member feature. Guest sessions can see the orders placed in this session.
        </div>
      )}

      {error && <div className="rounded-xl px-4 py-3 text-xs font-bold bg-red-50 text-red-700 border border-red-200">⚠️ {error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center space-y-4 max-w-sm mx-auto">
          <div className="text-5xl">🧾</div>
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">{filtersActive ? 'No orders match' : 'No orders yet'}</h2>
          <p className="text-xs text-stone-500 font-medium leading-relaxed">
            {filtersActive ? 'Try loosening the filters or clearing the search.' : 'Your first order will appear here as soon as you place it.'}
          </p>
          {filtersActive
            ? <button onClick={() => setFilters(EMPTY_FILTERS)} className="px-6 py-3 bg-neutral-900 hover:bg-amber-600 text-white font-black text-xs tracking-widest uppercase rounded-full cursor-pointer transition-colors">Clear filters</button>
            : <button onClick={() => navigate('/menu')} className="px-6 py-3 bg-neutral-900 hover:bg-amber-600 text-white font-black text-xs tracking-widest uppercase rounded-full cursor-pointer transition-colors">Explore the menu</button>}
        </div>
      ) : (
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">{orders.length} order{orders.length === 1 ? '' : 's'}</p>

          {orders.map((order) => {
            const units = order.items.reduce((sum, i) => sum + i.qty, 0);
            const isNew = order.orderno === highlight;
            return (
              <details key={order._id} open={isNew} className={`rounded-2xl border bg-white shadow-xs overflow-hidden ${isNew ? 'border-amber-500 ring-2 ring-amber-200' : 'border-stone-200'}`}>
                <summary className="cursor-pointer list-none p-4 flex flex-wrap items-center justify-between gap-3 select-none">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-neutral-900">{order.orderno}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider rounded px-2 py-0.5 ${STATUS_STYLES[order.order_status] || 'bg-stone-100 text-stone-700'}`}>{order.order_status}</span>
                      {isNew && <span className="text-[9px] font-black uppercase tracking-wider rounded px-2 py-0.5 bg-amber-600 text-white">New</span>}
                    </div>
                    <p className="text-[11px] font-medium text-stone-500">{when(order.createdAt)} · {units} item{units === 1 ? '' : 's'}</p>
                    <p className="text-[11px] text-stone-400 truncate max-w-xl">{order.items.map((i) => `${i.qty}× ${i.productName}`).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-neutral-900">{money(order.finalPrice)}</p>
                    {order.discountApplied > 0 && <p className="text-[10px] font-bold text-emerald-700">saved {money(order.discountApplied)}</p>}
                  </div>
                </summary>

                <div className="border-t border-stone-100 bg-stone-50/60 p-4 space-y-4">
                  <ul className="space-y-3">
                    {order.items.map((item, idx) => (
                      <li key={`${item.itemid}-${idx}`} className="flex justify-between gap-4">
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-black uppercase tracking-wide text-neutral-900">{item.qty}× {item.productName}</p>
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {recipeLines(item, names).map(([label, value]) => `${label}: ${value}`).join(' · ')}
                          </p>
                        </div>
                        <span className="text-xs font-black text-neutral-900 shrink-0">{money(item.itemTotal)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-dashed border-stone-300 pt-3 space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-stone-600"><span>Subtotal</span><span>{money(order.cartTotal)}</span></div>
                    {order.couponApplied && (
                      <div className="flex justify-between font-bold text-emerald-700"><span>Deal {order.couponApplied}</span><span>{order.discountApplied > 0 ? `− ${money(order.discountApplied)}` : 'applied'}</span></div>
                    )}
                    {(order.freeItems || []).map((name) => (
                      <div key={name} className="flex justify-between font-bold text-emerald-700"><span>🎁 Free: {name}</span><span>₹0</span></div>
                    ))}
                    <div className="flex justify-between font-black text-neutral-900 text-sm pt-1"><span>Total</span><span>{money(order.finalPrice)}</span></div>
                  </div>
                </div>
              </details>
            );
          })}
        </section>
      )}

      <div className="bg-neutral-900 text-white rounded-2xl p-6 space-y-2">
        <h4 className="font-black text-[10px] tracking-widest text-amber-500 uppercase">Need help with an order?</h4>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-2xl">
          Quote your order number to our team if anything looks wrong, or if your order stays on "Pending" longer than expected.
        </p>
      </div>
    </div>
  );
}
