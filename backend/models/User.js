// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  User_id: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNo: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, default: "" }, // 🔐 Added password column back safely!
  is_guest: { type: Boolean, default: false },
  is_admin: { type: Boolean, default: false },
  is_member: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
