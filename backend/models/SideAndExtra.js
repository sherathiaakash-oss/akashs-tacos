// backend/models/SideAndExtra.js
import mongoose from 'mongoose';

const sideAndExtraSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Explicit Custom Handlers: SE_01, SE_02 etc.
  name: { type: String, required: true },
  itemType: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  inStock: { type: Boolean, default: true },
  pack_in_stock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('SideAndExtra', sideAndExtraSchema);
