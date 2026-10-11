// backend/models/Dessert.js
import mongoose from 'mongoose';

const dessertSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: DS_01, DS_02 etc.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Dessert', dessertSchema);
