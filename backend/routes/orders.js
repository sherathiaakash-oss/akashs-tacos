// backend/routes/orders.js
import express from 'express';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/orders/:user_id?q=&status=&from=&to=&min=&max=&sort=newest|oldest|high|low
// Search / filter options are only honoured for registered Taco Club members.
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ User_id: user_id });
    const isMember = !!user?.is_member;
    const { q = '', status = '', from = '', to = '', min = '', max = '', sort = 'newest' } = req.query;

    const filter = { user_id };
    if (isMember) {
      if (status && status !== 'All') filter.order_status = status;
      if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(`${from}T00:00:00`);
        if (to) filter.createdAt.$lte = new Date(`${to}T23:59:59.999`);
      }
      if (min !== '' || max !== '') {
        filter.finalPrice = {};
        if (min !== '') filter.finalPrice.$gte = Number(min);
        if (max !== '') filter.finalPrice.$lte = Number(max);
      }
    }

    const orders = await Order.find(filter).lean();
    const itemDocs = await OrderItem.find({ orderno: { $in: orders.map((o) => o.orderno) } }).lean();
    const itemsByOrder = Object.fromEntries(itemDocs.map((d) => [d.orderno, d.items]));

    let result = orders.map((o) => ({ ...o, items: itemsByOrder[o.orderno] || [] }));

    const needle = String(q).trim().toLowerCase();
    if (isMember && needle) {
      result = result.filter((o) =>
        o.orderno.toLowerCase().includes(needle) ||
        o.items.some((i) => i.productName.toLowerCase().includes(needle))
      );
    }

    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      high: (a, b) => b.finalPrice - a.finalPrice,
      low: (a, b) => a.finalPrice - b.finalPrice
    };
    result.sort(sorters[sort] || sorters.newest);

    const statuses = await Order.distinct('order_status', { user_id });
    res.status(200).json({ isMember, total: result.length, statuses, orders: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
