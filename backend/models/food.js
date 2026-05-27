import mongoose from 'mongoose';
import Counter from './counter.js'; // Import the counter model

const foodSchema = new mongoose.Schema({
  itemcode: { type: Number, unique: true }, // Auto-assigned
  name: { type: String, required: true, trim: true, lowercase: true },
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

// ✅ The fix: Wrap the logic in a pre-save hook
foodSchema.pre('save', async function (next) {
  // Only run this logic if the document is new
  if (!this.isNew) {
    return next();
  }

  try {
    const counter = await Counter.findOneAndUpdate(
      { id: 'itemcode' },
      { $inc: { seq: 1 } },
      { 
        returnDocument: 'after', 
        upsert: true 
      }
    );

    // Assign the incremented sequence to our itemcode
    this.itemcode = counter.seq;
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('food', foodSchema);