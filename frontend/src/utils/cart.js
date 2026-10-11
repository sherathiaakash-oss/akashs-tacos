// frontend/src/utils/cart.js — small helpers shared by Menu, Cart and Orders pages
export const API = '//api';
export const ANON_ID = 'Guest_Workspace_Session';

export const getCartUserId = () => localStorage.getItem('activeUser_id') || ANON_ID;

// Tells the sidebar "My Cart (n)" badge to refresh itself
export const emitCartUpdated = () => window.dispatchEvent(new Event('cart-updated'));

// Items added before signing in live under an anonymous id; move them into the real account's bag.
export async function mergeAnonymousCart() {
  const realId = localStorage.getItem('activeUser_id');
  if (!realId) return;
  try {
    const res = await fetch(`${API}/cart/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from_id: ANON_ID, to_id: realId })
    });
    const data = await res.json();
    if (data.merged > 0) emitCartUpdated();
  } catch { /* offline: ignore */ }
}
