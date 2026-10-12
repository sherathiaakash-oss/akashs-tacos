import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, getCartUserId, emitCartUpdated, mergeAnonymousCart } from '../utils/cart';
import { dealImageCandidates, dealEmoji } from '../utils/dealImages';

const SIZE_LABELS = { SZ_01: 'Small', SZ_02: 'Regular', SZ_03: 'Large' };

// Readable recipe lines for one bag row (ids -> names via /api/menu/names)
function recipeLines(item, names) {
  const nm = (id) => names[id] || id;
  const lines = [];
  lines.push(['Size', SIZE_LABELS[item.sizeId] || item.sizeId]);
  const shells = Object.entries(item.selectedShells || {});
  if (shells.length) lines.push(['Shells', shells.map(([id, q]) => `${q}× ${nm(id)}`).join(', ')]);
  if ((item.selectedPantryIngredients || []).length) lines.push(['Fillings', item.selectedPantryIngredients.map(nm).join(', ')]);
  if ((item.selectedMealCompanions || []).length) lines.push(['Meal extras', item.selectedMealCompanions.map(nm).join(', ')]);
  const packets = Object.entries(item.selectedPackets || {});
  if (packets.length) lines.push(['Packets', packets.map(([id, q]) => `${q}× ${nm(id)}`).join(', ')]);
  return lines;
}

// Deal banner (square). Shows the deal's own image, or a placeholder until its image file exists.
function DealImage({ deal }) {
  const sources = dealImageCandidates(deal.title);
  const [attempt, setAttempt] = useState(0);

  if (attempt >= sources.length) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-600 flex flex-col items-center justify-center text-white text-center p-2">
        <span className="text-4xl leading-none">{dealEmoji(deal.title)}</span>
        <span className="mt-2 text-[9px] font-black uppercase tracking-widest opacity-90 break-all">{deal.dealCode}</span>
      </div>
    );
  }
  return (
    <img
      key={sources[attempt]}
      src={sources[attempt]}
      alt={deal.title}
      className="w-full h-full object-cover"
      onError={() => setAttempt((n) => n + 1)}
    />
  );
}

function describeDeal(d) {
  const type = String(d.discountType).toLowerCase();
  if (type.includes('percent')) return `${d.discountValue}% off${d.maxDiscount ? ` (up to ₹${d.maxDiscount})` : ''}`;
  if (type.includes('flat')) return `Flat ₹${d.discountValue} off`;
  return 'Free item';
}

export default function CartPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('activeUser_id');
  const isMember = localStorage.getItem('is_member') === 'true';

  const [cart, setCart] = useState({ items: [], cartTotal: 0, discountApplied: 0, finalPrice: 0, couponApplied: '', freeItems: [] });
  const [deals, setDeals] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [message, setMessage] = useState(null); // { text, type }
  const [placedOrder, setPlacedOrder] = useState(null); // { orderno, finalPrice }
  const msgTimer = useRef(null);

  const flash = (text, type = 'error') => {
    setMessage({ text, type });
    clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMessage(null), 3500);
  };

  const loadCart = useCallback(async () => {
    try {
      const res = await fetch(`${API}/cart/${getCartUserId()}`);
      const data = await res.json();
      if (data && Array.isArray(data.items)) setCart(data);
    } catch {
      flash('Cannot reach the server. Is the backend running?');
    }
  }, []);

  useEffect(() => {
    (async () => {
      await mergeAnonymousCart();
      await Promise.all([
        loadCart(),
        fetch(`${API}/deals`).then((r) => r.json()).then((d) => Array.isArray(d) && setDeals(d)).catch(() => {}),
        fetch(`${API}/menu/names`).then((r) => r.json()).then(setNames).catch(() => {})
      ]);
      setLoading(false);
    })();
  }, [loadCart]);

  // generic call helper: updates the cart from the response, or shows the server's message
  const callCart = async (path, options) => {
    if (busy) return null;
    setBusy(true);
    try {
      const res = await fetch(`${API}/cart/${path}`, options);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash(data.message || data.error || 'Something went wrong');
        return null;
      }
      if (Array.isArray(data.items)) setCart(data);
      emitCartUpdated();
      return data;
    } catch {
      flash('Cannot reach the server. Is the backend running?');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const changeQty = (index, delta) =>
    callCart('update-qty', json('PUT', { user_id: getCartUserId(), arrayIndex: index, delta }));

  const removeRow = (index) =>
    callCart(`remove/${getCartUserId()}/${index}`, { method: 'DELETE' });

  const applyDeal = async (code) => {
    const data = await callCart('apply-coupon', json('POST', { user_id: getCartUserId(), dealCode: code }));
    if (data) { setCouponInput(''); flash(`Deal ${code} applied`, 'ok'); }
  };

  const removeDeal = () => callCart('remove-coupon', json('POST', { user_id: getCartUserId() }));

  const checkout = async () => {
    if (!userId) { navigate('/auth'); return; }
    const data = await callCart('checkout', json('POST', { user_id: userId }));
    if (data?.orderno) {
      setPlacedOrder({ orderno: data.orderno, finalPrice: data.finalPrice });
      loadCart();
    }
  };

  const activeRows = cart.items.filter((i) => i.qty > 0);
  const itemCount = activeRows.reduce((sum, i) => sum + i.qty, 0);

  const dealStatus = (d) => {
    if (d.for_member && !isMember) return { ok: false, reason: 'Taco Club members only' };
    if (cart.cartTotal < d.minCartValue) return { ok: false, reason: `Add ₹${d.minCartValue - cart.cartTotal} more` };
    return { ok: true, reason: '' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="text-xs font-black tracking-widest text-stone-400 uppercase">Syncing your bag...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-stone-200/60 pb-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">My Selection Bag</h1>
          <div className="w-12 h-1 bg-amber-600 rounded-full"></div>
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-stone-400">{itemCount} item{itemCount === 1 ? '' : 's'}</span>
      </div>

      {/* inline message */}
      {message && (
        <div className={`rounded-xl px-4 py-3 text-xs font-bold ${message.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'ok' ? '✅ ' : '⚠️ '}{message.text}
        </div>
      )}

      {/* sign-in notice */}
      {!userId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs font-semibold text-amber-800 leading-relaxed max-w-xl">
            <strong className="block font-black text-[10.5px] uppercase tracking-wider mb-0.5">Sign in to place your order</strong>
            You can build your bag without an account. To check out, sign in as a member or continue as a guest. Your bag will move with you.
          </div>
          <button onClick={() => navigate('/auth')} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-[10.5px] tracking-widest uppercase rounded-md cursor-pointer">Sign in →</button>
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-sm mx-auto">
          <div className="text-5xl">🛍️</div>
          <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">Your bag is empty</h2>
          <p className="text-xs text-stone-500 font-medium">Add a taco, a meal box or a side from the menu and it will show up here.</p>
          <button onClick={() => navigate('/menu')} className="px-6 py-3 bg-neutral-900 hover:bg-amber-600 text-white font-black text-xs tracking-widest uppercase rounded-full cursor-pointer transition-colors">Browse the menu</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
          {/* ---------- LEFT: items + deals ---------- */}
          <div className="space-y-8 min-w-0">
            <section className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-400">Items in your bag</h2>
              {cart.items.map((item, index) => {
                const active = item.qty > 0;
                const unit = item.unitPrice ?? (active ? Math.round(item.itemTotal / item.qty) : 0);
                const lines = recipeLines(item, names);
                const customized = lines.length > 1;
                return (
                  <div key={`${item.itemid}-${index}`} className={`rounded-2xl border p-4 flex gap-4 transition ${active ? 'bg-white border-stone-200 shadow-xs' : 'bg-stone-50 border-dashed border-stone-300 opacity-70'}`}>
                    <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center text-2xl">
                      <img src={`/images/menu/${item.productName}.webp`} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 truncate">{item.category}</p>
                          <h3 className="text-sm font-black uppercase tracking-wide text-neutral-900 leading-snug">{item.productName}</h3>
                        </div>
                        <button onClick={() => removeRow(index)} disabled={busy} aria-label="Delete item" className="text-stone-300 hover:text-red-500 text-lg leading-none cursor-pointer transition">🗑</button>
                      </div>

                      {customized && (
                        <details className="text-[11px] text-stone-600">
                          <summary className="cursor-pointer font-black uppercase tracking-wider text-[10px] text-amber-700 select-none">View recipe</summary>
                          <ul className="mt-1.5 space-y-0.5">
                            {lines.map(([label, value]) => (
                              <li key={label}><span className="font-black text-stone-500">{label}:</span> {value}</li>
                            ))}
                          </ul>
                        </details>
                      )}

                      {!active && <p className="text-[10px] font-black uppercase tracking-wider text-stone-500">Quantity 0: left out of this order</p>}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-1 bg-neutral-900 rounded-full p-1">
                          <button onClick={() => changeQty(index, -1)} disabled={busy || !active} aria-label="Decrease" className="w-7 h-7 flex items-center justify-center bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-[16px] leading-none rounded-full cursor-pointer active:scale-90 transition">−</button>
                          <span className="min-w-[30px] text-center text-[14px] font-black text-white">{item.qty}</span>
                          <button onClick={() => changeQty(index, 1)} disabled={busy} aria-label="Increase" className="w-7 h-7 flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white font-black text-[16px] leading-none rounded-full cursor-pointer active:scale-90 transition">+</button>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-neutral-900">₹{item.itemTotal}</p>
                          {item.qty > 1 && <p className="text-[10px] font-bold text-stone-400">₹{unit} each</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Deals from the Deals table */}
            <section className="space-y-3">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-stone-400">Deals for you</h2>
              {deals.length === 0 ? (
                <p className="text-xs text-stone-400 font-medium">No active deals right now.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {deals.map((d) => {
                    const applied = cart.couponApplied === d.dealCode;
                    const st = dealStatus(d);
                    return (
                      <div key={d._id} className={`rounded-2xl border overflow-hidden flex ${applied ? 'border-emerald-400 bg-emerald-50' : 'border-stone-200 bg-white'}`}>
                        {/* image slot: ~1/3 of the card, always square so the baked-in banner text is never cropped */}
                        <div className="w-[34%] min-w-[7rem] max-w-[13rem] shrink-0 self-start p-3">
                          <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 shadow-xs">
                            <DealImage deal={d} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 p-4 pl-1 flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <h3 className="text-[12px] font-black leading-snug text-neutral-900">{d.title}</h3>
                          <p className="text-[11px] font-medium text-stone-500 leading-relaxed">{d.subtitle}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[9px] font-black uppercase tracking-wider bg-neutral-900 text-white rounded px-2 py-0.5">{d.dealCode}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 rounded px-2 py-0.5">{describeDeal(d)}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-stone-100 text-stone-600 rounded px-2 py-0.5">Min ₹{d.minCartValue}</span>
                          </div>
                        </div>
                        {applied ? (
                          <button onClick={removeDeal} disabled={busy} className="w-full py-2 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition">✓ Applied · Remove</button>
                        ) : st.ok ? (
                          <button onClick={() => applyDeal(d.dealCode)} disabled={busy} className="w-full py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-neutral-900 hover:bg-amber-600 text-white cursor-pointer transition">Apply deal</button>
                        ) : (
                          <button disabled className="w-full py-2 text-[10px] font-black uppercase tracking-widest rounded-full bg-stone-100 text-stone-400 cursor-not-allowed">{st.reason}</button>
                        )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ---------- RIGHT: summary ---------- */}
          <aside className="xl:sticky xl:top-6 rounded-2xl border border-stone-200 bg-white shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-neutral-900">Order summary</h2>

            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => { if (e.key === 'Enter' && couponInput) applyDeal(couponInput); }}
                placeholder="Have a code?"
                className="flex-1 min-w-0 px-3 py-2 text-xs font-bold tracking-wider uppercase border border-stone-300 rounded-lg outline-none focus:border-amber-600"
              />
              <button onClick={() => couponInput && applyDeal(couponInput)} disabled={busy || !couponInput} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-neutral-900 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg cursor-pointer transition">Apply</button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-semibold text-stone-600"><span>Subtotal</span><span>₹{cart.cartTotal}</span></div>
              {cart.couponApplied && cart.discountApplied > 0 && (
                <div className="flex justify-between font-bold text-emerald-700"><span>Deal {cart.couponApplied}</span><span>− ₹{cart.discountApplied}</span></div>
              )}
              {(cart.freeItems || []).map((name) => (
                <div key={name} className="flex justify-between font-bold text-emerald-700 text-xs"><span>🎁 Free: {name}</span><span>₹0</span></div>
              ))}
              <div className="flex justify-between items-baseline border-t border-dashed border-stone-300 pt-3">
                <span className="text-xs font-black uppercase tracking-widest text-stone-500">To pay</span>
                <span className="text-2xl font-black text-neutral-900">₹{cart.finalPrice}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={busy || activeRows.length === 0}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-full shadow-md cursor-pointer transition active:scale-95"
            >
              {userId ? 'Place order →' : 'Sign in to order →'}
            </button>
            {activeRows.length === 0 && <p className="text-[10px] text-center font-bold text-stone-400 uppercase tracking-wider">Raise a quantity above 0 to order</p>}
          </aside>
        </div>
      )}

      {/* ---------- ORDER PLACED: order number in the middle of the screen ---------- */}
      {placedOrder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-5">
            <div className="text-6xl">🎉</div>
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900">Order placed!</h2>
              <p className="text-xs font-medium text-stone-500">Thank you. The kitchen is on it. Keep this number handy:</p>
            </div>
            <div className="bg-neutral-900 rounded-2xl py-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Your order number</p>
              <p className="text-3xl font-black tracking-wider text-white font-mono">{placedOrder.orderno}</p>
            </div>
            <p className="text-sm font-bold text-stone-600">Order total: ₹{placedOrder.finalPrice}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/orders', { state: { orderno: placedOrder.orderno } })} className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] uppercase tracking-widest rounded-full cursor-pointer transition">View my orders</button>
              <button onClick={() => { setPlacedOrder(null); navigate('/menu'); }} className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-neutral-900 font-black text-[11px] uppercase tracking-widest rounded-full cursor-pointer transition">Back to menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
