// backend/models/Size.js
import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: SZ_01, SZ_02 etc.
  name: { type: String, required: true },
  multiplier: { type: Number, required: true, default: 1.0 },
  inStock: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Size', sizeSchema);
