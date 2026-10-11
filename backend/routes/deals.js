// backend/routes/deals.js
import express from 'express';
import Deal from '../models/Deal.js';

const router = express.Router();

// GET /api/deals — every active deal for the cart page
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find({ isActive: true }).sort({ _id: 1 }).lean();
    res.status(200).json(deals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
