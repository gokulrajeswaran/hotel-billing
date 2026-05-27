import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g., "itemcode"
  seq: { type: Number, default: 0 }
});

export default mongoose.model('counter', counterSchema);