// backend/models/Cheese.js
import mongoose from 'mongoose';

const cheeseSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: CH_01, CH_02 etc.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isDairyFree: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Cheese', cheeseSchema);
