// backend/models/Side.js
import mongoose from 'mongoose';

const sideSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: SD_01, SD_02 etc.
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Side', sideSchema);
