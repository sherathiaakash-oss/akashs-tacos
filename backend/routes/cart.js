// backend/routes/cart.js
import express from 'express';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import Side from '../models/Side.js';
import Drink from '../models/Drink.js';
import Dessert from '../models/Dessert.js';
import { configSignature, mapToObject, evaluateDeal, FREE_ITEMS_BY_CODE } from '../utils/cartMath.js';

const router = express.Router();

const plain = (doc) => doc.toObject({ flattenMaps: true });

// Product lookup for sides / drinks / desserts (their price is trusted from the database, not the browser)
async function findDirectProduct(id) {
  if (id.startsWith('SD_')) return Side.findById(id);
  if (id.startsWith('DK_')) return Drink.findById(id);
  if (id.startsWith('DS_')) return Dessert.findById(id);
  return null;
}

async function resolveFreeItems(code) {
  const out = [];
  for (const id of FREE_ITEMS_BY_CODE[code] || []) {
    const row = await findDirectProduct(id);
    if (row) out.push({ id, name: row.name });
  }
  return out;
}

// Re-total the cart and re-validate the applied coupon every time something changes
async function recalc(cart) {
  const total = cart.items.reduce((sum, row) => sum + (row.qty > 0 ? row.itemTotal : 0), 0);
  cart.cartTotal = Math.round(total);
  cart.discountApplied = 0;
  cart.freeItems = [];

  if (cart.couponApplied) {
    const deal = await Deal.findOne({ dealCode: cart.couponApplied });
    const user = await User.findOne({ User_id: cart.user_id });
    const free = deal ? await resolveFreeItems(deal.dealCode) : [];
    const check = evaluateDeal(deal, cart.cartTotal, !!user?.is_member, free);
    if (check.ok) {
      cart.discountApplied = check.discount;
      cart.freeItems = check.freeNames;
    } else {
      cart.couponApplied = ''; // no longer eligible (e.g. minimum order not met any more)
    }
  }
  cart.finalPrice = Math.max(0, cart.cartTotal - cart.discountApplied);
}

const rowSignature = (row) => configSignature({
  itemid: row.itemid,
  sizeId: row.sizeId,
  selectedShells: mapToObject(row.selectedShells),
  selectedPantryIngredients: row.selectedPantryIngredients,
  selectedMealCompanions: row.selectedMealCompanions,
  selectedPackets: mapToObject(row.selectedPackets)
});

// 1. GET /api/cart/:user_id — fetch (or lazily create) the user's cart
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    let cart = await Cart.findOne({ user_id });
    if (!cart) cart = await Cart.create({ user_id, items: [] });
    res.status(200).json(plain(cart));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. POST /api/cart/add — add an item (qty is a +/- delta). Identical configurations merge into one row.
router.post('/add', async (req, res) => {
  try {
    const {
      user_id, itemid, productName, category,
      sizeId = 'SZ_02', sizeMultiplier = 1.2,
      selectedShells = {}, selectedPantryIngredients = [], selectedMealCompanions = [], selectedPackets = {},
      benefit = 0, qty = 1, unitPrice, itemTotal
    } = req.body;

    if (!user_id || !itemid || !productName || !category) {
      return res.status(400).json({ message: 'user_id, itemid, productName and category are required' });
    }
    const delta = Math.trunc(Number(qty));
    if (!delta) return res.status(400).json({ message: 'qty must be a non-zero whole number' });

    let unit = Number(unitPrice ?? itemTotal);
    const direct = await findDirectProduct(itemid);
    if (direct) unit = direct.price; // sides, drinks, desserts: always charge the database price
    if (!Number.isFinite(unit) || unit < 0) return res.status(400).json({ message: 'Invalid price' });

    const cart = (await Cart.findOne({ user_id })) || new Cart({ user_id, items: [] });

    const incoming = {
      itemid, productName, category, sizeId, sizeMultiplier: Number(sizeMultiplier),
      selectedShells, selectedPantryIngredients, selectedMealCompanions, selectedPackets
    };
    const sig = configSignature(incoming);
    const existing = cart.items.find((row) => rowSignature(row) === sig);

    if (existing) {
      existing.qty = Math.max(0, existing.qty + delta);
      existing.unitPrice = unit;
      existing.itemTotal = Math.round(unit * existing.qty);
    } else {
      if (delta < 0) return res.status(400).json({ message: 'That item is not in the bag' });
      cart.items.push({
        ...incoming, benefit: Number(benefit) || 0,
        qty: delta, unitPrice: unit, itemTotal: Math.round(unit * delta)
      });
    }

    await recalc(cart);
    await cart.save();
    res.status(200).json(plain(cart));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. PUT /api/cart/updates-qty — +/- buttons on the cart page
router.put('/update-qty', async (req, res) => {
  try {
    const { user_id, arrayIndex, delta } = req.body;
    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    const row = cart.items[Number(arrayIndex)];
    if (!row) return res.status(404).json({ message: 'Cart row not found' });

    const unit = row.unitPrice ?? (row.qty > 0 ? row.itemTotal / row.qty : 0);
    row.unitPrice = unit;
    row.qty = Math.max(0, row.qty + Math.trunc(Number(delta)));
    row.itemTotal = Math.round(unit * row.qty);

    await recalc(cart);
    await cart.save();
    res.status(200).json(plain(cart));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE /api/cart/remove/:user_id/:arrayIndex — delete a whole row
router.delete('/remove/:user_id/:arrayIndex', async (req, res) => {
  try {
    const { user_id, arrayIndex } = req.params;
    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items.splice(Number(arrayIndex), 1);
    await recalc(cart);
    await cart.save();
    res.status(200).json(plain(cart));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /api/cart/apply-coupon — validate a deal code against the cart and the user
router.post('/apply-coupon', async (req, res) => {
  try {
    const { user_id, dealCode } = req.body;
    const cart = await Cart.findOne({ user_id });
    if (!cart || cart.items.every((r) => r.qty === 0)) return res.status(400).json({ message: 'Your bag is empty' });

    const deal = await Deal.findOne({ dealCode: String(dealCode || '').trim().toUpperCase() });
    if (!deal) return res.status(404).json({ message: 'That deal code does not exist' });

    await recalc(cart); // make sure cartTotal is fresh before checking the minimum
    const user = await User.findOne({ User_id: user_id });
    const free = await resolveFreeItems(deal.dealCode);
    const check = evaluateDeal(deal, cart.cartTotal, !!user?.is_member, free);
    if (!check.ok) return res.status(400).json({ message: check.reason });

    cart.couponApplied = deal.dealCode;
    await recalc(cart);
    await cart.save();
    res.status(200).json(plain(cart));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. POST /api/cart/remove-coupon
router.post('/remove-coupon', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.body.user_id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.couponApplied = '';
    await recalc(cart);
    await cart.save();
    res.status(200).json(plain(cart));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. POST /api/cart/merge — move an anonymous bag into the signed-in user's bag
router.post('/merge', async (req, res) => {
  try {
    const { from_id, to_id } = req.body;
    if (!from_id || !to_id || from_id === to_id) return res.status(400).json({ message: 'Invalid merge request' });

    const source = await Cart.findOne({ user_id: from_id });
    if (!source || source.items.length === 0) return res.status(200).json({ merged: 0 });

    const target = (await Cart.findOne({ user_id: to_id })) || new Cart({ user_id: to_id, items: [] });
    for (const row of source.items) {
      const match = target.items.find((r) => rowSignature(r) === rowSignature(row));
      if (match) {
        match.qty += row.qty;
        match.itemTotal = Math.round((match.unitPrice ?? row.unitPrice ?? 0) * match.qty);
      } else {
        target.items.push(row.toObject());
      }
    }
    await recalc(target);
    await target.save();
    await Cart.deleteOne({ user_id: from_id });
    res.status(200).json({ merged: source.items.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 8. POST /api/cart/checkout — move the bag into the Order + OrderItem tables
router.post('/checkout', async (req, res) => {
  let savedOrder = null;
  try {
    const { user_id } = req.body;
    const user = await User.findOne({ User_id: user_id });
    if (!user) return res.status(401).json({ message: 'Please sign in (or continue as guest) before placing an order' });

    const cart = await Cart.findOne({ user_id });
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Your bag is empty' });

    const checkable = cart.items.filter((row) => row.qty > 0); // qty 0 rows are left out
    if (checkable.length === 0) return res.status(400).json({ message: 'All items are at quantity 0 — nothing to order' });

    await recalc(cart); // final, authoritative totals

    // unique order number
    let orderno = '';
    for (let i = 0; i < 20; i++) {
      const candidate = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      if (!(await Order.exists({ orderno: candidate }))) { orderno = candidate; break; }
    }
    if (!orderno) return res.status(500).json({ message: 'Could not generate an order number, please retry' });

    savedOrder = await Order.create({
      orderno, user_id,
      cartTotal: cart.cartTotal,
      couponApplied: cart.couponApplied,
      discountApplied: cart.discountApplied,
      freeItems: cart.freeItems,
      finalPrice: cart.finalPrice,
      order_status: 'Pending'
    });

    await OrderItem.create({
      orderno,
      items: checkable.map((row) => ({
        itemid: row.itemid, productName: row.productName, category: row.category,
        sizeId: row.sizeId, sizeMultiplier: row.sizeMultiplier,
        selectedShells: row.selectedShells, selectedPantryIngredients: row.selectedPantryIngredients,
        selectedMealCompanions: row.selectedMealCompanions, selectedPackets: row.selectedPackets,
        benefit: row.benefit, unitPrice: row.unitPrice ?? Math.round(row.itemTotal / row.qty),
        qty: row.qty, itemTotal: row.itemTotal
      }))
    });

    cart.items = []; cart.cartTotal = 0; cart.couponApplied = ''; cart.discountApplied = 0; cart.freeItems = []; cart.finalPrice = 0;
    await cart.save();

    res.status(201).json({ success: true, message: 'Order placed successfully!', orderno, finalPrice: savedOrder.finalPrice });
  } catch (error) {
    if (savedOrder) await Order.deleteOne({ _id: savedOrder._id }).catch(() => {}); // roll back half-finished orders
    res.status(500).json({ error: error.message });
  }
});

export default router;
