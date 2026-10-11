// backend/models/MenuItem.js
// 📋 Mapped directly to Table 12: MenuItem Table (Dynamic Cost Calculation Engine)
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
  }, // Explicit Custom Unique Item Handlers (MN_01 through MN_30)
  productName: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  }, // Encodes structural visual status anchors (e.g., "🌮 SOFT SHELL TACO SELECTION")
  benefit: {
    type: Number,
    required: true,
    default: 0
  }, // 💰 The profit protection markdown modifier variable
  linked_ingredients: [{ 
    type: String, 
    required: true 
  }] // Relational string reference matrices pointing to your distinct individual sub-tables
}, { timestamps: true });

export default mongoose.model('MenuItem', menuItemSchema);
