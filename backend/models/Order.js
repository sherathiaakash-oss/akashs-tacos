// backend/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderno: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  cartTotal: { type: Number, required: true },
  couponApplied: { type: String, default: "" },
  discountApplied: { type: Number, default: 0 },
  freeItems: [{ type: String }],
  finalPrice: { type: Number, required: true },
  order_status: { type: String, default: "Pending" }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
