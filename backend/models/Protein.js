// backend/models/Protein.js
import mongoose from 'mongoose';

const proteinSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: PR_01, PR_02 etc.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isVegan: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Protein', proteinSchema);
