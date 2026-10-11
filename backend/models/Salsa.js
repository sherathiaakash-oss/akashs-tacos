// backend/models/Salsa.js
import mongoose from 'mongoose';

const salsaSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: SL_01, SL_02 etc.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Salsa', salsaSchema);
