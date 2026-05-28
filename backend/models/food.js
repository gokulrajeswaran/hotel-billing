import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  itemcode: { type: String, required: true, unique: true, trim: true }, // Manually assigned
  nameEnglish: { type: String, required: true, trim: true },
  nameTamil: { type: String, required: true, trim: true }, // Stored as UTF-8; Tamil Unicode U+0B80–U+0BFF
  price: { type: Number, required: true },
  quantity: { type: String, required: true, lowercase: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'category', 
    required: true 
  },
  varieties: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'variety' 
  }]
}, { timestamps: true });

export default mongoose.model('food', foodSchema);