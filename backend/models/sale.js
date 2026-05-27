import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  billNo: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  items: [{
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'food' },
    name: String,
    rate: Number,
    qty: Number,
    amount: Number
  }],
  totalAmount: { type: Number, required: true },
  paymentType: { type: String, default: 'cash' }
}, { timestamps: true });

// Index for quick searching by date and bill number
saleSchema.index({ date: 1, billNo: 1 });

export default mongoose.model('sale', saleSchema);