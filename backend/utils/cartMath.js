// backend/utils/cartMath.js — pure helpers (no database access) so they are easy to test

// FreeItem deals have no item reference in the Deals table, so map deal code -> free product ids here.
export const FREE_ITEMS_BY_CODE = {
  FREEFRY: ['SD_01'],
  LAVABOOST: ['DK_01', 'DS_01'],
  PANEERFREE: ['SD_03'],
  SWEETCHILLI: ['DS_03']
};

const toObj = (v) => {
  if (!v) return {};
  if (v instanceof Map) return Object.fromEntries(v);
  return { ...v };
};

// Two cart rows are "the same configuration" when this string matches.
export function configSignature(row) {
  const sortObj = (o) => Object.fromEntries(Object.entries(toObj(o)).sort(([a], [b]) => a.localeCompare(b)));
  return JSON.stringify({
    id: row.itemid,
    size: row.sizeId || 'SZ_02',
    shells: sortObj(row.selectedShells),
    ing: [...(row.selectedPantryIngredients || [])].sort(),
    comp: [...(row.selectedMealCompanions || [])].sort(),
    packets: sortObj(row.selectedPackets)
  });
}

export const mapToObject = toObj;

// Decide if a deal can be used and how much it takes off.
// freeItems = [{ name }] resolved by the caller for FreeItem deals.
export function evaluateDeal(deal, cartTotal, isMember, freeItems = []) {
  if (!deal || !deal.isActive) return { ok: false, reason: 'This deal is no longer active', discount: 0, freeNames: [] };
  if (deal.for_member && !isMember) return { ok: false, reason: 'This deal is for Taco Club members only', discount: 0, freeNames: [] };
  if (cartTotal < deal.minCartValue) {
    return { ok: false, reason: `Add ₹${deal.minCartValue - cartTotal} more to use this deal`, discount: 0, freeNames: [] };
  }
  let discount = 0;
  let freeNames = [];
  const type = String(deal.discountType || '').toLowerCase();
  if (type.includes('percent')) {
    discount = Math.round((cartTotal * deal.discountValue) / 100);
    if (deal.maxDiscount > 0) discount = Math.min(discount, deal.maxDiscount);
  } else if (type.includes('flat')) {
    discount = deal.discountValue;
    if (deal.maxDiscount > 0) discount = Math.min(discount, deal.maxDiscount);
  } else {
    // Free item: customer receives the item, the bill itself is not reduced
    freeNames = freeItems.length ? freeItems.map((f) => f.name) : [deal.title];
  }
  discount = Math.max(0, Math.min(discount, cartTotal));
  return { ok: true, reason: '', discount, freeNames };
}
