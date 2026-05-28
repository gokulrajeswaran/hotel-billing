import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  itemcode: { type: String, required: true, unique: true, trim: true },
  nameEnglish: { type: String, required: true, trim: true },
  nameTamil: { type: String, required: true, trim: true },
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
  }],
  // Per-variety pricing: [{ varietyId, price }]
  varietyPrices: [{
    variety: { type: mongoose.Schema.Types.ObjectId, ref: 'variety' },
    price: { type: Number, required: true }
  }]
}, { timestamps: true });

export default mongoose.model('food', foodSchema);
