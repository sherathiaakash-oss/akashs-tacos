// backend/models/Shell.js
import mongoose from 'mongoose';

const shellSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: SH_01, SH_02 etc.
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  isGlutenFree: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  small_pack_in_stock: { type: Number, required: true, default: 0 },
  regular_pack_in_stock: { type: Number, required: true, default: 0 },
  large_pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Shell', shellSchema);
