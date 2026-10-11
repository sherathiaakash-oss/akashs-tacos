// backend/models/OrderItem.js
import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema({
  itemid: { type: String, required: true },
  productName: { type: String, required: true },
  category: { type: String, required: true },
  sizeId: { type: String, required: true },
  sizeMultiplier: { type: Number, required: true },
  selectedShells: { type: Map, of: Number, default: {} },
  selectedPantryIngredients: [{ type: String }],
  selectedMealCompanions: [{ type: String }],
  selectedPackets: { type: Map, of: Number, default: {} },
  benefit: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number },
  qty: { type: Number, required: true, min: 1 }, // 🛑 Enforced baseline constraint rule: Minimum quantity must be 1 or higher!
  itemTotal: { type: Number, required: true }
});

const orderItemSchema = new mongoose.Schema({
  orderno: { type: String, required: true, index: true },
  items: [orderItemSnapshotSchema] // Immutable snapshot recipe logs compiled at moment of checkout
}, { timestamps: true });

export default mongoose.model('OrderItem', orderItemSchema);
