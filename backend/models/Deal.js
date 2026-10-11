// backend/models/Deal.js
import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: DL_01 to DL_08
  dealCode: { type: String, required: true, unique: true },
  title: { type: String, required: true }, // Tracks direct visual symbols like 💳, 🍟, 💰
  subtitle: { type: String, required: true },
  discountType: { type: String, required: true },
  discountValue: { type: Number, required: true, default: 0 },
  minCartValue: { type: Number, required: true, default: 0 },
  maxDiscount: { type: Number, required: true, default: 0 },
  for_member: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Deal', dealSchema);
