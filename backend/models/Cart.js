// backend/models/Cart.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  itemid: { type: String, required: true }, // ID Marker (e.g. MN_01, SD_02)
  productName: { type: String, required: true },
  category: { type: String, required: true },
  sizeId: { type: String, required: true, default: "SZ_02" },
  sizeMultiplier: { type: Number, required: true, default: 1.2 },
  selectedShells: { type: Map, of: Number, default: {} },
  selectedPantryIngredients: [{ type: String }],
  selectedMealCompanions: [{ type: String }],
  selectedPackets: { type: Map, of: Number, default: {} },
  benefit: { type: Number, required: true, default: 0 },
  unitPrice: { type: Number }, // price of ONE unit; lets a row at qty 0 be restored with +
  qty: { type: Number, required: true, default: 1, min: 0 }, // 🔢 Dynamic quantity tracker column (Supports 0 value state)
  itemTotal: { type: Number, required: true, default: 0 }
});

const cartSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true, index: true },
  items: [cartItemSchema],
  cartTotal: { type: Number, required: true, default: 0 },
  couponApplied: { type: String, default: "" },
  discountApplied: { type: Number, default: 0 },
  freeItems: [{ type: String }], // names of free items granted by a FreeItem deal
  finalPrice: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
