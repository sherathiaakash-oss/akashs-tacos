// backend/models/Drink.js
import mongoose from 'mongoose';

const drinkSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: DK_01, DK_02 etc.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Drink', drinkSchema);
