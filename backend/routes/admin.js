// backend/routes/admin.js — generic CRUD for every table, driven by each model's schema
import express from 'express';
import Shell from '../models/Shell.js';
import Size from '../models/Size.js';
import Protein from '../models/Protein.js';
import Cheese from '../models/Cheese.js';
import Sauce from '../models/Sauce.js';
import Salsa from '../models/Salsa.js';
import Topping from '../models/Topping.js';
import Side from '../models/Side.js';
import Drink from '../models/Drink.js';
import Dessert from '../models/Dessert.js';
import SideAndExtra from '../models/SideAndExtra.js';
import MenuItem from '../models/MenuItem.js';
import Deal from '../models/Deal.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import { describeSchema, coerceBody, nextSequentialId, sendError, HttpError } from '../utils/adminSchema.js';

const router = express.Router();

// key -> model, screen label, group, and the ID prefix used for the sequential "next ID" suggestion
const TABLES = {
  shells:        { Model: Shell,        label: 'Shells',            group: 'Pantry',              prefix: 'SH' },
  sizes:         { Model: Size,         label: 'Sizes',             group: 'Pantry',              prefix: 'SZ' },
  proteins:      { Model: Protein,      label: 'Proteins',          group: 'Pantry',              prefix: 'PR' },
  cheeses:       { Model: Cheese,       label: 'Cheeses',           group: 'Pantry',              prefix: 'CH' },
  sauces:        { Model: Sauce,        label: 'Sauces',            group: 'Pantry',              prefix: 'SC' },
  salsas:        { Model: Salsa,        label: 'Salsas',            group: 'Pantry',              prefix: 'SL' },
  toppings:      { Model: Topping,      label: 'Toppings',          group: 'Pantry',              prefix: 'TP' },
  sideandextras: { Model: SideAndExtra, label: 'Sauce Packets (Sides & Extras)', group: 'Pantry', prefix: 'SE' },
  sides:         { Model: Side,         label: 'Sides',             group: 'Menu',                prefix: 'SD' },
  drinks:        { Model: Drink,        label: 'Drinks',            group: 'Menu',                prefix: 'DK' },
  desserts:      { Model: Dessert,      label: 'Desserts',          group: 'Menu',                prefix: 'DS' },
  menuitems:     { Model: MenuItem,     label: 'Menu Items',        group: 'Menu',                prefix: 'MN' },
  deals:         { Model: Deal,         label: 'Deals',             group: 'Menu',                prefix: 'DL' },
  users:         { Model: User,         label: 'Users',             group: 'Customers & Orders',  prefix: 'US' },
  carts:         { Model: Cart,         label: 'Carts',             group: 'Customers & Orders',  prefix: 'CT' },
  orders:        { Model: Order,        label: 'Orders',            group: 'Customers & Orders',  prefix: 'OR' },
  orderitems:    { Model: OrderItem,    label: 'Order Items',       group: 'Customers & Orders',  prefix: 'OI' }
};

// Customer data is never readable without admin rights. Menu data stays public because the menu page reads it.
const PRIVATE_READ = new Set(['users', 'carts', 'orders', 'orderitems']);

// NOTE: this checks the claimed User_id against the database. It is a gate, not real authentication
// (anyone who knows an admin's User_id could send it). Add password hashing + tokens before going live.
async function requireAdmin(req, res, next) {
  try {
    const id = req.get('x-admin-id');
    const admin = id ? await User.findOne({ User_id: id, is_admin: true }).select('_id') : null;
    if (!admin) return res.status(403).json({ message: 'Admin access required. Please sign in as an administrator.' });
    next();
  } catch (error) { sendError(res, error); }
}

function withTable(req, res, next) {
  const key = String(req.params.table || '').toLowerCase();
  const meta = TABLES[key];
  if (!meta) return res.status(404).json({ message: 'Collection table not discovered' });
  req.tableKey = key;
  req.meta = meta;
  next();
}

const maskRow = (row) => (row.password !== undefined ? { ...row, password: row.password ? '••••••' : '' } : row);

// GET /api/admin/tables — table list with row counts (for the dashboard picker)
router.get('/tables', requireAdmin, async (req, res) => {
  try {
    const list = await Promise.all(Object.entries(TABLES).map(async ([key, t]) => ({
      key, label: t.label, group: t.group, count: await t.Model.estimatedDocumentCount()
    })));
    res.status(200).json(list);
  } catch (error) { sendError(res, error); }
});

// GET /api/admin/:table/schema — field definitions + suggested next ID
router.get('/:table/schema', requireAdmin, withTable, async (req, res) => {
  try {
    const { Model, label, prefix } = req.meta;
    const { customId, fields } = describeSchema(Model);
    res.status(200).json({
      table: req.tableKey, label, customId, prefix, fields,
      nextId: customId ? await nextSequentialId(Model, prefix) : null
    });
  } catch (error) { sendError(res, error); }
});

// GET /api/admin/:table — read every row
router.get('/:table', withTable, (req, res, next) => (PRIVATE_READ.has(req.tableKey) ? requireAdmin(req, res, next) : next()), async (req, res) => {
  try {
    const { Model } = req.meta;
    const objectIds = Model.schema.path('_id').instance === 'ObjectId';
    const rows = await Model.find({}).sort({ _id: objectIds ? -1 : 1 }).limit(2000).lean();
    res.status(200).json(rows.map(maskRow));
  } catch (error) { sendError(res, error); }
});

// POST /api/admin/:table — insert a new row
router.post('/:table', requireAdmin, withTable, async (req, res) => {
  try {
    const { Model, label, prefix } = req.meta;
    const { customId, fields } = describeSchema(Model);
    const data = coerceBody(fields, req.body || {}, false);

    if (customId) {
      let id = String(req.body?._id ?? '').trim();
      if (!id) id = await nextSequentialId(Model, prefix);
      if (!/^[A-Za-z0-9_\-]+$/.test(id)) throw new HttpError(400, 'ID may only contain letters, numbers, _ and -');
      if (await Model.exists({ _id: id })) throw new HttpError(409, `ID ${id} already exists in ${label}`);
      data._id = id;
    }

    const doc = await Model.create(data);
    res.status(201).json(maskRow(doc.toObject({ flattenMaps: true })));
  } catch (error) { sendError(res, error); }
});

// PUT /api/admin/:table/:id — update any fields of a row (the ID itself is the record key and stays fixed)
router.put('/:table/:id', requireAdmin, withTable, async (req, res) => {
  try {
    const { Model } = req.meta;
    const { fields } = describeSchema(Model);
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new HttpError(404, 'That record no longer exists');

    doc.set(coerceBody(fields, req.body || {}, true));
    await doc.save();
    res.status(200).json(maskRow(doc.toObject({ flattenMaps: true })));
  } catch (error) { sendError(res, error); }
});

// DELETE /api/admin/:table/:id — remove a row
router.delete('/:table/:id', requireAdmin, withTable, async (req, res) => {
  try {
    const removed = await req.meta.Model.findByIdAndDelete(req.params.id);
    if (!removed) throw new HttpError(404, 'That record no longer exists');
    res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) { sendError(res, error); }
});

export default router;
